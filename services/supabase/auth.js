import { supabase } from "./client";

/** Sign up a new user with email, password, and optional profile metadata */
export async function signUp(
  email,
  password,
  { fullName = "", avatar = "", bio = "" } = {},
) {
  let { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        avatar,
        bio,
      },
    },
  });
  return { data, error };
}

/** Sign in an existing user with email and password */
export async function signIn(email, password) {
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

/** Get the currently authenticated user */
export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Send a password reset email */
export async function resetPassword(email) {
  let { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
}

/** Sign out the current user */
export async function signOut() {
  let { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Update the current user's password, fullName, and/or avatar.
 * - password / fullName → updates Supabase Auth user data
 * - avatar (File)       → uploads to the "avatars" bucket and writes the
 *                         public URL back into user_metadata
 */
export async function updateCurrentUser({ password, fullName, avatar }) {
  // 1. Update password OR fullName
  let updateData;
  if (password) updateData = { password };
  if (fullName) updateData = { data: { fullName } };

  const { data, error } = await supabase.auth.updateUser(updateData);

  if (error) throw new Error(error.message);
  if (!avatar) return data;

  // 2. Upload the avatar image to the "avatars" storage bucket
  const fileName = `${data.user.id}/avatar-${Math.random()}`;

  const { error: storageError } = await supabase.storage
    .from("avatars")
    .upload(fileName, avatar);

  if (storageError) throw new Error(storageError.message);

  // 3. Write the public avatar URL back into user_metadata
  const { data: updatedUser, error: error2 } = await supabase.auth.updateUser({
    data: {
      avatar: `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`,
    },
  });

  if (error2) throw new Error(error2.message);
  return updatedUser;
}
