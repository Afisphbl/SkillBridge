import BuyerDashboardClient from "@/components/Dashboard/BuyerDashboardClient";

export const metadata = {
  title: "Buyer Dashboard",
  description:
    "Track orders, spending, favorites, messages, and notifications in one place.",
};

export default function DashboardPage() {
  return <BuyerDashboardClient />;
}
