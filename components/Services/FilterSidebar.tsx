"use client";

type MarketplaceFilters = {
  category: string;
  subcategory: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  deliveryTime: string;
  sellerLevel: string;
};

type FilterSidebarProps = {
  categories: string[];
  subcategories: string[];
  filters: MarketplaceFilters;
  onFilterChange: <K extends keyof MarketplaceFilters>(
    key: K,
    value: MarketplaceFilters[K],
  ) => void;
  onClear: () => void;
};

const ratingOptions = ["", "4", "4.5"];
const deliveryOptions = [
  { value: "", label: "Any" },
  { value: "1", label: "24 hours" },
  { value: "3", label: "3 days" },
  { value: "7", label: "7 days" },
];

const sellerLevelOptions = [
  { value: "", label: "Any" },
  { value: "new", label: "New Seller" },
  { value: "level_1", label: "Level 1" },
  { value: "level_2", label: "Level 2" },
  { value: "top_rated", label: "Top Rated" },
];

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-(--text-muted)">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-(--input-border) bg-(--input-bg) px-3 text-sm text-(--input-text) outline-none focus:border-(--input-border-focus) focus:ring-2 focus:ring-blue-500/20"
      >
        {options.map((option) => (
          <option key={option.label + option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FilterSidebar({
  categories,
  subcategories,
  filters,
  onFilterChange,
  onClear,
}: FilterSidebarProps) {
  return (
    <aside className="space-y-5 rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-(--text-primary)">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-(--border-color) bg-(--bg-card) px-3 py-1 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
        >
          Reset
        </button>
      </div>

      <SelectField
        label="Category"
        value={filters.category}
        onChange={(value) => onFilterChange("category", value)}
        options={[
          { value: "", label: "All categories" },
          ...categories.map((category) => ({
            value: category,
            label: category,
          })),
        ]}
      />

      <SelectField
        label="Subcategory"
        value={filters.subcategory}
        onChange={(value) => onFilterChange("subcategory", value)}
        options={[
          { value: "", label: "All subcategories" },
          ...subcategories.map((subcategory) => ({
            value: subcategory,
            label: subcategory,
          })),
        ]}
      />

      <div className="space-y-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-(--text-muted)">
          Price range
        </span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(event) => onFilterChange("minPrice", event.target.value)}
            className="h-10 rounded-md border border-(--input-border) bg-(--input-bg) px-3 text-sm text-(--input-text) outline-none focus:border-(--input-border-focus) focus:ring-2 focus:ring-blue-500/20"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(event) => onFilterChange("maxPrice", event.target.value)}
            className="h-10 rounded-md border border-(--input-border) bg-(--input-bg) px-3 text-sm text-(--input-text) outline-none focus:border-(--input-border-focus) focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <SelectField
        label="Rating"
        value={filters.minRating}
        onChange={(value) => onFilterChange("minRating", value)}
        options={ratingOptions.map((rating) => ({
          value: rating,
          label: rating ? `${rating}+ stars` : "Any rating",
        }))}
      />

      <SelectField
        label="Delivery time"
        value={filters.deliveryTime}
        onChange={(value) => onFilterChange("deliveryTime", value)}
        options={deliveryOptions}
      />

      <SelectField
        label="Seller level"
        value={filters.sellerLevel}
        onChange={(value) => onFilterChange("sellerLevel", value)}
        options={sellerLevelOptions}
      />
    </aside>
  );
}
