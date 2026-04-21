import Link from "next/link";

export const metadata = {
  title: "Edit Service",
};

export default async function SellerEditServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  return (
    <section className="space-y-4 rounded-2xl border border-(--border-color) bg-(--bg-card) p-6">
      <h1 className="text-2xl font-semibold text-(--text-primary)">
        Edit Service
      </h1>
      <p className="text-sm text-(--text-secondary)">
        Editing flow for service{" "}
        <span className="font-semibold">{serviceId}</span> will be implemented
        in the next iteration.
      </p>
      <Link
        href="/seller/services"
        className="inline-flex rounded-lg border border-(--border-color) px-3 py-2 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
      >
        Back to Services
      </Link>
    </section>
  );
}
