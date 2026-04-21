import SellerPageShell from "@/components/Seller/SellerPageShell";

export const metadata = {
  title: "Seller Orders",
};

export default function SellerOrdersPage() {
  return (
    <SellerPageShell
      title="My orders"
      description="Follow order health, delivery deadlines, and revision pressure so you can keep every engagement on track."
      highlights={[
        { label: "In progress", value: "7 orders" },
        { label: "Due today", value: "2 urgent" },
        { label: "Revisions", value: "3 requests" },
      ]}
    />
  );
}
