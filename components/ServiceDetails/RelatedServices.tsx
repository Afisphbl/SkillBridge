import ServiceCard from "@/components/Services/ServiceCard";

type ServiceRecord = {
  id?: string;
  [key: string]: unknown;
};

export default function RelatedServices({
  services,
  currentServiceId,
}: {
  services: ServiceRecord[];
  currentServiceId?: string;
}) {
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
