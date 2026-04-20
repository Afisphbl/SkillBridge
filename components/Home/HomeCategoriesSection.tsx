import Link from "next/link";
import { FiArrowRight, FiZap } from "react-icons/fi";

type HomeCategoriesSectionProps = {
  categories: string[];
};

export default function HomeCategoriesSection({
  categories,
}: HomeCategoriesSectionProps) {
  return (
    <section className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-sm">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-(--text-primary)">
            Explore by Category
          </h2>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Discover the exact talent you need right now.
          </p>
        </div>
        <Link
          href="/services"
          className="hidden items-center gap-1 text-sm font-semibold text-(--color-primary) hover:opacity-85 sm:inline-flex"
        >
          View all <FiArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Link
              key={category}
              href={`/services?category=${encodeURIComponent(category)}`}
              className="group rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4 hover:border-(--color-primary)"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-(--bg-card) text-(--color-primary)">
                <FiZap className="size-4" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-(--text-primary) group-hover:text-(--color-primary)">
                {category}
              </h3>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-sm text-(--text-muted)">
            No categories yet. Add services to see category highlights.
          </p>
        )}
      </div>
    </section>
  );
}
