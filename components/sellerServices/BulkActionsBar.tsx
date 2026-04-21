"use client";

import { FiPauseCircle, FiPlayCircle, FiTrash2, FiX } from "react-icons/fi";

type BulkActionsBarProps = {
  selectedCount: number;
  disabled: boolean;
  onPauseSelected: () => void;
  onActivateSelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
};

export default function BulkActionsBar({
  selectedCount,
  disabled,
  onPauseSelected,
  onActivateSelected,
  onDeleteSelected,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount <= 0) return null;

  return (
    <section className="sticky top-16 z-20 rounded-2xl border border-sky-200 bg-sky-50/90 p-3 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-2 text-sm font-semibold text-sky-900">
          {selectedCount} selected
        </p>

        <button
          type="button"
          disabled={disabled}
          onClick={onPauseSelected}
          className="inline-flex items-center gap-1.5 rounded-lg border border-(--border-color) bg-white px-3 py-1.5 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg) disabled:opacity-60"
        >
          <FiPauseCircle className="size-3.5" />
          Pause Selected
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onActivateSelected}
          className="inline-flex items-center gap-1.5 rounded-lg border border-(--border-color) bg-white px-3 py-1.5 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg) disabled:opacity-60"
        >
          <FiPlayCircle className="size-3.5" />
          Activate Selected
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onDeleteSelected}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
        >
          <FiTrash2 className="size-3.5" />
          Delete Selected
        </button>

        <button
          type="button"
          onClick={onClearSelection}
          className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-(--text-muted) hover:bg-(--hover-bg)"
          aria-label="Clear selected services"
        >
          <FiX className="size-3.5" />
          Clear
        </button>
      </div>
    </section>
  );
}
