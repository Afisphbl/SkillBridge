import MarketplaceServicesClient from "@/components/Services/MarketplaceServicesClient";

export const metadata = {
  title: "Services",
  description: "Explore and manage service offerings available on SkillBridge.",
};

type ServicesPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function MarketplaceServicesPage({
  searchParams,
}: ServicesPageProps) {
  const resolvedSearchParams = await searchParams;
  const qParam = resolvedSearchParams.q;
  const initialQuery = (
    Array.isArray(qParam) ? qParam[0] : (qParam ?? "")
  ).trim();

  return <MarketplaceServicesClient initialQuery={initialQuery} />;
}
