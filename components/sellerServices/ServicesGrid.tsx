import ServiceCard from "./ServiceCard";
import type { ServiceItem } from "./types";

type ServicesGridProps = {
  services: ServiceItem[];
  selectedIds: Set<string>;
  onSelect: (serviceId: string, checked: boolean) => void;
  onDuplicate: (serviceId: string) => void;
  onPause: (serviceId: string) => void;
  onActivate: (serviceId: string) => void;
  onDelete: (serviceId: string) => void;
};

export default function ServicesGrid({
  services,
  selectedIds,
  onSelect,
  onDuplicate,
  onPause,
  onActivate,
  onDelete,
}: ServicesGridProps) {
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-label="Seller services grid"
    >
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          selected={selectedIds.has(service.id)}
          onSelect={onSelect}
          onDuplicate={onDuplicate}
          onPause={onPause}
          onActivate={onActivate}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}
