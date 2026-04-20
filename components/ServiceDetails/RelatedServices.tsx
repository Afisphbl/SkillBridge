"use client";

import ServiceCard from "@/components/Services/ServiceCard";
import { useRelatedServices } from "@/hooks/services/useRelatedServices";
import { useServiceDetails } from "@/hooks/services/useServiceDetails";

export default function RelatedServices() {
  const { services } = useRelatedServices();
  const { service } = useServiceDetails();
  const currentServiceId = String(service?.id || "");

  const filtered = services
    .filter(
      (service) => String(service.id || "") !== String(currentServiceId || ""),
    )
    .slice(0, 6);

  return (
    <section className="space-y-4 rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
      <h2 className="text-lg font-bold text-(--text-primary)">
        Related services
      </h2>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--border-color) bg-(--bg-secondary) px-4 py-8 text-center">
          <p className="text-sm text-(--text-secondary)">
            No related services available.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service, index) => (
            <ServiceCard
              key={String(service.id || `related-${index}`)}
              service={service}
            />
          ))}
        </div>
      )}
    </section>
  );
}
