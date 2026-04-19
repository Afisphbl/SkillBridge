import { supabase } from "./client";

/** Fetch all users */
export async function getUsers() {
  let { data: users, error } = await supabase.from("users").select("*");
  return { users, error };
}

/** Fetch a single user by ID */
export async function getUserById(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
}

/** Fetch users by a list of IDs */
export async function getUsersByIds(ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { users: [], error: null };
  }

  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .in("id", ids);

  return { users, error };
}

/** Insert a new user profile record */
export async function insertUser({ id, email, full_name, role, avatar }) {
  const { data, error } = await supabase
    .from("users")
    .insert({ id, email, full_name, role, avatar })
    .select();
  return { data, error };
}

/** Update an existing user profile */
export async function updateUser(userId, { full_name, role, avatar, bio }) {
  const { data, error } = await supabase
    .from("users")
    .update({ full_name, role, avatar, bio })
    .eq("id", userId)
    .select();
  return { data, error };
}

/** Delete a user profile record */
export async function deleteUser(userId) {
  const { error } = await supabase.from("users").delete().eq("id", userId);
  return { error };
}
