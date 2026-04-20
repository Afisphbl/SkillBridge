import { useOrdersStore } from "@/hooks/orders/store";

export default function OrdersRoleHint() {
  const role = useOrdersStore((snapshot) => snapshot.role);

  return (
    <p className="text-xs text-(--text-muted)">
      Role view:{" "}
      {role === "seller"
        ? "Seller orders"
        : role === "both"
          ? "Buyer and Seller orders"
          : "Buyer orders"}
    </p>
  );
}
