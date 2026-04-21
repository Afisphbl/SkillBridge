"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiX,
  FiFileText,
  FiClock,
  FiDollarSign,
  FiUser,
  FiInfo,
} from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
import { formatDate, type EnrichedOrder } from "@/hooks/orders/types";
import { formatPrice } from "@/utils/format";
import OrderStatusBadge from "@/components/Orders/OrderStatusBadge";

type OrderDetailsModalProps = {
  open: boolean;
  order: EnrichedOrder | null;
  onClose: () => void;
};

export default function OrderDetailsModal({
  open,
  order,
  onClose,
}: OrderDetailsModalProps) {
  if (!open || !order) return null;

  const requirements =
    typeof order.requirements === "string"
      ? order.requirements
      : order.requirements?.description ||
        "No specific requirements provided.";

  return (
    <div
      className="fixed inset-0 z-70 grid place-items-center bg-(--modal-overlay) px-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-pop flex h-auto max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-(--border-color) bg-(--bg-card) shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-(--border-color) p-6 bg-(--bg-secondary)">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-(--text-primary)">
              Order Details
            </h3>
            <span className="text-sm font-bold text-(--text-muted)">
              {order.order_number || `#${order.id.slice(0, 8)}`}
            </span>
          </div>
          <button
            type="button"
            title="Close order details"
            onClick={onClose}
            className="rounded-xl p-2 text-(--text-muted) hover:bg-(--hover-bg)"
          >
            <FiX className="size-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Quick Summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <InfoTile
              icon={FiUser}
              label="Buyer"
              value={order.buyerName}
              color="text-blue-600"
            />
            <InfoTile
              icon={FiDollarSign}
              label="Price"
              value={formatPrice(order.price || 0)}
              color="text-green-600"
            />
            <InfoTile
              icon={FiClock}
              label="Deadline"
              value={formatDate(order.delivery_date)}
              color="text-amber-600"
            />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-(--text-muted)">
                Status
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          <hr className="border-(--border-color)" />

          {/* Service Info */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-(--text-primary)">
              <FiInfo className="size-4" /> Service Ordered
            </h4>
            <p className="mt-2 text-lg font-bold text-(--text-primary)">
              {order.serviceName}
            </p>
          </div>

          {/* Requirements */}
          <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-5">
            <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-(--text-primary)">
              <FiFileText className="size-4" /> Buyer Requirements
            </h4>
            <div className="mt-3 prose prose-sm max-w-none text-(--text-secondary)">
              {requirements}
            </div>
          </div>

          {/* Delivery Details (If available) */}
          {(order.status === "delivered" || order.status === "completed") && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
              <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-blue-700">
                <FiCheckCircle className="size-4" /> Delivery Information
              </h4>
              <div className="mt-3 text-sm text-blue-900 bg-white/50 p-4 rounded-xl border border-blue-100">
                <p className="font-medium whitespace-pre-wrap">
                  {order.delivery_message || "No delivery message provided."}
                </p>

                {order.delivery_files && (
                  <div className="mt-4 pt-4 border-t border-blue-100 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                      Attached Assets
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          const files =
                            typeof order.delivery_files === "string"
                              ? JSON.parse(order.delivery_files)
                              : order.delivery_files;

                          if (Array.isArray(files)) {
                            return files.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-600 border border-blue-100 hover:border-blue-400 transition-colors"
                              >
                                <FiFileText className="size-3" /> File {idx + 1}
                              </a>
                            ));
                          }
                        } catch {
                          return (
                            <p className="text-xs italic text-blue-400">
                              Unable to load files.
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-(--text-primary) mb-4">
              Project Timeline
            </h4>
            <div className="space-y-4">
              <TimelineItem
                label="Order Created"
                date={formatDate(order.created_at)}
                active
              />
              {order.started_at && (
                <TimelineItem
                  label="In Progress"
                  date={formatDate(order.started_at)}
                  active
                />
              )}
              {order.delivered_at && (
                <TimelineItem
                  label="Delivered"
                  date={formatDate(order.delivered_at)}
                  active
                />
              )}
              {order.completed_at && (
                <TimelineItem
                  label="Completed"
                  date={formatDate(order.completed_at)}
                  active
                  variant="success"
                />
              )}
              {order.cancelled_at && (
                <TimelineItem
                  label="Cancelled"
                  date={formatDate(order.cancelled_at)}
                  active
                  variant="danger"
                />
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-(--border-color) bg-(--bg-secondary) p-6">
          <div className="flex gap-3">
            <Link
              href={`/messages?m=${order.id}`}
              className="flex-1 rounded-2xl border border-(--border-color) bg-(--bg-card) py-4 text-center text-sm font-black text-(--text-secondary)"
            >
              Open Messages
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-(--btn-bg-primary) py-4 text-sm font-black text-(--btn-text-primary) shadow-lg shadow-blue-500/20 transition-transform active:scale-95"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: IconType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-black uppercase tracking-wider text-(--text-muted)">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <Icon className={`size-3.5 ${color}`} />
        <span className="text-sm font-bold text-(--text-primary) truncate">
          {value}
        </span>
      </div>
    </div>
  );
}

function TimelineItem({
  label,
  date,
  active,
  variant = "primary",
}: {
  label: string;
  date: string;
  active?: boolean;
  variant?: "primary" | "success" | "danger";
}) {
  const colors = {
    primary: {
      dot: "bg-blue-500",
      shadow: "shadow-[0_0_0_4px_rgba(59,130,246,0.2)]",
    },
    success: {
      dot: "bg-green-500",
      shadow: "shadow-[0_0_0_4px_rgba(34,197,94,0.2)]",
    },
    danger: {
      dot: "bg-red-500",
      shadow: "shadow-[0_0_0_4px_rgba(239,68,68,0.2)]",
    },
  };

  const selected = colors[variant];

  return (
    <div className="flex items-center gap-4">
      <div
        className={`size-3 rounded-full ${active ? `${selected.dot} ${selected.shadow}` : "bg-(--border-color)"}`}
      />
      <div className="flex-1 border-b border-(--border-color) pb-2">
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-bold ${active ? "text-(--text-primary)" : "text-(--text-muted)"}`}
          >
            {label}
          </span>
          <span className="text-xs text-(--text-muted)">{date}</span>
        </div>
      </div>
    </div>
  );
}
