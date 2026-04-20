import { supabase } from "./client";

/**
 * =========================
 * MESSAGES SERVICE (SkillBridge)
 * =========================
 */

// =========================
// 1. GET ALL MESSAGES
// =========================
export const getAllMessages = async () => {
  const { data, error } = await supabase.from("messages").select("*");

  return { data, error };
};

// =========================
// 2. GET MESSAGES BY ORDER
// =========================
export const getMessagesByOrder = async (orderId) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  return { data, error };
};

// =========================
// 3. GET CHAT BETWEEN TWO USERS (FOR AN ORDER)
// =========================
export const getChatMessages = async (orderId, userId1, userId2) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("order_id", orderId)
    .or(
      `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`,
    )
    .order("created_at", { ascending: true });

  return { data, error };
};

// =========================
// 4. PAGINATED MESSAGES
// =========================
export const getMessagesPaginated = async (from = 0, to = 9) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .range(from, to)
    .order("created_at", { ascending: false });

  return { data, error };
};

// =========================
// 5. SEND MESSAGE (INSERT)
// =========================
export const sendMessage = async ({
  order_id,
  sender_id,
  receiver_id,
  message,
  attachments = null,
}) => {
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        order_id,
        sender_id,
        receiver_id,
        message,
        attachments,
        is_read: false,
      },
    ])
    .select();

  return { data, error };
};

// =========================
// 6. MARK MESSAGE AS READ
// =========================
export const markMessageAsRead = async (messageId) => {
  const { data, error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("id", messageId)
    .select();

  return { data, error };
};

// =========================
// 7. MARK ALL MESSAGES AS READ (FOR USER IN ORDER)
// =========================
export const markAllAsRead = async (orderId, userId) => {
  const { data, error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("order_id", orderId)
    .eq("receiver_id", userId)
    .eq("is_read", false)
    .select();

  return { data, error };
};

// =========================
// 8. DELETE MESSAGE
// =========================
export const deleteMessage = async (messageId) => {
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId);

  return { error };
};

// =========================
// 9. FILTER MESSAGES (ADVANCED)
// =========================
export const filterMessages = async ({
  order_id,
  sender_id,
  receiver_id,
  is_read,
}) => {
  let query = supabase.from("messages").select("*");

  if (order_id) query = query.eq("order_id", order_id);
  if (sender_id) query = query.eq("sender_id", sender_id);
  if (receiver_id) query = query.eq("receiver_id", receiver_id);
  if (is_read !== undefined) query = query.eq("is_read", is_read);

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  return { data, error };
};

// =========================
// 10. UNREAD MESSAGE COUNT
// =========================
export const getUnreadCount = async (userId) => {
  const { data, error } = await supabase
    .from("messages")
    .select("id", { count: "exact" })
    .eq("receiver_id", userId)
    .eq("is_read", false);

  return { count: data?.length || 0, error };
};
