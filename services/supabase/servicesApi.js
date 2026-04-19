import { supabase } from "./client";

const now = () => new Date().toISOString();

/**
 * Get all active services
 */
export async function getServices() {
  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return { services, error };
}

/**
 * Get seller services
 */
export async function getSellerServices(sellerId) {
  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  return { services, error };
}

/**
 * Get single service
 */
export async function getServiceById(serviceId) {
  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .single();

  return { service, error };
}

/**
 * Paginated services
 */
export async function getServicesPaginated(page = 1, limit = 9) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const {
    data: services,
    error,
    count,
  } = await supabase
    .from("services")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .range(from, to)
    .order("created_at", { ascending: false });

  return { services, error, count };
}

/**
 * Search services
 */
export async function searchServices(searchTerm) {
  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("status", "active")
    .or(
      `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`,
    );

  return { services, error };
}

/**
 * Filter by category
 */
export async function getServicesByCategory(category) {
  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("category", category)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return { services, error };
}

/**
 * Create service
 */
export async function createService(payload) {
  const { data: service, error } = await supabase
    .from("services")
    .insert([{ ...payload, created_at: now() }])
    .select()
    .single();

  return { service, error };
}

/**
 * Update service
 */
export async function updateService(serviceId, updates) {
  const { data: service, error } = await supabase
    .from("services")
    .update({
      ...updates,
      updated_at: now(),
    })
    .eq("id", serviceId)
    .select()
    .single();

  return { service, error };
}

/**
 * Change status
 */
export async function updateServiceStatus(serviceId, status) {
  const { data: service, error } = await supabase
    .from("services")
    .update({
      status,
      updated_at: now(),
    })
    .eq("id", serviceId)
    .select()
    .single();

  return { service, error };
}

/**
 * Delete service
 */
export async function deleteService(serviceId) {
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId);

  return { error };
}
