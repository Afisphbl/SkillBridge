import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiSearch, FiShield } from "react-icons/fi";
import type { ServiceRow } from "@/components/Home/types";

type HomeHeroSectionProps = {
  featuredService?: ServiceRow;
};

export default function HomeHeroSection({
  featuredService,
}: HomeHeroSectionProps) {
  return (
    <section className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.7)] md:p-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-(--text-primary) md:text-5xl">
            Find the perfect freelance services for your business
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-(--text-secondary) md:text-base">
            SkillBridge connects you with vetted experts in development, design,
            writing, and growth. Search quickly, compare talent, and ship
            projects with confidence.
          </p>

          <form
            action="/services"
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <label className="relative flex-1">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-(--text-muted)" />
              <input
                type="search"
                name="q"
                placeholder="What service are you looking for?"
                className="h-11 w-full rounded-xl border border-(--input-border) bg-(--input-bg) pl-10 pr-3 text-sm text-(--input-text) placeholder:text-(--input-placeholder) focus:border-(--input-border-focus) focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-(--btn-bg-primary) px-5 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
            >
              Search <FiArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold uppercase tracking-wide text-(--text-muted)">
              Popular
            </span>
            {["Website Design", "WordPress", "Logo Design", "SEO"].map(
              (tag) => (
                <Link
                  key={tag}
                  href={`/services?q=${encodeURIComponent(tag)}`}
                  className="rounded-md border border-(--border-color) bg-(--bg-secondary) px-2.5 py-1 font-medium text-(--text-secondary) hover:text-(--color-primary)"
                >
                  {tag}
                </Link>
              ),
            )}
          </div>
        </div>

        <div className="relative hidden overflow-hidden rounded-3xl p-4 shadow-sm xl:block">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-(--border-color)">
            <Image
              src={featuredService?.thumbnail_url || "/SkillBridge.png"}
              alt={featuredService?.title || "Featured service"}
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          <div className="absolute bottom-8 left-8 animate-bounce rounded-xl border border-(--border-color) bg-(--bg-card) px-3 py-2 shadow-sm duration-3000">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-(--bg-secondary) text-(--color-primary)">
                <FiShield className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-(--text-primary)">
                  Protected payments
                </p>
                <p className="text-xs text-(--text-muted)">
                  Every order is secured end-to-end.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
