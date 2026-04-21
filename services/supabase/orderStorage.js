import { supabase } from "./client";

const BUCKET_NAME = "order-deliveries"; // Assume this bucket exists for order files

/**
 * Upload a delivery file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} orderId - The Order ID
 * @returns {Promise<string>} - The public URL or path of the uploaded file
 */
export async function uploadDeliveryFile(file, orderId) {
  const timestamp = Date.now();
  const fileExt = file.name.split(".").pop();
  const filePath = `${orderId}/${timestamp}_${file.name}`;

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      // Fallback to profileImages if order-deliveries doesn't exist (temporary hack for dev)
      if (error.message.includes("not found")) {
        return uploadToFallback(file, orderId);
      }
      throw error;
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error("Upload delivery file error:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

async function uploadToFallback(file, orderId) {
  const FALLBACK_BUCKET = "profileImages";
  const timestamp = Date.now();
  const filePath = `deliveries/${orderId}/${timestamp}_${file.name}`;

  const { error } = await supabase.storage
    .from(FALLBACK_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw new Error(`Fallback upload failed: ${error.message}`);

  const { data } = supabase.storage.from(FALLBACK_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}
