import EditServicePage from "@/components/editService/EditServicePage";

export const metadata = {
  title: "Edit Service",
};

export default async function SellerEditServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  return <EditServicePage serviceId={serviceId} />;
}
