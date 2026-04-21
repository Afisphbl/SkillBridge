"use client";

import Link from "next/link";
import {
  FiMessageSquare,
  FiEye,
  FiCheck,
  FiSend,
  FiRefreshCcw,
  FiXCircle,
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

type SellerOrderRowProps = {
  order: EnrichedOrder;
  onAccept: (order: EnrichedOrder) => void;
  isAccepting?: boolean;
  onDeliver: (order: EnrichedOrder) => void;
  onRequestExtension: (order: EnrichedOrder) => void;
  onCancel: (order: EnrichedOrder) => void;
  onRevision: (order: EnrichedOrder) => void;
  onViewDetails: (order: EnrichedOrder) => void;
};

export default function SellerOrderRow({
  order,
  onAccept,
  isAccepting = false,
  onDeliver,
  onRequestExtension,
  onCancel,
  onRevision,
  onViewDetails,
}: SellerOrderRowProps) {
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
    <tr className="text-sm text-(--text-secondary) hover:bg-(--table-row-hover) transition-colors">
      <td className="px-4 py-4 font-bold text-(--text-primary)">
        {order.order_number || `#${order.id.slice(0, 8)}`}
      </td>
      <td className="px-4 py-4 max-w-50">
        <p className="font-bold text-(--text-primary) truncate">
          {order.serviceName}
        </p>
        <p className="text-xs text-(--text-muted)">Project</p>
      </td>
      <td className="px-4 py-4 font-semibold text-(--text-primary)">
        {order.buyerName}
      </td>
      <td className="px-4 py-4 font-black text-(--text-primary)">
        {formatPrice(order.price || 0)}
      </td>
      <td className="px-4 py-4">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="px-4 py-4 font-medium">
        {formatDate(order.delivery_date)}
      </td>
      <td className="px-4 py-4 text-xs text-(--text-muted)">
        {formatDate(order.created_at)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          {/* Contextual Actions */}
          {status === "pending" && (
            <>
              <button
                type="button"
                disabled={isAccepting}
                onClick={() => onAccept(order)}
                className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700"
              >
                <FiCheck className="size-3" />
                {isAccepting ? "Accepting..." : "Accept Order"}
              </button>
              <button
                onClick={() => onCancel(order)}
                className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
              >
                <FiXCircle className="size-3" /> Cancel
              </button>
            </>
          )}

          {status === "in_progress" && (
            <>
              <button
                onClick={() => onDeliver(order)}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
              >
                <FiSend className="size-3" /> Deliver
              </button>
              <button
                onClick={() => onRequestExtension(order)}
                className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
              >
                <FiClock className="size-3" /> Request Extension
              </button>
            </>
          )}

          {status === "revision_requested" && (
            <button
              onClick={() => onRevision(order)}
              className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
            >
              <FiRefreshCcw className="size-3" /> Submit Revision
            </button>
          )}

          {/* Standard Actions */}
          <button
            onClick={() => onViewDetails(order)}
            className="flex items-center gap-1 rounded-lg border border-(--border-color) bg-(--bg-card) px-3 py-1.5 text-xs font-bold text-(--text-secondary) hover:bg-(--hover-bg)"
            title="View Details"
          >
            <FiEye className="size-3.5" />
          </button>

          {(status === "completed" || status === "delivered") &&
            deliveryFiles.length > 0 && (
              <a
                href={deliveryFiles[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-(--border-color) bg-(--bg-card) px-3 py-1.5 text-xs font-bold text-(--text-secondary) hover:bg-(--hover-bg)"
                title="Download Files"
              >
                <FiDownload className="size-3.5" />
              </a>
            )}

          {canMessage && (
            <Link
              href={`/messages?m=${order.id}`}
              className="flex items-center gap-1 rounded-lg border border-(--border-color) bg-(--bg-card) px-3 py-1.5 text-xs font-bold text-(--text-secondary) hover:bg-(--hover-bg)"
              title="Message Buyer"
            >
              <FiMessageSquare className="size-3.5" />
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}
