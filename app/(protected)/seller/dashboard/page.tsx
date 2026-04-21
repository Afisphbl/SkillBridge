import SellerPageShell from "@/components/Seller/SellerPageShell";

export const metadata = {
  title: "Seller Dashboard",
};

export default function SellerDashboardPage() {
  return (
    <SellerPageShell
      title="Seller dashboard"
      description="Monitor earnings, delivery performance, and buyer satisfaction with a compact dashboard designed for daily execution."
      highlights={[
        { label: "Monthly revenue", value: "$4,860" },
        { label: "Completion rate", value: "96.2%" },
        { label: "Average rating", value: "4.9 / 5" },
      ]}
    />
  );
}
