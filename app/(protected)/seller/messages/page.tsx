import { Suspense } from "react";
import SellerMessagesClient from "@/components/SellerMessages/SellerMessagesClient";

export const metadata = {
  title: "Seller Messages",
};

export default function SellerMessagesPage() {
  return (
    <Suspense>
      <SellerMessagesClient />
    </Suspense>
  );
}
