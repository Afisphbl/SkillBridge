import { cn } from "@/utils/helpers";
import type { ServiceStatus } from "./types";

export default function ServiceStatusBadge({
  status,
}: {
  status: ServiceStatus;
}) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        status === "active" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "paused" && "border-amber-200 bg-amber-50 text-amber-700",
        status === "draft" && "border-slate-300 bg-slate-100 text-slate-600",
      )}
    >
      {label}
    </span>
  );
}
