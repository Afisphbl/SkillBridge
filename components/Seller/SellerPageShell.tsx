type SellerPageShellProps = {
  title: string;
  description: string;
  highlights: Array<{ label: string; value: string }>;
};

export default function SellerPageShell({
  title,
  description,
  highlights,
}: SellerPageShellProps) {
  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
          Seller Workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-(--text-primary) md:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-(--text-secondary)">
          {description}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.label}
            className="rounded-xl border border-(--border-color) bg-(--bg-card) p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--text-muted)">
              {item.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-(--text-primary)">
              {item.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
