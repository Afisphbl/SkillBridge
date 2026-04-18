import { cn } from "@/utils/helpers";

export default function Loader({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-white/45 border-t-white",
        className,
      )}
      aria-label="Loading"
      role="status"
    />
  );
}
