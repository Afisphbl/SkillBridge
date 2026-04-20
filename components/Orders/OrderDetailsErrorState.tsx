import Link from "next/link";

type OrderDetailsErrorStateProps = {
  errorMessage: string;
};

export default function OrderDetailsErrorState({
  errorMessage,
}: OrderDetailsErrorStateProps) {
  return (
    <section className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 text-center shadow-sm">
      <h1 className="text-lg font-bold text-(--color-danger)">
        Failed to load order
      </h1>
      <p className="mt-2 text-sm text-(--text-secondary)">
        {errorMessage || "Something went wrong while loading order details."}
      </p>
      <Link
        href="/orders"
        className="mt-4 inline-flex h-10 items-center rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
      >
        Back to orders
      </Link>
    </section>
  );
}
