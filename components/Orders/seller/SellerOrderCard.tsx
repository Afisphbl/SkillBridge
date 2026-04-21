"use client";

import Link from "next/link";
import {
  FiMessageSquare,
  FiEye,
  FiCheck,
  FiSend,
  FiRefreshCcw,
  FiXCircle,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiDownload,
} from "react-icons/fi";
import OrderStatusBadge from "@/components/Orders/OrderStatusBadge";
import {
  formatDate,
  normalizeStatus,
  type EnrichedOrder,
} from "@/hooks/orders/types";
import { formatPrice } from "@/utils/format";

type SellerOrderCardProps = {
  order: EnrichedOrder;
  onAccept: (order: EnrichedOrder) => void;
  isAccepting?: boolean;
  onDeliver: (order: EnrichedOrder) => void;
  onRequestExtension: (order: EnrichedOrder) => void;
  onCancel: (order: EnrichedOrder) => void;
  onRevision: (order: EnrichedOrder) => void;
  onViewDetails: (order: EnrichedOrder) => void;
};

export default function SellerOrderCard({
  order,
  onAccept,
  isAccepting = false,
  onDeliver,
  onRequestExtension,
  onCancel,
  onRevision,
  onViewDetails,
}: SellerOrderCardProps) {
  const status = normalizeStatus(order.status);
  const canMessage = [
    "pending",
    "in_progress",
    "delivered",
    "revision_requested",
  ].includes(status);

  const deliveryFiles = (() => {
    if (!order.delivery_files) return [] as string[];
    if (Array.isArray(order.delivery_files)) return order.delivery_files;

    if (typeof order.delivery_files === "string") {
      try {
        const parsed = JSON.parse(order.delivery_files);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [] as string[];
  })();

  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-(--text-muted)">
            Order {order.order_number || `#${order.id.slice(0, 8)}`}
          </p>
          <h4 className="mt-1 font-bold text-(--text-primary) line-clamp-1">
            {order.serviceName}
          </h4>
          <p className="text-sm font-semibold text-(--btn-bg-primary)">
            {order.buyerName}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex items-center gap-4 py-2 border-y border-(--border-color) border-dashed">
        <div className="flex items-center gap-1.5">
          <FiDollarSign className="size-3.5 text-green-600" />
          <span className="text-sm font-bold text-(--text-primary)">
            {formatPrice(order.price || 0)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <FiCalendar className="size-3.5 text-blue-600" />
          <span className="text-sm font-medium text-(--text-secondary)">
            {formatDate(order.delivery_date)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {status === "pending" && (
          <>
            <button
              type="button"
              disabled={isAccepting}
              onClick={() => onAccept(order)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-green-600 py-3 text-xs font-bold text-white hover:bg-green-700"
            >
              <FiCheck className="size-4" />{" "}
              {isAccepting ? "Accepting..." : "Accept Order"}
            </button>
            <button
              onClick={() => onCancel(order)}
              title="Cancel order"
              className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-100"
            >
              <FiXCircle className="size-4" />
            </button>
          </>
        )}

        {status === "in_progress" && (
          <>
            <button
              onClick={() => onDeliver(order)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700"
            >
              <FiSend className="size-4" /> Deliver Work
            </button>
            <button
              onClick={() => onRequestExtension(order)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 py-3 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
            >
              <FiClock className="size-4" /> Request Extension
            </button>
          </>
        )}

        {status === "revision_requested" && (
          <button
            onClick={() => onRevision(order)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 py-3 text-xs font-bold text-white hover:bg-amber-700"
          >
            <FiRefreshCcw className="size-4" /> Submit Revision
          </button>
        )}

        <div className="mt-2 flex w-full gap-2">
          <button
            onClick={() => onViewDetails(order)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-(--border-color) bg-(--bg-secondary) py-2.5 text-xs font-bold text-(--text-secondary)"
          >
            <FiEye className="size-4" /> Details
          </button>
          {(status === "completed" || status === "delivered") &&
          deliveryFiles.length > 0 ? (
            <a
              href={deliveryFiles[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-(--border-color) bg-(--bg-secondary) py-2.5 text-xs font-bold text-(--text-secondary)"
            >
              <FiDownload className="size-4" /> Download
            </a>
          ) : null}
          {canMessage && (
            <Link
              href={`/messages?m=${order.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-(--border-color) bg-(--bg-secondary) py-2.5 text-xs font-bold text-(--text-secondary)"
            >
              <FiMessageSquare className="size-4" /> Message
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
