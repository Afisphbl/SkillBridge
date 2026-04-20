import HomeCategoriesSection from "@/components/Home/HomeCategoriesSection";
import HomeCtaSection from "@/components/Home/HomeCtaSection";
import HomeFeaturedServicesSection from "@/components/Home/HomeFeaturedServicesSection";
import HomeHeroSection from "@/components/Home/HomeHeroSection";
import type { SellerRow, ServiceRow } from "@/components/Home/types";
import { getServices } from "@/services/supabase/servicesApi";
import { getUsersByIds } from "@/services/supabase/userApi";

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default async function HomePage() {
  const { services } = await getServices();
  const serviceRows = (Array.isArray(services) ? services : []) as ServiceRow[];

  const categories = Array.from(
    new Set(
      serviceRows
        .map((service) => String(service.category || "").trim())
        .filter(Boolean),
    ),
  ).slice(0, 8);

  const featuredServices = [...serviceRows]
    .sort(
      (left, right) =>
        toNumber(right.average_rating ?? right.rating) -
        toNumber(left.average_rating ?? left.rating),
    )
    .slice(0, 3);

  const sellerIds = Array.from(
    new Set(
      featuredServices
        .map((service) => String(service.seller_id || "").trim())
        .filter(Boolean),
    ),
  );

  const users = sellerIds.length ? (await getUsersByIds(sellerIds)).users : [];
  const sellerMap = new Map<string, SellerRow>(
    (Array.isArray(users) ? users : []).map((user) => [
      String(user.id),
      user as SellerRow,
    ]),
  );

  return (
    <section className="space-y-8">
      <HomeHeroSection featuredService={featuredServices[0]} />
      <HomeCategoriesSection categories={categories} />
      <HomeFeaturedServicesSection
        featuredServices={featuredServices}
        sellerMap={sellerMap}
      />
      <HomeCtaSection />
    </section>
  );
}
