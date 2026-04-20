import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { formatPrice } from "@/utils/format";
import OrderDetailActions from "./OrderDetailActions";
import OrderStatusBadge from "./OrderStatusBadge";
import type { OrderDetailsRecord } from "@/hooks/orders/useOrderDetails";

type OrderDetailsContentProps = {
  order: OrderDetailsRecord;
  buyerName: string;
  sellerName: string;
  serviceName: string;
};

function formatOrderValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function formatDate(value: unknown) {
  if (!value || typeof value !== "string") return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatMoneyValue(value: number | null | undefined) {
  return typeof value === "number" ? formatPrice(value) : "-";
}

function DetailCard({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary)/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
        {label}
      </p>
      <p className="mt-2 wrap-break-word text-sm font-medium text-(--text-primary)">
        {formatOrderValue(value)}
      </p>
    </div>
  );
}

export default function OrderDetailsContent({
  order,
  buyerName,
  sellerName,
  serviceName,
}: OrderDetailsContentProps) {
  return (
    <section className="space-y-6">
      <Link
        href="/orders"
        className="inline-flex h-9 items-center space-x-2 rounded-md border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
      >
        <FiArrowLeft className="size-4" />
        <span>Back to orders</span>
      </Link>

      <div className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <OrderStatusBadge status={order.status} />
            <h1 className="text-3xl font-black text-(--text-primary)">
              {order.order_number || `Order ${order.id}`}
            </h1>
            <p className="text-sm text-(--text-secondary)">
              Track details, timeline, and workflow status for this order.
            </p>
          </div>

          <div className="rounded-2xl bg-(--bg-secondary) px-4 py-3 md:text-right">
            <p className="text-xs uppercase tracking-wide text-(--text-muted)">
              Total
            </p>
            <p className="text-2xl font-black text-(--color-primary)">
              {formatPrice(order.price ?? 0)}
            </p>
            <p className="text-xs text-(--text-secondary)">
              Platform fee and earnings are already calculated.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <OrderDetailActions orderId={order.id} status={order.status} />
          <Link
            href={`/messages?orderId=${order.id}`}
            className="inline-flex h-10 items-center rounded-xl border border-(--border-color) bg-(--bg-card) px-4 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
          >
            Open Chat
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DetailCard label="Order number" value={order.order_number} />
          <DetailCard label="Service" value={serviceName} />
          <DetailCard label="Buyer" value={buyerName} />
          <DetailCard label="Seller" value={sellerName} />
          <DetailCard label="Status" value={order.status} />
          <DetailCard label="Price" value={formatMoneyValue(order.price)} />
          <DetailCard
            label="Platform fee"
            value={formatMoneyValue(order.platform_fee)}
          />
          <DetailCard
            label="Seller earnings"
            value={formatMoneyValue(order.seller_earnings)}
          />
          <DetailCard
            label="Delivery date"
            value={formatDate(order.delivery_date)}
          />
          <DetailCard
            label="Created date"
            value={formatDate(order.created_at)}
          />
          <DetailCard
            label="Delivered date"
            value={formatDate(order.delivered_at)}
          />
          <DetailCard
            label="Completed date"
            value={formatDate(order.completed_at)}
          />
          <DetailCard
            label="Cancellation reason"
            value={order.cancellation_reason || "-"}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-(--border-color) bg-(--bg-secondary)/70 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-(--text-muted)">
            Requirements
          </h2>
          <pre className="mt-3 overflow-auto whitespace-pre-wrap wrap-break-word text-sm text-(--text-secondary)">
            {formatOrderValue(order.requirements)}
          </pre>
        </div>
      </div>
    </section>
  );
}
