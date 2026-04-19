import Link from "next/link";

export default function ServiceNotFound() {
  return (
    <section className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card) px-6 py-16 text-center">
      <h1 className="text-2xl font-black text-(--text-primary)">
        Service not found
      </h1>
      <p className="mt-2 text-sm text-(--text-secondary)">
        The service you are looking for is unavailable or has been removed.
      </p>

      <Link
        href="/services"
        className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-(--color-primary) px-4 text-sm font-semibold text-white hover:opacity-90"
      >
        Back to services
      </Link>
    </section>
  );
}
