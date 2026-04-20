import { useOrderFormModalContext } from "./OrderFormModalProvider";

function useOrderFormStatusBanners() {
  const { isExistingOrder, isLoadingOrder, loadExistingOrder, orderLoadError } =
    useOrderFormModalContext();

  return {
    isExistingOrder,
    isLoadingOrder,
    loadExistingOrder,
    orderLoadError,
  };
}

export default function OrderFormStatusBanners() {
  const { isExistingOrder, isLoadingOrder, loadExistingOrder, orderLoadError } =
    useOrderFormStatusBanners();

  return (
    <>
      {isLoadingOrder ? (
        <div className="rounded-2xl bg-(--bg-secondary) px-4 py-3 text-sm font-medium text-(--text-secondary) ring-1 ring-(--border-color)">
          Loading order...
        </div>
      ) : null}

      {orderLoadError ? (
        <div className="space-y-3 rounded-2xl bg-(--badge-danger-bg) px-4 py-3 text-sm text-(--color-danger) ring-1 ring-(--border-color)">
          <p>{orderLoadError}</p>
          <button
            type="button"
            onClick={loadExistingOrder}
            className="inline-flex h-9 items-center rounded-lg bg-(--btn-bg-primary) px-3 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
          >
            Retry
          </button>
        </div>
      ) : null}

      {isExistingOrder ? (
        <div className="inline-flex items-center rounded-full bg-(--badge-success-bg) px-3 py-1 text-xs font-semibold uppercase tracking-wide text-(--color-success) ring-1 ring-(--border-color)">
          Existing Order Found
        </div>
      ) : null}
    </>
  );
}
