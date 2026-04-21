"use client";

import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar({
  value,
  searching,
  onChange,
  onSubmit,
  onClear,
}: {
  value: string;
  searching: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}) {
  return (
    <form
      className="relative"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-(--text-muted)" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search for web development, logo design, social media marketing..."
        className="h-11 w-full rounded-xl border border-(--input-border) bg-(--input-bg) pl-10 pr-24 text-sm text-(--input-text) shadow-sm outline-none focus:border-(--input-border-focus) focus:ring-2 focus:ring-blue-500/20"
      />

      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="text-(--text-muted) hover:text-(--text-primary)"
            aria-label="Clear search"
          >
            <FiX className="size-4" />
          </button>
        ) : null}

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md p-1 text-(--text-muted) hover:text-(--text-primary)"
          aria-label="Search services"
        >
          <FiSearch className="size-4" />
        </button>
      </div>

      {searching ? (
        <span className="pointer-events-none absolute right-3 top-full mt-1 text-[11px] font-medium text-(--color-primary)">
          Searching...
        </span>
      ) : null}
    </form>
  );
}
