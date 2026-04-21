// Seller dashboard shared primitives — mirrors buyer/shared.tsx pattern

export function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-5 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.7)] md:p-6">
      {children}
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-black tracking-tight text-(--text-primary)">
          {title}
        </h2>
        <p className="mt-1 text-sm text-(--text-secondary)">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-secondary) p-8 text-center">
      <p className="text-sm font-semibold text-(--text-primary)">{title}</p>
      <p className="mt-1 text-sm text-(--text-secondary)">{description}</p>
    </div>
  );
}

export function LoadingShell() {
  return (
    <section className="space-y-5">
      <div className="h-40 animate-pulse rounded-3xl bg-(--bg-secondary)" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-3xl bg-(--bg-secondary)" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-3xl bg-(--bg-secondary)" />
        <div className="h-72 animate-pulse rounded-3xl bg-(--bg-secondary)" />
      </div>
      <div className="h-64 animate-pulse rounded-3xl bg-(--bg-secondary)" />
    </section>
  );
}
