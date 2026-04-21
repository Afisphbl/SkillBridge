import { FiPlus } from "react-icons/fi";
import Button from "@/components/UI/Button";
import type { SubmitMode } from "./types";

type CreateServiceHeaderProps = {
  loading: boolean;
  onSubmit: (mode: SubmitMode) => void;
};

export default function CreateServiceHeader({
  loading,
  onSubmit,
}: CreateServiceHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
          Seller Workspace
        </p>
        <h1 className="mt-1 text-2xl font-bold text-(--text-primary)">
          Create New Service
        </h1>
      </div>

      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        <Button
          type="button"
          onClick={() => onSubmit("draft")}
          loading={loading}
          disabled={loading}
          className="w-full rounded-xl bg-(--btn-bg-secondary) text-(--btn-text-secondary) hover:bg-(--btn-bg-secondary-hover) sm:w-auto"
        >
          Save Draft
        </Button>
        <Button
          type="button"
          onClick={() => onSubmit("publish")}
          loading={loading}
          disabled={loading}
          className="w-full rounded-xl sm:w-auto"
        >
          <FiPlus className="mr-2 size-4" />
          Publish Service
        </Button>
      </div>
    </header>
  );
}
