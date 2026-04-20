import Link from "next/link";

export default function HomeCtaSection() {
  return (
    <section className="rounded-3xl border border-(--border-color) bg-(--bg-secondary) p-6 text-center shadow-sm md:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
        Ready to earn?
      </p>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-(--text-primary)">
        Start your freelance journey
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-(--text-secondary)">
        Whether you want to hire trusted experts or offer your own services,
        SkillBridge gives you the tools to do both.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/services"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-(--btn-bg-primary) px-5 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
        >
          Find Services
        </Link>
        <Link
          href="/services"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-(--border-color) bg-(--bg-card) px-5 text-sm font-semibold text-(--text-primary) hover:bg-(--hover-bg)"
        >
          Become a Seller
        </Link>
      </div>
    </section>
  );
}
