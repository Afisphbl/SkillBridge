"use client";

import { FiFilter, FiSearch } from "react-icons/fi";
import Input from "@/components/UI/Input";
import type { ServiceFilters } from "./types";

type ServicesFilterBarProps = {
  filters: ServiceFilters;
  onFiltersChange: (next: ServiceFilters) => void;
};

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "writing", label: "Writing" },
  { value: "marketing", label: "Marketing" },
  { value: "video", label: "Video" },
  { value: "other", label: "Other" },
] as const;

const statusOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "draft", label: "Draft" },
] as const;

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "best-selling", label: "Best Selling" },
  { value: "highest-rated", label: "Highest Rated" },
  { value: "most-viewed", label: "Most Viewed" },
] as const;

export default function ServicesFilterBar({
  filters,
  onFiltersChange,
}: ServicesFilterBarProps) {
  return (
    <section className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] lg:items-center">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--text-muted)" />
          <Input
            value={filters.query}
            onChange={(event) =>
              onFiltersChange({ ...filters, query: event.target.value })
            }
            className="pl-10"
            placeholder="Search services..."
            aria-label="Search services"
          />
        </div>

        <label className="space-y-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-(--text-muted)">
            <FiFilter className="size-3.5" />
            Status
          </span>
          <select
            value={filters.status}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                status: event.target.value as ServiceFilters["status"],
              })
            }
            className="h-11 w-full rounded-md border border-(--input-border) bg-(--input-bg) px-3 text-sm text-(--input-text) focus:border-(--input-border-focus) focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Filter by status"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold text-(--text-muted)">
            Category
          </span>
          <select
            value={filters.category}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                category: event.target.value as ServiceFilters["category"],
              })
            }
            className="h-11 w-full rounded-md border border-(--input-border) bg-(--input-bg) px-3 text-sm text-(--input-text) focus:border-(--input-border-focus) focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Filter by category"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold text-(--text-muted)">
            Sort by
          </span>
          <select
            value={filters.sort}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                sort: event.target.value as ServiceFilters["sort"],
              })
            }
            className="h-11 w-full rounded-md border border-(--input-border) bg-(--input-bg) px-3 text-sm text-(--input-text) focus:border-(--input-border-focus) focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Sort services"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
