"use client";

import OrdersContent from "./OrdersContent";
import OrdersDataController from "./OrdersDataController";
import OrdersFilters from "./OrdersFilters";
import OrdersHeader from "./OrdersHeader";
import OrdersRoleHint from "./OrdersRoleHint";
import OrdersStats from "./OrdersStats";

type OrdersPageClientProps = {
  roleScope?: "buyer" | "seller";
};

export default function OrdersPageClient({ roleScope }: OrdersPageClientProps) {
  return (
    <section className="space-y-6">
      <OrdersDataController roleScope={roleScope} />
      <OrdersHeader />
      <OrdersStats />
      <OrdersFilters />
      <OrdersContent />
      <OrdersRoleHint />
    </section>
  );
}
