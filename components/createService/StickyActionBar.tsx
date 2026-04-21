import Button from "@/components/UI/Button";
import type { SubmitMode } from "./types";

export default function StickyActionBar({
  loading,
  loadingLabel,
  onSubmit,
  singleActionLabel,
  onSingleAction,
}: {
  loading: boolean;
  loadingLabel: string;
  onSubmit: (mode: SubmitMode) => void;
  singleActionLabel?: string;
  onSingleAction?: () => void;
}) {
  if (singleActionLabel && onSingleAction) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-(--border-color) bg-(--bg-card)/95 p-3 backdrop-blur-sm md:hidden">
        <Button
          type="button"
          loading={loading}
          disabled={loading}
          onClick={onSingleAction}
          className="h-10 w-full rounded-lg"
        >
          {loading ? loadingLabel : singleActionLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-(--border-color) bg-(--bg-card)/95 p-3 backdrop-blur-sm md:hidden">
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          loading={loading}
          disabled={loading}
          onClick={() => onSubmit("draft")}
          className="h-10 rounded-lg bg-(--btn-bg-secondary) text-(--btn-text-secondary) hover:bg-(--btn-bg-secondary-hover)"
        >
          {loading ? loadingLabel : "Save Draft"}
        </Button>
        <Button
          type="button"
          loading={loading}
          disabled={loading}
          onClick={() => onSubmit("publish")}
          className="h-10 rounded-lg"
        >
          {loading ? loadingLabel : "Publish Service"}
        </Button>
      </div>
    </div>
  );
}
