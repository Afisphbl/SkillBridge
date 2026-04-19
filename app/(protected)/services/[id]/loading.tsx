function DetailSkeletonBlock() {
  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
      <div className="h-6 w-1/2 animate-pulse rounded bg-(--bg-secondary)" />
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-(--bg-secondary)" />
      <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-(--bg-secondary)" />
    </div>
  );
}

export default function LoadingServiceDetailsPage() {
  return (
    <section className="space-y-6">
      <DetailSkeletonBlock />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-6">
          <div className="h-96 animate-pulse rounded-2xl border border-(--border-color) bg-(--bg-secondary)" />
          <DetailSkeletonBlock />
          <DetailSkeletonBlock />
          <DetailSkeletonBlock />
          <DetailSkeletonBlock />
        </div>

        <div className="h-72 animate-pulse rounded-2xl border border-(--border-color) bg-(--bg-card)" />
      </div>
    </section>
  );
}
