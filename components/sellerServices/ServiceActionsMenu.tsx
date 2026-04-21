"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FiCopy,
  FiEdit3,
  FiMoreVertical,
  FiPauseCircle,
  FiPlayCircle,
  FiTrash2,
} from "react-icons/fi";
import type { ServiceItem } from "./types";

type ServiceActionsMenuProps = {
  service: ServiceItem;
  onDuplicate: (serviceId: string) => void;
  onPause: (serviceId: string) => void;
  onActivate: (serviceId: string) => void;
  onDelete: (serviceId: string) => void;
};

export default function ServiceActionsMenu({
  service,
  onDuplicate,
  onPause,
  onActivate,
  onDelete,
}: ServiceActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="grid size-9 place-items-center rounded-lg border border-(--border-color) bg-(--bg-card) text-(--text-secondary) hover:bg-(--hover-bg) hover:text-(--text-primary)"
        aria-haspopup="menu"
        aria-label="Open service actions"
      >
        <FiMoreVertical className="size-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-(--border-color) bg-(--bg-card) p-1.5 shadow-lg"
        >
          <Link
            href={`/seller/services/edit/${service.id}`}
            role="menuitem"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-(--text-secondary) hover:bg-(--hover-bg) hover:text-(--text-primary)"
            onClick={() => setOpen(false)}
          >
            <FiEdit3 className="size-4" />
            <span>Edit Service</span>
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onDuplicate(service.id);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-(--text-secondary) hover:bg-(--hover-bg) hover:text-(--text-primary)"
          >
            <FiCopy className="size-4" />
            <span>Duplicate Service</span>
          </button>

          {service.status === "active" ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onPause(service.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-(--text-secondary) hover:bg-(--hover-bg) hover:text-(--text-primary)"
            >
              <FiPauseCircle className="size-4" />
              <span>Pause Service</span>
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onActivate(service.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-(--text-secondary) hover:bg-(--hover-bg) hover:text-(--text-primary)"
            >
              <FiPlayCircle className="size-4" />
              <span>Activate Service</span>
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onDelete(service.id);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
          >
            <FiTrash2 className="size-4" />
            <span>Delete Service</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
