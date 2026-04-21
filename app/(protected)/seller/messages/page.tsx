import SellerPageShell from "@/components/Seller/SellerPageShell";

export const metadata = {
  title: "Seller Messages",
};

export default function SellerMessagesPage() {
  return (
    <SellerPageShell
      title="Messages"
      description="Keep buyer communication centralized, reduce response time, and convert conversations into paid projects."
      highlights={[
        { label: "Unread", value: "11 messages" },
        { label: "Response SLA", value: "< 45 minutes" },
        { label: "Active chats", value: "6 threads" },
      ]}
    />
  );
}
