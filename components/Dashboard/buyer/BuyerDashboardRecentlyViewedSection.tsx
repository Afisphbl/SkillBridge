import Image from "next/image";
import Link from "next/link";
import { FiStar } from "react-icons/fi";
import { formatPrice } from "@/utils/format";
import { useBuyerDashboardContext } from "./BuyerDashboardProvider";
import { EmptyState, SectionHeader, SectionShell } from "./shared";

function useBuyerDashboardRecentlyViewedSection() {
  const { recentlyViewed } = useBuyerDashboardContext();
  return { recentlyViewed };
}

export default function BuyerDashboardRecentlyViewedSection() {
  const { recentlyViewed } = useBuyerDashboardRecentlyViewedSection();

  return (
    <SectionShell>
      <SectionHeader
        title="Recently Viewed Services"
        subtitle="Quickly return to recently visited service pages"
      />

      {recentlyViewed.length === 0 ? (
        <EmptyState
          title="No recently viewed services"
          description="Browse the marketplace and interact with services to build your quick access list."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {recentlyViewed.map((service) => (
            <article
              key={service.serviceId}
              className="overflow-hidden rounded-2xl border border-(--border-color) bg-(--bg-card)"
            >
              <div className="relative h-32 w-full">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-sm font-bold text-(--text-primary)">
                  {service.title}
                </p>
                <p className="mt-1 text-xs text-(--text-secondary)">
                  {service.sellerName}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-(--text-muted)">
                  <span className="inline-flex items-center gap-1">
                    <FiStar className="size-3.5 text-(--color-warning)" />
                    {service.rating.toFixed(1)}
                  </span>
                  <span>{formatPrice(service.price)}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/services/${service.serviceId}`}
                    className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                  >
                    View service
                  </Link>
                  <Link
                    href={`/services/${service.serviceId}`}
                    className="rounded-lg bg-(--btn-bg-primary) px-2.5 py-1 text-xs font-semibold text-(--btn-text-primary)"
                  >
                    Order again
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
