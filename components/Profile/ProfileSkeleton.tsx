export default function ProfileSkeleton() {
  return (
    <section
      className="mx-auto w-full max-w-225 space-y-6"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div className="animate-pulse rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-(--card-shadow) sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="size-24 rounded-full bg-(--bg-secondary)" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-44 rounded bg-(--bg-secondary)" />
            <div className="h-4 w-28 rounded bg-(--bg-secondary)" />
            <div className="h-4 w-52 rounded bg-(--bg-secondary)" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="animate-pulse rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-(--card-shadow) sm:p-6">
            <div className="mx-auto size-28 rounded-full bg-(--bg-secondary)" />
            <div className="mt-4 h-9 rounded bg-(--bg-secondary)" />
            <div className="mt-2 h-9 rounded bg-(--bg-secondary)" />
          </div>

          <div className="animate-pulse rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-(--card-shadow) sm:p-6">
            <div className="h-4 w-28 rounded bg-(--bg-secondary)" />
            <div className="mt-4 h-9 rounded bg-(--bg-secondary)" />
            <div className="mt-2 h-9 rounded bg-(--bg-secondary)" />
          </div>
        </div>

        <div className="animate-pulse rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-(--card-shadow) sm:p-6">
          <div className="h-5 w-40 rounded bg-(--bg-secondary)" />
          <div className="mt-4 h-10 rounded bg-(--bg-secondary)" />
          <div className="mt-4 h-28 rounded bg-(--bg-secondary)" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="h-10 rounded bg-(--bg-secondary)" />
            <div className="h-10 rounded bg-(--bg-secondary)" />
          </div>
          <div className="mt-6 flex gap-2">
            <div className="h-10 w-32 rounded bg-(--bg-secondary)" />
            <div className="h-10 w-24 rounded bg-(--bg-secondary)" />
          </div>
        </div>
      </div>
    </section>
  );
}
