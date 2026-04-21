import { FiRefreshCcw } from "react-icons/fi";

type CreateServiceRetryNoticeProps = {
  loading: boolean;
  onRetry: () => void;
};

export default function CreateServiceRetryNotice({
  loading,
  onRetry,
}: CreateServiceRetryNoticeProps) {
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      <p>Image upload failed.</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={loading}
        className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-300 px-3 py-1.5 text-xs font-semibold hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <FiRefreshCcw className="size-3" />
        Retry Upload
      </button>
    </section>
  );
}
