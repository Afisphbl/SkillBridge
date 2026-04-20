export default function OrderDetailsLoadingState() {
  return (
    <section className="space-y-6">
      <div className="h-9 w-36 animate-pulse rounded-md bg-(--bg-secondary)" />
      <div className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-sm">
        <div className="h-5 w-28 animate-pulse rounded bg-(--bg-secondary)" />
        <div className="mt-3 h-8 w-3/5 animate-pulse rounded bg-(--bg-secondary)" />
        <div className="mt-2 h-4 w-2/5 animate-pulse rounded bg-(--bg-secondary)" />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_item, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-(--bg-secondary)"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
