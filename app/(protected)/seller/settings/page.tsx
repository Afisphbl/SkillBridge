import SellerPageShell from "@/components/Seller/SellerPageShell";

export const metadata = {
  title: "Seller Settings",
};

export default function SellerSettingsPage() {
  return (
    <SellerPageShell
      title="Settings"
      description="Control availability, notifications, payouts, and account defaults from one settings center built for long-term scale."
      highlights={[
        { label: "Payout account", value: "Connected" },
        { label: "Notification health", value: "All channels on" },
        { label: "Vacation mode", value: "Off" },
      ]}
    />
  );
}
