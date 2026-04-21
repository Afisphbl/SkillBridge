import SellerPageShell from "@/components/Seller/SellerPageShell";

export const metadata = {
  title: "Seller Home",
};

export default function SellerHomePage() {
  return (
    <SellerPageShell
      title="Welcome back"
      description="Track your pipeline, respond to buyers faster, and keep your service catalog healthy from one seller home view."
      highlights={[
        { label: "New leads", value: "14 waiting" },
        { label: "Open offers", value: "5 active" },
        { label: "This week goal", value: "72% complete" },
      ]}
    />
  );
}
