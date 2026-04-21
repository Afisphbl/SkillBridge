import SellerPageShell from "@/components/Seller/SellerPageShell";

export const metadata = {
  title: "Seller Profile",
};

export default function SellerProfilePage() {
  return (
    <SellerPageShell
      title="Profile"
      description="Manage your public identity, portfolio, and credibility signals so buyers can trust your service at first glance."
      highlights={[
        { label: "Profile completeness", value: "88%" },
        { label: "Portfolio projects", value: "12 items" },
        { label: "Buyer saves", value: "27 this month" },
      ]}
    />
  );
}
