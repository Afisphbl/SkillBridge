import { supabase } from "./client";

const now = () => new Date().toISOString();

/**
 * Update both thumbnail + gallery
 */
export async function updateServiceImages(
  serviceId,
  thumbnailUrl,
  galleryUrls = [],
) {
  const { data, error } = await supabase
    .from("services")
    .update({
      thumbnail_url: thumbnailUrl,
      gallery_urls: galleryUrls,
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
  const { data, error } = await supabase
    .from("services")
    .update({
      thumbnail_url: thumbnailUrl,
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
  const { data, error } = await supabase
    .from("services")
    .update({
      gallery_urls: galleryUrls,
      updated_at: now(),
    })
    .eq("id", serviceId)
    .select()
    .single();

  return { data, error };
}
