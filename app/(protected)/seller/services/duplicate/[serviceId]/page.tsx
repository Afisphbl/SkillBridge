import { notFound } from "next/navigation";
import DuplicateServicePage from "@/components/duplicateService/DuplicateServicePage";

export default async function SellerDuplicateServicePage({
  params,
}: {
  params: Promise<any>;
}) {
  const resolvedParams = await params;
  const serviceId = resolvedParams?.serviceId;

  if (!serviceId || typeof serviceId !== "string") {
    notFound();
  }

  return <DuplicateServicePage serviceId={serviceId} />;
}
