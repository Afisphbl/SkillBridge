import { supabase } from "./client";

const BUCKET = "serviceImages";

function buildServiceImagePath(
  sellerId,
  serviceId,
  prefix,
  sourceName = "image",
  index = 0,
) {
  const safeName = sourceName.replace(/\s/g, "_");
  return `services/${sellerId}/${serviceId}/${prefix}-${Date.now()}-${index}-${safeName}`;
}

function extractStoragePath(pathOrUrl) {
  if (typeof pathOrUrl !== "string") return "";

  const trimmed = pathOrUrl.trim();
  if (!trimmed) return "";

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^\/+/, "");
  }

  try {
    const parsed = new URL(trimmed);
    const marker = `/object/public/${BUCKET}/`;
    const markerIndex = parsed.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return "";
    }

    return decodeURIComponent(
      parsed.pathname.slice(markerIndex + marker.length).replace(/^\/+/, ""),
    );
  } catch {
    return "";
  }
}

function getFileNameFromPath(path) {
  if (!path) return "image";
  const parts = path.split("/").filter(Boolean);
  return parts.at(-1) || "image";
}

/**
 * Upload thumbnail
 */
export async function uploadThumbnail(file, sellerId, serviceId) {
  const safeName = file.name.replace(/\s/g, "_");
  const filePath = `services/${sellerId}/${serviceId}/thumbnail-${Date.now()}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  return {
    path: data?.path,
    error,
  };
}

/**
 * Upload gallery images
 */
export async function uploadGalleryImages(files, sellerId, serviceId) {
  const uploaded = [];
  const errors = [];

  for (const file of files) {
    const safeName = file.name.replace(/\s/g, "_");

    const filePath = `services/${sellerId}/${serviceId}/gallery-${Date.now()}-${safeName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (!error && data?.path) {
      uploaded.push(data.path);
    } else {
      errors.push(error?.message || `Failed uploading ${file.name}`);
    }
  }

  if (errors.length && uploaded.length) {
    const { error: cleanupError } = await supabase.storage
      .from(BUCKET)
      .remove(uploaded);

    if (cleanupError) {
      errors.push(`Cleanup failed: ${cleanupError.message}`);
    }
  }

  return {
    paths: uploaded,
    error: errors.length ? errors.join("; ") : null,
  };
}

export async function duplicateServiceImage(
  sourcePathOrUrl,
  sellerId,
  serviceId,
  prefix = "image",
  index = 0,
) {
  const sourcePath = extractStoragePath(sourcePathOrUrl);
  const sourceName = getFileNameFromPath(sourcePath || sourcePathOrUrl);
  const destinationPath = buildServiceImagePath(
    sellerId,
    serviceId,
    prefix,
    sourceName,
    index,
  );

  if (sourcePath) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .copy(sourcePath, destinationPath);

    if (!error && data?.path) {
      return { path: data.path, error: null };
    }
  }

  let fileForUpload = null;
  let contentType = "application/octet-stream";

  if (sourcePath) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(sourcePath);

    if (error || !data) {
      return {
        path: null,
        error: error?.message || "Failed to copy or download source image",
      };
    }

    fileForUpload = data;
    contentType = data.type || contentType;
  } else if (/^https?:\/\//i.test(sourcePathOrUrl)) {
    try {
      const response = await fetch(sourcePathOrUrl);
      if (!response.ok) {
        return {
          path: null,
          error: `Failed to fetch source image: ${response.status}`,
        };
      }

      const blob = await response.blob();
      fileForUpload = blob;
      contentType = blob.type || contentType;
    } catch (error) {
      return {
        path: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch source image",
      };
    }
  } else {
    return {
      path: null,
      error: "Invalid source image path",
    };
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(destinationPath, fileForUpload, {
      cacheControl: "3600",
      contentType,
      upsert: false,
    });

  return {
    path: data?.path || null,
    error: error?.message || null,
  };
}

export async function duplicateServiceGalleryImages(
  sourcePathsOrUrls,
  sellerId,
  serviceId,
) {
  const uploaded = [];
  const errors = [];

  for (const [index, source] of sourcePathsOrUrls.entries()) {
    const { path, error } = await duplicateServiceImage(
      source,
      sellerId,
      serviceId,
      "gallery",
      index,
    );

    if (error || !path) {
      errors.push(error || `Failed copying gallery image at index ${index}`);
      continue;
    }

    uploaded.push(path);
  }

  if (errors.length && uploaded.length) {
    const { error: cleanupError } = await supabase.storage
      .from(BUCKET)
      .remove(uploaded);

    if (cleanupError) {
      errors.push(`Cleanup failed: ${cleanupError.message}`);
    }
  }

  return {
    paths: uploaded,
    error: errors.length ? errors.join("; ") : null,
  };
}

/**
 * Delete image
 */
export async function deleteImageFromStorage(filePath) {
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);

  return { error };
}

/**
 * Delete all images in a service folder
 */
export async function deleteServiceFolder(sellerId, serviceId) {
  const folderPath = `services/${sellerId}/${serviceId}`;

  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(folderPath);

  if (listError) {
    return { error: listError };
  }

  if (!files || files.length === 0) {
    return { error: null };
  }

  const filePaths = files.map((file) => `${folderPath}/${file.name}`);

  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(filePaths);

  return { error: removeError };
}

/**
 * Get public URL
 */
export function getPublicImageUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return data.publicUrl;
}
