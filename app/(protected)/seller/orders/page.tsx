"use client";

import SellerOrdersHeader from "@/components/Orders/seller/SellerOrdersHeader";
import SellerOrdersTabs from "@/components/Orders/seller/SellerOrdersTabs";
import SellerOrderFilters from "@/components/Orders/seller/SellerOrderFilters";
import SellerOrdersList from "@/components/Orders/seller/SellerOrdersList";
import OrdersLoadingState from "@/components/Orders/OrdersLoadingState";
import { useOrdersStore } from "@/hooks/orders/store";
import {
  useOrdersActions,
  useOrdersLifecycle,
} from "@/hooks/orders/useOrdersData";

export default function SellerOrdersPage() {
  const { fetchOrders } = useOrdersActions("seller");
  useOrdersLifecycle("seller");

  const isLoading = useOrdersStore((snapshot) => snapshot.isLoading);
  const errorMessage = useOrdersStore((snapshot) => snapshot.errorMessage);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8 animate-in fade-in duration-700">
      {/* Page Heading */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-(--text-primary) md:text-4xl">
          Orders
        </h1>
        <p className="text-sm font-semibold text-(--text-muted) md:text-base">
          Manage and track all your client orders from one central command
          center
        </p>
      </div>

      {/* Header Stats */}
      <SellerOrdersHeader />

      {/* Main Content Area */}
      <div className="rounded-[40px] border border-(--border-color) bg-(--bg-card) p-2 shadow-2xl shadow-blue-900/5 overflow-hidden">
        <div className="p-4 sm:p-8 space-y-8">
          <div className="flex flex-col gap-6">
            <SellerOrdersTabs />
            <SellerOrderFilters />
          </div>

          {isLoading ? (
            <OrdersLoadingState />
          ) : errorMessage ? (
            <div className="rounded-3xl bg-red-100/50 p-12 text-center text-red-600 border border-red-200">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Failed to load orders</h3>
              <p className="mt-1 text-sm opacity-80">{errorMessage}</p>
              <button
                onClick={() => void fetchOrders()}
                className="mt-6 rounded-xl bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="min-h-100">
              <SellerOrdersList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
