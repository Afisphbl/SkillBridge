"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrdersFilters } from "@/hooks/orders/useOrdersFilters";
import { useOrdersPagination } from "@/hooks/orders/useOrdersPagination";
import { useOrdersActions } from "@/hooks/orders/useOrdersData";
import { useOrdersStore } from "@/hooks/orders/store";
import { type EnrichedOrder } from "@/hooks/orders/types";
import { type AllowedOrderStatus } from "@/components/Orders/OrderStatusSelect";

import SellerOrderRow from "./SellerOrderRow";
import SellerOrderCard from "./SellerOrderCard";
import DeliverModal from "../modals/DeliverModal";
import CancelOrderModal from "../modals/CancelOrderModal";
import RevisionModal from "../modals/RevisionModal";
import OrderDetailsModal from "../modals/OrderDetailsModal";
import RequestExtensionModal from "../modals/RequestExtensionModal";

export default function SellerOrdersList() {
  const { filteredOrders } = useOrdersFilters();
  const {
    pagedOrders,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
  } = useOrdersPagination();
  const {
    deliverOrder,
    submitRevision,
    cancelOrder,
    requestExtension,
    changeOrderStatus,
  } = useOrdersActions("seller");

  const currentUserId = useOrdersStore((s) => s.currentUserId);

  const [selectedOrder, setSelectedOrder] = useState<EnrichedOrder | null>(null);
  const [modalType, setModalType] = useState<
    "deliver" | "cancel" | "revision" | "details" | "extension" | null
  >(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const openModal = (
    order: EnrichedOrder,
    type: "deliver" | "cancel" | "revision" | "details" | "extension",
  ) => {
    setSelectedOrder(order);
    setModalType(type);
  };

  const closeModal = () => {
    if (isActionLoading) return;
    setModalType(null);
    setSelectedOrder(null);
  };

  const handleAction = async (actionFn: () => Promise<void>) => {
    setIsActionLoading(true);
    try {
      await actionFn();
      closeModal();
    } finally {
      setIsActionLoading(false);
    }
  };

  /** Called by OrderStatusSelect in both Row and Card */
  const handleStatusChange = async (
    orderId: string,
    status: AllowedOrderStatus,
  ): Promise<{ success: boolean }> => {
    return changeOrderStatus(orderId, status);
  };

  if (filteredOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-(--border-color) bg-(--bg-card) p-20 text-center">
        <div className="rounded-2xl bg-(--bg-secondary) p-6 text-(--text-muted)">
          <svg
            className="size-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h3 className="mt-6 text-xl font-bold text-(--text-primary)">
          No orders found
        </h3>
        <p className="mt-2 text-(--text-muted)">
          You don't have any orders yet.
        </p>
        <Link
          href="/seller/services/create"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-(--btn-bg-primary) px-5 text-sm font-bold text-(--btn-text-primary)"
        >
          Create a Service
        </Link>
      </div>
    );
  }

  const pageNumbers = Array.from(
    { length: totalPages },
    (_value, index) => index + 1,
  );

  return (
    <div className="space-y-6">
      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-(--border-color) bg-(--bg-card) shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-(--bg-secondary) border-b border-(--border-color)">
              <tr>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-(--text-muted)">
                  Order
                </th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-(--text-muted)">
                  Service
                </th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-(--text-muted)">
                  Buyer
                </th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-(--text-muted)">
                  Amount
                </th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-(--text-muted)">
                  Status
                </th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-(--text-muted)">
                  Delivery
                </th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-(--text-muted)">
                  Date
                </th>
                <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-wider text-(--text-muted)">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color)">
              {pagedOrders.map((order) => (
                <SellerOrderRow
                  key={order.id}
                  order={order}
                  currentUserId={currentUserId}
                  onStatusChange={handleStatusChange}
                  onDeliver={(o) => openModal(o, "deliver")}
                  onRequestExtension={(o) => openModal(o, "extension")}
                  onRevision={(o) => openModal(o, "revision")}
                  onViewDetails={(o) => openModal(o, "details")}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {pagedOrders.map((order) => (
          <SellerOrderCard
            key={order.id}
            order={order}
            currentUserId={currentUserId}
            onStatusChange={handleStatusChange}
            onDeliver={(o) => openModal(o, "deliver")}
            onRequestExtension={(o) => openModal(o, "extension")}
            onRevision={(o) => openModal(o, "revision")}
            onViewDetails={(o) => openModal(o, "details")}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-(--text-muted)">
            Items per page
          </span>
          <select
            title="Items per page"
            value={itemsPerPage}
            onChange={(event) => setItemsPerPage(Number(event.target.value))}
            className="h-9 rounded-lg border border-(--border-color) bg-(--bg-secondary) px-2 text-sm font-semibold text-(--text-primary)"
          >
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </div>

        <p className="text-sm font-semibold text-(--text-secondary)">
          Showing {pagedOrders.length} of {filteredOrders.length} orders
        </p>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--border-color) bg-(--bg-card) p-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="rounded-xl border border-(--border-color) px-4 py-2 text-sm font-bold text-(--text-secondary) hover:bg-(--hover-bg) disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-black text-(--text-primary)">
            Page {currentPage} of {totalPages}
          </span>

          <div className="hidden items-center gap-1 lg:flex">
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setCurrentPage(pageNumber)}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold ${
                  currentPage === pageNumber
                    ? "border-(--btn-bg-primary) bg-(--btn-bg-primary) text-(--btn-text-primary)"
                    : "border-(--border-color) bg-(--bg-card) text-(--text-secondary) hover:bg-(--hover-bg)"
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="rounded-xl border border-(--border-color) px-4 py-2 text-sm font-bold text-(--text-secondary) hover:bg-(--hover-bg) disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <DeliverModal
        open={modalType === "deliver"}
        loading={isActionLoading}
        orderId={selectedOrder?.id || ""}
        orderNumber={selectedOrder?.order_number || ""}
        onClose={closeModal}
        onConfirm={(data) =>
          handleAction(() => deliverOrder(selectedOrder!.id, data))
        }
      />

      <CancelOrderModal
        open={modalType === "cancel"}
        loading={isActionLoading}
        orderNumber={selectedOrder?.order_number || ""}
        onClose={closeModal}
        onConfirm={(reason) =>
          handleAction(() => cancelOrder(selectedOrder!.id, reason))
        }
      />

      <RevisionModal
        open={modalType === "revision"}
        loading={isActionLoading}
        orderId={selectedOrder?.id || ""}
        orderNumber={selectedOrder?.order_number || ""}
        onClose={closeModal}
        onConfirm={(data) =>
          handleAction(() => submitRevision(selectedOrder!.id, data))
        }
      />

      <OrderDetailsModal
        open={modalType === "details"}
        order={selectedOrder}
        onClose={closeModal}
      />

      <RequestExtensionModal
        open={modalType === "extension"}
        loading={isActionLoading}
        orderNumber={selectedOrder?.order_number || ""}
        currentDeadline={selectedOrder?.delivery_date || ""}
        onClose={closeModal}
        onConfirm={(payload) =>
          handleAction(() =>
            requestExtension({
              orderId: selectedOrder!.id,
              deliveryDate: payload.deliveryDate,
              note: payload.note,
            }),
          )
        }
      />
    </div>
  );
}
