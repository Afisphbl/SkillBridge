import Image from "next/image";
import Link from "next/link";
import {
  FiArrowRight,
  FiSearch,
  FiShield,
  FiStar,
  FiUser,
  FiZap,
} from "react-icons/fi";
import { getServices } from "@/services/supabase/servicesApi";
import { getUsersByIds } from "@/services/supabase/userApi";
import { formatPrice } from "@/utils/format";

type ServiceRow = {
  id?: string;
  title?: string;
  category?: string;
  seller_id?: string;
  price?: number | string;
  average_rating?: number | string;
  rating?: number | string;
  reviews_count?: number | string;
  thumbnail_url?: string;
  image_url?: string;
  cover_image?: string;
  created_at?: string;
};

type SellerRow = {
  id: string;
  full_name?: string;
  email?: string;
  avatar?: string;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default async function HomePage() {
  const { services } = await getServices();
  const serviceRows = (Array.isArray(services) ? services : []) as ServiceRow[];

  const sellerIds = Array.from(
    new Set(
      serviceRows
        .map((service) => String(service.seller_id || "").trim())
        .filter(Boolean),
    ),
  );

  const { users } = await getUsersByIds(sellerIds);
  const sellerMap = new Map<string, SellerRow>(
    (Array.isArray(users) ? users : []).map((user) => [
      String(user.id),
      user as SellerRow,
    ]),
  );

  const categories = Array.from(
    new Set(
      serviceRows
        .map((service) => String(service.category || "").trim())
        .filter(Boolean),
    ),
  ).slice(0, 8);

  const featuredServices = [...serviceRows]
    .sort(
      (left, right) =>
        toNumber(right.average_rating ?? right.rating) -
        toNumber(left.average_rating ?? left.rating),
    )
    .slice(0, 3);

  return (
    <section className="space-y-8">
      <section className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.7)] md:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
          <div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-(--text-primary) md:text-5xl">
              Find the perfect freelance services for your business
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-(--text-secondary) md:text-base">
              SkillBridge connects you with vetted experts in development,
              design, writing, and growth. Search quickly, compare talent, and
              ship projects with confidence.
            </p>

            <form
              action="/services"
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <label className="relative flex-1">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-(--text-muted)" />
                <input
                  type="search"
                  name="q"
                  placeholder="What service are you looking for?"
                  className="h-11 w-full rounded-xl border border-(--input-border) bg-(--input-bg) pl-10 pr-3 text-sm text-(--input-text) placeholder:text-(--input-placeholder) focus:border-(--input-border-focus) focus:outline-none"
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-(--btn-bg-primary) px-5 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
              >
                Search <FiArrowRight className="size-4" />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold uppercase tracking-wide text-(--text-muted)">
                Popular
              </span>
              {["Website Design", "WordPress", "Logo Design", "SEO"].map(
                (tag) => (
                  <Link
                    key={tag}
                    href={`/services?q=${encodeURIComponent(tag)}`}
                    className="rounded-md border border-(--border-color) bg-(--bg-secondary) px-2.5 py-1 font-medium text-(--text-secondary) hover:text-(--color-primary)"
                  >
                    {tag}
                  </Link>
                ),
              )}
            </div>
          </div>

          <div className="relative hidden overflow-hidden rounded-3xl  p-4 shadow-sm xl:block">
            {/* <div className="absolute inset-0 bg-indigo-50 rounded-[40px] -rotate-6 transform scale-105 z-0" /> */}
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-(--border-color)">
              <Image
                src={featuredServices[0]?.thumbnail_url || "/SkillBridge.png"}
                alt={featuredServices[0]?.title || "Featured service"}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <div className="absolute bottom-8 left-8 rounded-xl border border-(--border-color) bg-(--bg-card) px-3 py-2 shadow-sm animate-bounce duration-3000">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-(--bg-secondary) text-(--color-primary)">
                  <FiShield className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-(--text-primary)">
                    Protected payments
                  </p>
                  <p className="text-xs text-(--text-muted)">
                    Every order is secured end-to-end.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-sm">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-(--text-primary)">
              Explore by Category
            </h2>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Discover the exact talent you need right now.
            </p>
          </div>
          <Link
            href="/services"
            className="hidden items-center gap-1 text-sm font-semibold text-(--color-primary) hover:opacity-85 sm:inline-flex"
          >
            View all <FiArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category}
                href={`/services?category=${encodeURIComponent(category)}`}
                className="group rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4 hover:border-(--color-primary)"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-(--bg-card) text-(--color-primary)">
                  <FiZap className="size-4" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-(--text-primary) group-hover:text-(--color-primary)">
                  {category}
                </h3>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-sm text-(--text-muted)">
              No categories yet. Add services to see category highlights.
            </p>
          )}
        </div>
      </section>

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

      <section className="rounded-3xl border border-(--border-color) bg-(--bg-secondary) p-6 text-center shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
          Ready to earn?
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-(--text-primary)">
          Start your freelance journey
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-(--text-secondary)">
          Whether you want to hire trusted experts or offer your own services,
          SkillBridge gives you the tools to do both.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/services"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-(--btn-bg-primary) px-5 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
          >
            Find Services
          </Link>
          <Link
            href="/services"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-(--border-color) bg-(--bg-card) px-5 text-sm font-semibold text-(--text-primary) hover:bg-(--hover-bg)"
          >
            Become a Seller
          </Link>
        </div>
      </section>
    </section>
  );
}
