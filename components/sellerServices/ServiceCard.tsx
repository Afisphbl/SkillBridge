"use client";

import Image from "next/image";
import { FiClock, FiEye, FiPackage, FiStar } from "react-icons/fi";
import ServiceStatusBadge from "./ServiceStatusBadge";
import ServiceActionsMenu from "./ServiceActionsMenu";
import type { ServiceItem } from "./types";

type ServiceCardProps = {
  service: ServiceItem;
  selected: boolean;
  onSelect: (serviceId: string, checked: boolean) => void;
  onDuplicate: (serviceId: string) => void;
  onPause: (serviceId: string) => void;
  onActivate: (serviceId: string) => void;
  onDelete: (serviceId: string) => void;
};

function visibilityBadgeClass(visibility: ServiceItem["visibility"]) {
  return visibility === "public"
    ? "border-sky-200 bg-sky-50 text-sky-700"
    : "border-slate-300 bg-slate-100 text-slate-600";
}

export default function ServiceCard({
  service,
  selected,
  onSelect,
  onDuplicate,
  onPause,
  onActivate,
  onDelete,
}: ServiceCardProps) {
  return (
    <article className="overflow-visible rounded-2xl border border-(--border-color) bg-(--bg-card) shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-(--bg-secondary)">
        <Image
          src={service.image || "/SkillBridge.png"}
          alt={service.title}
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <label className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-lg bg-(--modal-bg)/85 px-2 py-1 text-xs font-medium text-(--text-primary) backdrop-blur-sm">
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelect(service.id, event.target.checked)}
            className="size-3.5 rounded border-(--border-color)"
            aria-label={`Select ${service.title}`}
          />
          Select
        </label>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <h3 className="line-clamp-2 min-h-11 text-base font-semibold text-(--text-primary)">
            {service.title}
          </h3>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-(--text-muted)">
            {service.category}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="font-bold text-(--color-primary)">
            ${service.price.toFixed(0)}
          </p>
          <p className="inline-flex items-center gap-1.5 text-(--text-secondary)">
            <FiClock className="size-3.5" />
            {service.deliveryDays} days
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-(--bg-secondary) p-2.5 text-xs">
          <p className="inline-flex items-center gap-1.5 text-(--text-secondary)">
            <FiStar className="size-3.5 text-amber-500" />
            <span className="font-semibold text-(--text-primary)">
              {service.rating.toFixed(1)}
            </span>
          </p>
          <p className="inline-flex items-center gap-1.5 text-(--text-secondary)">
            <FiPackage className="size-3.5" />
            <span className="font-semibold text-(--text-primary)">
              {service.orders} orders
            </span>
          </p>
          <p className="inline-flex items-center gap-1.5 text-(--text-secondary)">
            <FiEye className="size-3.5" />
            <span className="font-semibold text-(--text-primary)">
              {service.views} views
            </span>
          </p>
          <p className="text-(--text-secondary)">
            Conv.{" "}
            <span className="font-semibold text-(--text-primary)">
              {service.conversionRate.toFixed(1)}%
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ServiceStatusBadge status={service.status} />
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${visibilityBadgeClass(service.visibility)}`}
          >
            {service.visibility === "public" ? "Public" : "Private"}
          </span>
        </div>

        <div className="flex items-center justify-end border-t border-(--border-color) pt-3">
          <ServiceActionsMenu
            service={service}
            onDuplicate={onDuplicate}
            onPause={onPause}
            onActivate={onActivate}
            onDelete={onDelete}
          />
        </div>
      </div>
    </article>
  );
}
