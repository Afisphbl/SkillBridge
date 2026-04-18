import { supabase } from "./client";

const BUCKET_NAME = "profileImages";

/**
 * Upload an avatar to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} userId - The user's ID to unique folder/filename
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export async function uploadAvatar(file, userId) {
  // Validate file
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please upload JPEG, PNG, or WEBP.");
  }

  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    throw new Error("File size too large. Max 2MB allowed.");
  }

  // Generate unique filename: userId_timestamp
  const timestamp = Date.now();
  const fileExt = file.name.split(".").pop();
  const filePath = `avatars/${userId}_${timestamp}.${fileExt}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Get signed URL (1-year expiry as requested)
  return await getSignedAvatarUrl(filePath);
}

/**
 * Delete an avatar from storage
 * @param {string} avatarUrl - The full public URL or filePath
 */
export async function deleteAvatar(avatarUrl) {
  if (!avatarUrl) return;

  // Extract path from URL (works for both public and signed URLs)
  // Format usually: .../profileImages/path/to/file?token=...
  let path = avatarUrl.split(`${BUCKET_NAME}/`).pop()?.split("?")[0];

  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    console.error("Storage deletion error:", error);
    // We don't necessarily want to throw here as the DB update might still be needed
  }
}

/**
 * Create a signed URL for an avatar path
 * @param {string} path - The relative path within the bucket
 * @returns {Promise<string>} - The signed URL
 */
export async function getSignedAvatarUrl(path) {
  if (!path) return null;
  // If it's already a full URL that looks signed, we might still want to re-sign or return it
  // But usually we store the path or the original signed URL.
  // To keep it simple, if it includes "token=", we assume it's already signed and valid (for 1 year!)
  if (path.startsWith("http") && path.includes("token=")) return path;

  // If it's a public URL (old data), extract the path
  const finalPath = path.startsWith("http")
    ? path.split(`${BUCKET_NAME}/`).pop()?.split("?")[0]
    : path;

  if (!finalPath) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(finalPath, 60 * 60 * 24 * 365); // 1 year

  if (error) {
    console.error("Signed URL error:", error);
    return null;
  }

  return data?.signedUrl;
}
