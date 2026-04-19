import { supabase } from "./client";

const BUCKET = "servicesImage";

/**
 * Upload thumbnail
 */
export async function uploadThumbnail(file, sellerId, serviceId) {
  const filePath = `services/${sellerId}/${serviceId}/thumbnail-${Date.now()}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
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

  for (const file of files) {
    const safeName = file.name.replace(/\s/g, "_");

    const filePath = `services/${sellerId}/${serviceId}/gallery-${Date.now()}-${safeName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (!error && data?.path) {
      uploaded.push(data.path);
    }
  }

  return uploaded;
}

/**
 * Delete image
 */
export async function deleteImageFromStorage(filePath) {
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);

  return { error };
}

/**
 * Get public URL
 */
export function getPublicImageUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return data.publicUrl;
}
