"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiFilter, FiX } from "react-icons/fi";
import FilterSidebar from "./FilterSidebar";
import SearchBar from "./SearchBar";
import ServiceCard from "./ServiceCard";
import {
  getServicesByCategory,
  getServicesPaginated,
  searchServices,
} from "@/services/supabase/servicesApi";
import { getUsersByIds } from "@/services/supabase/userApi";

type ServiceRecord = {
  id?: string;
  category?: string;
  subcategory?: string;
  seller_id?: string;
  seller_name?: string;
  seller_avatar?: string;
  reviews_count?: number | string;
  seller_level?: string;
  sellerLevel?: string;
  created_at?: string;
  price?: number | string;
  base_price?: number | string;
  hourly_rate?: number | string;
  rating?: number | string;
  average_rating?: number | string;
  delivery_days?: number | string;
  delivery_time?: number | string;
  [key: string]: unknown;
};

type UserProfile = {
  full_name?: string;
  email?: string;
  avatar?: string;
};

type MarketplaceFilters = {
  category: string;
  subcategory: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  deliveryTime: string;
  sellerLevel: string;
};

const PAGE_LIMIT = 9;
const DEFAULT_CATEGORIES = [
  "Web Development",
  "Design",
  "Marketing",
  "Writing",
  "Video & Animation",
  "Data",
  "AI Services",
];

const INITIAL_FILTERS: MarketplaceFilters = {
  category: "",
  subcategory: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  deliveryTime: "",
  sellerLevel: "",
};

type SortValue = "relevant" | "price_low" | "price_high" | "rated" | "newest";

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function filterServices(
  services: ServiceRecord[],
  filters: MarketplaceFilters,
): ServiceRecord[] {
  const minPrice = filters.minPrice ? Number(filters.minPrice) : null;
  const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;
  const minRating = filters.minRating ? Number(filters.minRating) : null;
  const maxDeliveryDays = filters.deliveryTime
    ? Number(filters.deliveryTime)
    : null;

  return services.filter((service) => {
    const category = normalizeText(service.category);
    const selectedCategory = normalizeText(filters.category);

    if (selectedCategory && category !== selectedCategory) {
      return false;
    }

    const subcategory = normalizeText(service.subcategory);
    const selectedSubcategory = normalizeText(filters.subcategory);

    if (selectedSubcategory && subcategory !== selectedSubcategory) {
      return false;
    }

    const price = toNumber(
      service.price ?? service.base_price ?? service.hourly_rate,
      0,
    );

    if (minPrice !== null && price < minPrice) return false;
    if (maxPrice !== null && price > maxPrice) return false;

    const rating = toNumber(service.average_rating ?? service.rating, 0);
    if (minRating !== null && rating < minRating) return false;

    const delivery = toNumber(
      service.delivery_days ?? service.delivery_time,
      999,
    );
    if (maxDeliveryDays !== null && delivery > maxDeliveryDays) return false;

    const sellerLevel = normalizeText(
      service.seller_level ?? service.sellerLevel,
    );
    const selectedSellerLevel = normalizeText(filters.sellerLevel);
    if (selectedSellerLevel && sellerLevel !== selectedSellerLevel)
      return false;

    return true;
  });
}

function sortServices(services: ServiceRecord[], sortBy: SortValue) {
  const sorted = [...services];

  if (sortBy === "price_low") {
    sorted.sort(
      (a, b) =>
        toNumber(a.price ?? a.base_price ?? a.hourly_rate, 0) -
        toNumber(b.price ?? b.base_price ?? b.hourly_rate, 0),
    );
  }

  if (sortBy === "price_high") {
    sorted.sort(
      (a, b) =>
        toNumber(b.price ?? b.base_price ?? b.hourly_rate, 0) -
        toNumber(a.price ?? a.base_price ?? a.hourly_rate, 0),
    );
  }

  if (sortBy === "rated") {
    sorted.sort(
      (a, b) =>
        toNumber(b.average_rating ?? b.rating, 0) -
        toNumber(a.average_rating ?? a.rating, 0),
    );
  }

  if (sortBy === "newest") {
    sorted.sort(
      (a, b) =>
        new Date(String(b.created_at ?? 0)).getTime() -
        new Date(String(a.created_at ?? 0)).getTime(),
    );
  }

  return sorted;
}

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full border border-(--color-primary) bg-(--color-primary)/12 px-3 py-1 text-xs font-medium text-(--color-primary)"
    >
      <span>{label}</span>
      <FiX className="size-3" />
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 shadow-sm">
      <div className="h-40 animate-pulse rounded-xl bg-(--bg-secondary)" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded bg-(--bg-secondary)" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-(--bg-secondary)" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-(--bg-secondary)" />
      </div>
      <div className="mt-4 h-8 w-full animate-pulse rounded bg-(--bg-secondary)" />
    </div>
  );
}

export default function MarketplaceServicesClient() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("relevant");
  const [filters, setFilters] = useState<MarketplaceFilters>(INITIAL_FILTERS);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [resultMode, setResultMode] = useState<
    "browse" | "search" | "category"
  >("browse");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const enrichServicesWithSeller = useCallback(
    async (items: ServiceRecord[]): Promise<ServiceRecord[]> => {
      const sellerIds = Array.from(
        new Set(
          items
            .map((service) => String(service.seller_id ?? "").trim())
            .filter(Boolean),
        ),
      );

      if (sellerIds.length === 0) return items;

      const { users } = await getUsersByIds(sellerIds);
      const sellerMap = new Map(
        ((users as Array<{ id?: string } & UserProfile> | null) ?? [])
          .map((user) => [String(user.id ?? ""), user] as const)
          .filter(([id]) => Boolean(id)),
      );

      return items.map((service) => {
        const sellerId = String(service.seller_id ?? "").trim();
        const profile =
          (sellerMap.get(sellerId) as UserProfile | undefined) ?? null;
        const fallbackName = profile?.email?.split("@")[0] ?? "";

        return {
          ...service,
          seller_name:
            String(service.seller_name ?? "").trim() ||
            String(profile?.full_name ?? "").trim() ||
            fallbackName,
          seller_avatar:
            String(service.seller_avatar ?? "").trim() ||
            String(profile?.avatar ?? "").trim(),
        };
      });
    },
    [],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    let active = true;

    async function runFetch() {
      setError("");
      setLoading(true);

      try {
        if (debouncedQuery) {
          setSearching(true);
          const { services: data, error: apiError } =
            await searchServices(debouncedQuery);
          if (apiError) throw apiError;
          if (!active) return;

          const enriched = await enrichServicesWithSeller(
            (data as ServiceRecord[]) ?? [],
          );
          if (!active) return;

          setResultMode("search");
          setServices(enriched);
          setCount(enriched.length);
          setPage(1);
          setSearching(false);
          return;
        }

        if (filters.category) {
          const { services: data, error: apiError } =
            await getServicesByCategory(filters.category);
          if (apiError) throw apiError;
          if (!active) return;

          const enriched = await enrichServicesWithSeller(
            (data as ServiceRecord[]) ?? [],
          );
          if (!active) return;

          setResultMode("category");
          setServices(enriched);
          setCount(enriched.length);
          setPage(1);
          return;
        }

        const {
          services: paginated,
          error: apiError,
          count: total,
        } = await getServicesPaginated(1, PAGE_LIMIT);
        if (apiError) throw apiError;
        if (!active) return;

        const enriched = await enrichServicesWithSeller(
          (paginated as ServiceRecord[]) ?? [],
        );
        if (!active) return;

        setResultMode("browse");
        setServices(enriched);
        setCount(total ?? 0);
        setPage(1);
      } catch {
        if (!active) return;
        setError("Unable to load services right now. Please try again.");
        setServices([]);
        setCount(0);
      } finally {
        if (!active) return;
        setLoading(false);
        setSearching(false);
      }
    }

    void runFetch();

    return () => {
      active = false;
    };
  }, [debouncedQuery, enrichServicesWithSeller, filters.category]);

  const onLoadMore = useCallback(async () => {
    if (loadingMore) return;

    if (resultMode !== "browse") {
      setCount((current) => current + PAGE_LIMIT);
      return;
    }

    setLoadingMore(true);
    setError("");

    try {
      const nextPage = page + 1;
      const { services: nextChunk, error: apiError } =
        await getServicesPaginated(nextPage, PAGE_LIMIT);
      if (apiError) throw apiError;

      const normalized = (nextChunk as ServiceRecord[]) ?? [];
      const enriched = await enrichServicesWithSeller(normalized);
      setServices((current) => [...current, ...enriched]);
      setPage(nextPage);
    } catch {
      setError("Unable to load more services.");
    } finally {
      setLoadingMore(false);
    }
  }, [enrichServicesWithSeller, loadingMore, page, resultMode]);

  const categories = useMemo(() => {
    const fromData = services
      .map((service) => String(service.category ?? "").trim())
      .filter(Boolean);

    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromData]));
  }, [services]);

  const subcategories = useMemo(() => {
    return Array.from(
      new Set(
        services
          .map((service) => String(service.subcategory ?? "").trim())
          .filter(Boolean),
      ),
    );
  }, [services]);

  const filteredSortedServices = useMemo(() => {
    const filtered = filterServices(services, filters);
    return sortServices(filtered, sortBy);
  }, [filters, services, sortBy]);

  const visibleServices = useMemo(() => {
    if (resultMode === "browse") return filteredSortedServices;
    return filteredSortedServices.slice(0, count || PAGE_LIMIT);
  }, [count, filteredSortedServices, resultMode]);

  const hasMore = useMemo(() => {
    if (resultMode === "browse") {
      return services.length < count;
    }
    return filteredSortedServices.length > visibleServices.length;
  }, [
    count,
    filteredSortedServices.length,
    resultMode,
    services.length,
    visibleServices.length,
  ]);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: keyof MarketplaceFilters; label: string }> = [];

    if (filters.category)
      chips.push({ key: "category", label: `Category: ${filters.category}` });
    if (filters.subcategory) {
      chips.push({
        key: "subcategory",
        label: `Subcategory: ${filters.subcategory}`,
      });
    }
    if (filters.minPrice)
      chips.push({ key: "minPrice", label: `Min: $${filters.minPrice}` });
    if (filters.maxPrice)
      chips.push({ key: "maxPrice", label: `Max: $${filters.maxPrice}` });
    if (filters.minRating)
      chips.push({ key: "minRating", label: `Rating: ${filters.minRating}+` });
    if (filters.deliveryTime) {
      chips.push({
        key: "deliveryTime",
        label: `Delivery: ${filters.deliveryTime}d`,
      });
    }
    if (filters.sellerLevel) {
      chips.push({
        key: "sellerLevel",
        label: `Seller: ${filters.sellerLevel}`,
      });
    }

    return chips;
  }, [filters]);

  const updateFilter = useCallback(
    <K extends keyof MarketplaceFilters>(
      key: K,
      value: MarketplaceFilters[K],
    ) => {
      setFilters((current) => {
        if (key === "category") {
          return {
            ...current,
            category: value,
            subcategory: "",
          };
        }

        return { ...current, [key]: value };
      });
    },
    [],
  );

  const removeChip = useCallback((key: keyof MarketplaceFilters) => {
    setFilters((current) => ({ ...current, [key]: "" }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm md:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-(--text-primary) md:text-3xl">
              Explore Marketplace Services
            </h1>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Find trusted freelancers for design, development, marketing, and
              more.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((open) => !open)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg) lg:hidden"
            >
              <FiFilter className="size-4" />
              Filters
            </button>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortValue)}
              className="h-10 rounded-md border border-(--input-border) bg-(--input-bg) px-3 text-sm font-medium text-(--input-text) outline-none focus:border-(--input-border-focus) focus:ring-2 focus:ring-blue-500/20"
              aria-label="Sort services"
            >
              <option value="relevant">Most Relevant</option>
              <option value="price_low">Price Low to High</option>
              <option value="price_high">Price High to Low</option>
              <option value="rated">Best Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <SearchBar
          value={query}
          searching={searching}
          onChange={setQuery}
          onClear={() => setQuery("")}
        />

        {activeFilterChips.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeFilterChips.map((chip) => (
              <ActiveFilterChip
                key={chip.key}
                label={chip.label}
                onRemove={() => removeChip(chip.key)}
              />
            ))}
          </div>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className={mobileFiltersOpen ? "block" : "hidden lg:block"}>
          <FilterSidebar
            categories={categories}
            subcategories={subcategories}
            filters={filters}
            onFilterChange={updateFilter}
            onClear={clearAllFilters}
          />
        </div>

        <div className="space-y-5">
          {error ? (
            <div className="inline-flex items-center gap-2 rounded-lg border border-(--color-danger)/35 bg-(--badge-danger-bg) px-4 py-3 text-sm font-medium text-(--color-danger)">
              <FiAlertCircle className="size-4" />
              <span>{error}</span>
            </div>
          ) : null}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} />
              ))}
            </div>
          ) : visibleServices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card) px-6 py-12 text-center">
              <h2 className="text-lg font-semibold text-(--text-primary)">
                No services found
              </h2>
              <p className="mt-2 text-sm text-(--text-secondary)">
                Try a broader search or remove one or two filters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleServices.map((service, index) => (
                  <ServiceCard
                    key={String(service.id ?? `service-${index}`)}
                    service={service}
                  />
                ))}
              </div>

              {hasMore ? (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-(--border-color) bg-(--bg-card) px-5 text-sm font-semibold text-(--text-secondary) shadow-sm hover:bg-(--hover-bg) disabled:opacity-60"
                  >
                    {loadingMore ? "Loading..." : "Load more services"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
