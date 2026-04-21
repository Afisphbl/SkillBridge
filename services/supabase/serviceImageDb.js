import { supabase } from "./client";

const now = () => new Date().toISOString();
const BUCKET = "serviceImages";

function toPublicUrl(pathOrUrl) {
  if (typeof pathOrUrl !== "string") return "";

  const trimmed = pathOrUrl.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(trimmed);
  return data.publicUrl;
}

function normalizeGalleryUrls(galleryUrls) {
  if (!Array.isArray(galleryUrls)) return [];

  return galleryUrls
    .map((entry) => toPublicUrl(entry))
    .filter((entry) => Boolean(entry));
}

/**
 * Update both thumbnail + gallery
 */
export async function updateServiceImages(
  serviceId,
  thumbnailUrl,
  galleryUrls = [],
) {
  const normalizedThumbnailUrl = toPublicUrl(thumbnailUrl);
  const normalizedGalleryUrls = normalizeGalleryUrls(galleryUrls);

  const { data, error } = await supabase
    .from("services")
    .update({
      thumbnail_url: normalizedThumbnailUrl,
      gallery_urls: normalizedGalleryUrls,
      updated_at: now(),
    })
    .eq("id", serviceId)
    .select()
    .single();

  return { data, error };
}

/**
 * Update only thumbnail
 */
export async function updateThumbnail(serviceId, thumbnailUrl) {
  const normalizedThumbnailUrl = toPublicUrl(thumbnailUrl);

  const { data, error } = await supabase
    .from("services")
    .update({
      thumbnail_url: normalizedThumbnailUrl,
      updated_at: now(),
    })
    .eq("id", serviceId)
    .select()
    .single();

  return { data, error };
}

/**
 * Update only gallery
 */
export async function updateGallery(serviceId, galleryUrls = []) {
  const normalizedGalleryUrls = normalizeGalleryUrls(galleryUrls);

  const { data, error } = await supabase
    .from("services")
    .update({
      gallery_urls: normalizedGalleryUrls,
      updated_at: now(),
    })
    .eq("id", serviceId)
    .select()
    .single();

  return { data, error };
}
