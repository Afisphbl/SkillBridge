"use client";

import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar({
  value,
  searching,
  onChange,
  onClear,
}: {
  value: string;
  searching: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="relative">
      <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-(--text-muted)" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search for web development, logo design, social media marketing..."
        className="h-11 w-full rounded-xl border border-(--input-border) bg-(--input-bg) pl-10 pr-10 text-sm text-(--input-text) shadow-sm outline-none focus:border-(--input-border-focus) focus:ring-2 focus:ring-blue-500/20"
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary)"
          aria-label="Clear search"
        >
          <FiX className="size-4" />
        </button>
      ) : null}

      {searching ? (
        <span className="pointer-events-none absolute right-3 top-full mt-1 text-[11px] font-medium text-(--color-primary)">
          Searching...
        </span>
      ) : null}
    </div>
  );
}
