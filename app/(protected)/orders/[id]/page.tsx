"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import OrderDetailsContent from "@/components/Orders/OrderDetailsContent";
import OrderDetailsErrorState from "@/components/Orders/OrderDetailsErrorState";
import OrderDetailsLoadingState from "@/components/Orders/OrderDetailsLoadingState";
import { useOrderDetails } from "@/hooks/orders/useOrderDetails";

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = useMemo(() => params?.id ?? "", [params]);

  const { isLoading, errorMessage, order, buyerName, sellerName, serviceName } =
    useOrderDetails(orderId);

  if (isLoading) {
    return <OrderDetailsLoadingState />;
  }

  if (!order) {
    return <OrderDetailsErrorState errorMessage={errorMessage} />;
  }

  return (
    <OrderDetailsContent
      order={order}
      buyerName={buyerName}
      sellerName={sellerName}
      serviceName={serviceName}
    />
  );
}
