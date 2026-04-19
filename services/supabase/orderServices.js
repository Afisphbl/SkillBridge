import { supabase } from "./client";

/*
========================================
GET ALL ORDERS (with pagination)
========================================
*/

export const getOrders = async (page = 1, limit = 10) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get Orders Error:", error);
      return { success: false, error };
    }

    return {
      success: true,
      orders: data,
    };
  } catch (err) {
    console.error("Unexpected Error:", err);
    return { success: false, error: err };
  }
};

/*
========================================
GET ORDERS WITH FILTERS
========================================
*/

export const getOrdersWithFilters = async ({
  status,
  buyer_id,
  seller_id,
  service_id,
  search,
  page = 1,
  limit = 10,
}) => {
  try {
    let query = supabase.from("orders").select("*");

    if (status) {
      query = query.eq("status", status);
    }

    if (buyer_id) {
      query = query.eq("buyer_id", buyer_id);
    }

    if (seller_id) {
      query = query.eq("seller_id", seller_id);
    }

    if (service_id) {
      query = query.eq("service_id", service_id);
    }

    if (search) {
      query = query.ilike("order_number", `%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await query
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Filter Orders Error:", error);
      return { success: false, error };
    }

    return {
      success: true,
      orders: data,
    };
  } catch (err) {
    console.error("Unexpected Error:", err);
    return { success: false, error: err };
  }
};

/*
========================================
CREATE ORDER (Order Now)
========================================
*/

export const createOrder = async ({
  buyer_id,
  seller_id,
  service_id,
  price,
  requirements,
  delivery_date,
}) => {
  try {
    /*
    ================================
    VALIDATION
    ================================
    */
    console.log("Creating order with:");
    if (!buyer_id || !seller_id || !service_id) {
      return {
        success: false,
        error: { message: "Missing required order fields." },
      };
    }

    /*
    ================================
    PRICE VALIDATION
    ================================
    */

    const normalizedPrice = Number(price);

    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      return {
        success: false,
        error: { message: "Invalid order price." },
      };
    }

    /*
    ================================
    REQUIREMENTS VALIDATION
    ================================
    */

    const requirementsJson =
      typeof requirements === "string"
        ? (() => {
            const trimmedRequirements = requirements.trim();

            if (!trimmedRequirements) {
              return null;
            }

            try {
              const parsedRequirements = JSON.parse(trimmedRequirements);
              return parsedRequirements &&
                typeof parsedRequirements === "object"
                ? parsedRequirements
                : { description: trimmedRequirements };
            } catch {
              return { description: trimmedRequirements };
            }
          })()
        : requirements && typeof requirements === "object"
          ? requirements
          : null;

    const requirementsText =
      typeof requirementsJson === "string"
        ? requirementsJson.trim()
        : typeof requirementsJson?.description === "string"
          ? requirementsJson.description.trim()
          : JSON.stringify(requirementsJson ?? {}).trim();

    if (!requirementsText || requirementsText.length < 10) {
      return {
        success: false,
        error: {
          message: "Requirements must be at least 10 characters.",
        },
      };
    }

    /*
    ================================
    CALCULATIONS
    ================================
    */

    const PLATFORM_FEE_PERCENT = 0.1;

    const platformFee = Number(
      (normalizedPrice * PLATFORM_FEE_PERCENT).toFixed(2),
    );

    const sellerEarnings = Number((normalizedPrice - platformFee).toFixed(2));

    const orderNumber = `SB-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    /*
    ================================
    PREVENT DUPLICATE PENDING ORDER
    ================================
    */

    const { data: existingPendingOrder, error: existingOrderError } =
      await supabase
        .from("orders")
        .select("*")
        .eq("buyer_id", buyer_id)
        .eq("seller_id", seller_id)
        .eq("service_id", service_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (existingOrderError) {
      console.error("Check Existing Order Error:", existingOrderError);

      return {
        success: false,
        error: existingOrderError,
      };
    }

    /*
    If pending order exists, return it
    */

    if (existingPendingOrder) {
      return {
        success: true,
        order: existingPendingOrder,
        duplicate: true,
      };
    }

    /*
    ================================
    BUILD REQUIREMENTS JSON
    ================================
    */

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          order_number: orderNumber,
          buyer_id,
          seller_id,
          service_id,

          price: normalizedPrice,
          platform_fee: platformFee,
          seller_earnings: sellerEarnings,

          requirements: requirementsJson,

          delivery_date: delivery_date || null,

          status: "pending",

          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Create Order Error:", error);

      return {
        success: false,
        error,
      };
    }

    /*
    ================================
    SUCCESS
    ================================
    */

    return {
      success: true,
      order: data,
    };
  } catch (err) {
    console.error("Unexpected Error:", err);

    return {
      success: false,
      error: err,
    };
  }
};
/*
========================================
UPDATE ORDER
========================================
*/

export const updateOrder = async (orderId, updates) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Update Order Error:", error);
      return { success: false, error };
    }

    return {
      success: true,
      order: data,
    };
  } catch (err) {
    console.error("Unexpected Error:", err);
    return { success: false, error: err };
  }
};

/*
========================================
GET PENDING ORDER FOR BUYER + SERVICE
========================================
*/

export const getPendingOrderByBuyerAndService = async ({
  buyer_id,
  service_id,
}) => {
  try {
    if (!buyer_id || !service_id) {
      return {
        success: false,
        error: { message: "Buyer ID and Service ID are required." },
      };
    }

    const { data, error } = await supabase
      .from("orders")
      .select("id,buyer_id,service_id,requirements,delivery_date,status")
      .eq("buyer_id", buyer_id)
      .eq("service_id", service_id)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Get Pending Order Error:", error);
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      order: data || null,
    };
  } catch (err) {
    console.error("Unexpected Error:", err);
    return { success: false, error: err };
  }
};

/*
========================================
CREATE OR UPDATE ORDER
========================================
*/

export const createOrUpdateOrder = async ({
  buyer_id,
  seller_id,
  service_id,
  price,
  requirements,
  delivery_date,
}) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return {
        success: false,
        error: authError.message || "Authentication failed.",
      };
    }

    const authenticatedBuyerId = user?.id || null;
    const resolvedBuyerId = authenticatedBuyerId || buyer_id;

    if (!resolvedBuyerId) {
      return {
        success: false,
        error: "Buyer ID is required.",
      };
    }

    if (buyer_id && authenticatedBuyerId && buyer_id !== authenticatedBuyerId) {
      return {
        success: false,
        error: "Buyer mismatch for authenticated user.",
      };
    }

    if (!service_id) {
      return {
        success: false,
        error: "Service ID is required.",
      };
    }

    const requirementsJson =
      typeof requirements === "string"
        ? (() => {
            const trimmedRequirements = requirements.trim();

            if (!trimmedRequirements) {
              return null;
            }

            try {
              const parsedRequirements = JSON.parse(trimmedRequirements);
              return parsedRequirements &&
                typeof parsedRequirements === "object"
                ? parsedRequirements
                : { description: trimmedRequirements };
            } catch {
              return { description: trimmedRequirements };
            }
          })()
        : requirements && typeof requirements === "object"
          ? requirements
          : null;

    const { data: existingOrder, error: existingOrderError } = await supabase
      .from("orders")
      .select("id,buyer_id,service_id,status")
      .eq("buyer_id", resolvedBuyerId)
      .eq("service_id", service_id)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();

    if (existingOrderError) {
      return {
        success: false,
        error: existingOrderError.message || "Failed to check existing order.",
      };
    }

    if (existingOrder?.id) {
      const updateResult = await updateOrder(existingOrder.id, {
        requirements: requirementsJson,
        delivery_date: delivery_date || null,
        updated_at: new Date().toISOString(),
      });

      if (!updateResult.success) {
        return {
          success: false,
          error:
            updateResult.error?.message ||
            updateResult.error ||
            "Failed to update order.",
        };
      }

      return {
        success: true,
        order: updateResult.order,
        action: "updated",
      };
    }

    const createResult = await createOrder({
      buyer_id: resolvedBuyerId,
      seller_id,
      service_id,
      price,
      requirements,
      delivery_date,
    });

    if (!createResult.success) {
      return {
        success: false,
        error:
          createResult.error?.message ||
          createResult.error ||
          "Failed to create order.",
      };
    }

    if (createResult.duplicate) {
      return {
        success: true,
        order: createResult.order,
        action: "updated",
      };
    }

    return {
      success: true,
      order: createResult.order,
      action: "created",
    };
  } catch (err) {
    console.error("Create Or Update Order Error:", err);
    return {
      success: false,
      error:
        err?.message || "Unexpected error while creating or updating order.",
    };
  }
};

/*
========================================
GET SINGLE ORDER
========================================
*/

export const getOrderById = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Get Order Error:", error);
      return { success: false, error };
    }

    return {
      success: true,
      order: data,
    };
  } catch (err) {
    console.error("Unexpected Error:", err);
    return { success: false, error: err };
  }
};
