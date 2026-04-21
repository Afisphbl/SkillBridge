"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiLayers,
  FiPlus,
} from "react-icons/fi";
import Button from "@/components/UI/Button";
import Loader from "@/components/UI/Loader";
import { useAuth } from "@/hooks/useAuth";
import { deleteServiceFolder } from "@/services/supabase/serviceImagesStorage";
import {
  deleteService,
  getSellerServices,
  getServiceById,
  updateServiceStatus,
} from "@/services/supabase/servicesApi";
import BulkActionsBar from "./BulkActionsBar";
import DeleteServiceModal from "./DeleteServiceModal";
import ServicesFilterBar from "./ServicesFilterBar";
import ServicesGrid from "./ServicesGrid";
import ServicesStats from "./ServicesStats";
import { normalizeService } from "./normalizeService";
import type {
  ServiceFilters,
  ServiceItem,
  ServiceSort,
  ServiceStatus,
} from "./types";

const PAGE_SIZE = 9;

function sortServices(list: ServiceItem[], sort: ServiceSort) {
  const cloned = [...list];

  switch (sort) {
    case "oldest":
      return cloned.sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime(),
      );
    case "best-selling":
      return cloned.sort((left, right) => right.orders - left.orders);
    case "highest-rated":
      return cloned.sort((left, right) => right.rating - left.rating);
    case "most-viewed":
      return cloned.sort((left, right) => right.views - left.views);
    case "newest":
    default:
      return cloned.sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );
  }
}

function filterServices(list: ServiceItem[], filters: ServiceFilters) {
  const query = filters.query.trim().toLowerCase();

  return list.filter((service) => {
    const queryMatch =
      !query ||
      service.title.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query) ||
      service.tags.some((tag) => tag.toLowerCase().includes(query));

    const statusMatch =
      filters.status === "all" ? true : service.status === filters.status;

    const categoryMatch =
      filters.category === "all"
        ? true
        : service.category.toLowerCase() === filters.category;

    return queryMatch && statusMatch && categoryMatch;
  });
}

export default function SellerServicesPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [filters, setFilters] = useState<ServiceFilters>({
    query: "",
    status: "all",
    category: "all",
    sort: "newest",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [page, setPage] = useState(1);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(
    null,
  );

  useEffect(() => {
    const sellerId = session?.user?.id;
    if (!sellerId) {
      setServices([]);
      setLoadingServices(false);
      return;
    }

    let active = true;

    async function loadSellerServices() {
      setLoadingServices(true);
      const { services: fetched, error } = await getSellerServices(sellerId);

      if (!active) return;

      if (error) {
        toast.error(error.message || "Failed to load seller services");
        setServices([]);
        setLoadingServices(false);
        return;
      }

      const normalized = (Array.isArray(fetched) ? fetched : []).map((item) =>
        normalizeService(item as Record<string, unknown>),
      );

      setServices(normalized);
      setLoadingServices(false);
    }

    void loadSellerServices();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const filteredAndSorted = useMemo(() => {
    const filtered = filterServices(services, filters);
    return sortServices(filtered, filters.sort);
  }, [filters, services]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSorted.length / PAGE_SIZE),
  );

  const paginatedServices = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((item) => item.status === "active").length;
    const paused = services.filter((item) => item.status === "paused").length;
    const totalOrders = services.reduce((sum, item) => sum + item.orders, 0);

    return { total, active, paused, totalOrders };
  }, [services]);

  const selectedCount = selectedIds.size;

  const updateOneStatus = async (serviceId: string, status: ServiceStatus) => {
    setPending(true);
    try {
      const { error } = await updateServiceStatus(serviceId, status);
      if (error) {
        toast.error(error.message || "Failed to update service status");
        return;
      }

      setServices((current) =>
        current.map((item) =>
          item.id === serviceId ? { ...item, status } : item,
        ),
      );
      toast.success(`Service set to ${status}`);
    } finally {
      setPending(false);
    }
  };

  const removeOne = async (serviceId: string) => {
    setPending(true);
    try {
      const sellerId = session?.user?.id;
      if (!sellerId) throw new Error("Unauthorized");

      const { service, error: fetchError } = await getServiceById(serviceId);
      if (fetchError || !service) {
        toast.error("Service does not exist");
        return;
      }

      if (service.seller_id !== sellerId) {
        toast.error("Unauthorized");
        return;
      }

      const { error: storageError } = await deleteServiceFolder(sellerId, serviceId);
      if (storageError) {
        toast.error("Failed to delete service images");
        return;
      }

      const { error } = await deleteService(serviceId);
      if (error) {
        toast.error(error.message || "Failed to delete service");
        return;
      }

      setServices((current) => current.filter((item) => item.id !== serviceId));
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(serviceId);
        return next;
      });
      setServiceToDelete(null);
      toast.success("Service deleted successfully");
    } catch {
      toast.error("Failed to delete service");
    } finally {
      setPending(false);
    }
  };

  const duplicateOne = async (serviceId: string) => {
    router.push(`/seller/services/duplicate/${serviceId}`);
  };

  const updateMany = async (status: ServiceStatus) => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    setPending(true);
    try {
      const results = await Promise.all(
        ids.map((serviceId) => updateServiceStatus(serviceId, status)),
      );
      const failed = results.filter((result) => result.error);

      if (failed.length) {
        toast.error(
          `Updated ${ids.length - failed.length} of ${ids.length} services`,
        );
      } else {
        toast.success(`${ids.length} services set to ${status}`);
      }

      const failedIds = new Set(
        results
          .map((result, index) => (result.error ? ids[index] : null))
          .filter((value): value is string => Boolean(value)),
      );

      setServices((current) =>
        current.map((item) =>
          failedIds.has(item.id)
            ? item
            : selectedIds.has(item.id)
              ? { ...item, status }
              : item,
        ),
      );
      setSelectedIds(new Set());
    } finally {
      setPending(false);
    }
  };

  const deleteMany = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    setPending(true);
    try {
      const sellerId = session?.user?.id;
      if (!sellerId) throw new Error("Unauthorized");

      const results = await Promise.all(
        ids.map(async (serviceId) => {
          const { service, error: fetchError } = await getServiceById(serviceId);
          if (fetchError || !service || service.seller_id !== sellerId) {
            return { error: new Error("Unauthorized") };
          }

          const { error: storageError } = await deleteServiceFolder(sellerId, serviceId);
          if (storageError) {
            return { error: new Error("Storage failure") };
          }

          return deleteService(serviceId);
        }),
      );
      const failedIds = new Set(
        results
          .map((result, index) => (result.error ? ids[index] : null))
          .filter((value): value is string => Boolean(value)),
      );

      setServices((current) =>
        current.filter(
          (item) => failedIds.has(item.id) || !selectedIds.has(item.id),
        ),
      );

      setSelectedIds(new Set());

      if (failedIds.size) {
        toast.error(
          `Deleted ${ids.length - failedIds.size} of ${ids.length} services`,
        );
      } else {
        toast.success("Selected services deleted successfully");
      }
    } catch {
      toast.error("Failed to delete services");
    } finally {
      setPending(false);
    }
  };

  const handleSelect = (serviceId: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(serviceId);
      } else {
        next.delete(serviceId);
      }

      return next;
    });
  };

  const canShowEmptyState = !filteredAndSorted.length;

  if (loadingServices) {
    return (
      <section className="grid min-h-80 place-items-center rounded-2xl border border-(--border-color) bg-(--bg-card)">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-(--text-secondary)">
          <Loader className="border-cyan-800/50 border-t-cyan-800" />
          Loading services...
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-muted)">
            Seller Workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold text-(--text-primary)">
            Services
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Manage your offers, performance, and visibility in one place.
          </p>
        </div>

        <Link href="/seller/services/create" className="w-full sm:w-auto">
          <Button className="w-full rounded-xl px-4 sm:w-auto">
            <FiPlus className="mr-2 size-4" />
            Create New Service
          </Button>
        </Link>
      </header>

      <ServicesFilterBar
        filters={filters}
        onFiltersChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <ServicesStats stats={stats} />

      <BulkActionsBar
        selectedCount={selectedCount}
        disabled={pending}
        onPauseSelected={() => void updateMany("paused")}
        onActivateSelected={() => void updateMany("active")}
        onDeleteSelected={() => {
          if (!selectedCount) return;
          setServiceToDelete({
            id: "bulk",
            title: `${selectedCount} selected services`,
            category: "other",
            tags: [],
            price: 0,
            deliveryDays: 0,
            rating: 0,
            orders: 0,
            views: 0,
            conversionRate: 0,
            image: "",
            status: "draft",
            visibility: "public",
            createdAt: new Date().toISOString(),
          });
        }}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {canShowEmptyState ? (
        <section className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card) p-8 text-center">
          <div>
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-(--bg-secondary) text-(--color-primary)">
              <FiLayers className="size-6" />
            </div>
            <h2 className="text-xl font-semibold text-(--text-primary)">
              You have not created any services yet
            </h2>
            <p className="mt-2 text-sm text-(--text-secondary)">
              Start publishing your first offer to reach buyers and generate
              revenue.
            </p>

            <Link href="/seller/services/create" className="mt-5 inline-flex">
              <Button className="w-auto rounded-xl px-4">
                <FiBriefcase className="mr-2 size-4" />
                Create Your First Service
              </Button>
            </Link>
          </div>
        </section>
      ) : (
        <ServicesGrid
          services={paginatedServices}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onDuplicate={(serviceId) => void duplicateOne(serviceId)}
          onPause={(serviceId) => void updateOneStatus(serviceId, "paused")}
          onActivate={(serviceId) => void updateOneStatus(serviceId, "active")}
          onDelete={(serviceId) => {
            const current =
              services.find((item) => item.id === serviceId) ?? null;
            setServiceToDelete(current);
          }}
        />
      )}

      {!canShowEmptyState ? (
        <nav
          className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-(--border-color) bg-(--bg-card) px-4 py-3"
          aria-label="Services pagination"
        >
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-(--border-color) px-3 py-1.5 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg) disabled:opacity-50"
          >
            <FiArrowLeft className="size-4" />
            Previous
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;

              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`inline-flex size-8 items-center justify-center rounded-lg text-sm font-semibold ${
                    page === pageNumber
                      ? "bg-(--color-primary) text-white"
                      : "border border-(--border-color) text-(--text-secondary) hover:bg-(--hover-bg)"
                  }`}
                  aria-current={page === pageNumber ? "page" : undefined}
                  aria-label={`Go to page ${pageNumber}`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-(--border-color) px-3 py-1.5 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg) disabled:opacity-50"
          >
            Next
            <FiArrowRight className="size-4" />
          </button>
        </nav>
      ) : null}

      <DeleteServiceModal
        open={Boolean(serviceToDelete)}
        loading={pending}
        title={serviceToDelete?.title}
        onClose={() => {
          if (!pending) {
            setServiceToDelete(null);
          }
        }}
        onConfirm={() => {
          if (!serviceToDelete) return;

          if (serviceToDelete.id === "bulk") {
            void deleteMany().then(() => setServiceToDelete(null));
            return;
          }

          void removeOne(serviceToDelete.id);
        }}
      />
    </section>
  );
}
