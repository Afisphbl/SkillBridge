import Image from "next/image";
import Link from "next/link";
import { FiStar, FiUser } from "react-icons/fi";
import type { SellerRow, ServiceRow } from "@/components/Home/types";
import { formatPrice } from "@/utils/format";

type HomeFeaturedServicesSectionProps = {
  featuredServices: ServiceRow[];
  sellerMap: Map<string, SellerRow>;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function HomeFeaturedServicesSection({
  featuredServices,
  sellerMap,
}: HomeFeaturedServicesSectionProps) {
  return (
    <section className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-2xl font-black tracking-tight text-(--text-primary)">
          Featured Services
        </h2>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Top-rated listings based on marketplace performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {featuredServices.length > 0 ? (
          featuredServices.map((service) => {
            const seller = sellerMap.get(String(service.seller_id || ""));
            const sellerName =
              seller?.full_name || seller?.email || "SkillBridge Seller";
            const heroImage =
              service.thumbnail_url ||
              service.image_url ||
              service.cover_image ||
              "/SkillBridge.png";
            const rating = toNumber(
              service.average_rating ?? service.rating,
              0,
            );
            const reviews = toNumber(service.reviews_count, 0);

            return (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="group overflow-hidden rounded-2xl border border-(--border-color) bg-(--bg-secondary) shadow-sm"
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={heroImage}
                    alt={service.title || "Service cover"}
                    fill
                    unoptimized
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute right-3 top-3 rounded-md bg-(--bg-card) px-2 py-1 text-[11px] font-semibold text-(--color-primary)">
                    Featured
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-center gap-2 text-xs text-(--text-secondary)">
                    <div className="grid size-6 place-items-center overflow-hidden rounded-full bg-(--bg-card) text-(--text-muted)">
                      {seller?.avatar ? (
                        <Image
                          src={seller.avatar}
                          alt={sellerName}
                          width={24}
                          height={24}
                          unoptimized
                          className="size-6 rounded-full object-cover"
                        />
                      ) : (
                        <FiUser className="size-3.5" />
                      )}
                    </div>
                    <span className="truncate font-medium">{sellerName}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-amber-600">
                      <FiStar className="size-3.5 fill-amber-500" />
                      <span>{rating.toFixed(1)}</span>
                      <span className="text-(--text-muted)">({reviews})</span>
                    </span>
                  </div>

                  <h3 className="line-clamp-2 min-h-11 text-sm font-semibold text-(--text-primary) group-hover:text-(--color-primary)">
                    {service.title || "Untitled service"}
                  </h3>

                  <div className="flex items-center justify-between border-t border-(--border-color) pt-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                      Starting at
                    </span>
                    <span className="text-lg font-black text-(--color-primary)">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-sm text-(--text-muted)">
            No services available yet. Create a service to populate your home
            feed.
          </p>
        )}
      </div>
    </section>
  );
}
