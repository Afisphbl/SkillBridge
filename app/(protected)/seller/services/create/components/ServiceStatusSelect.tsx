import type { ServiceFormData } from "./types";

export default function ServiceStatusSelect({
  value,
  onChange,
}: {
  value: ServiceFormData["status"];
  onChange: (value: ServiceFormData["status"]) => void;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-semibold text-(--text-secondary)">
        Status
      </span>
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value as ServiceFormData["status"])
        }
        className="soft-field h-11 w-full rounded-md px-3 text-sm focus:border-(--input-border-focus) focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
      </select>
    </label>
  );
}
