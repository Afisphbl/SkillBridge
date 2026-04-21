import { redirect } from "next/navigation";
import { SELLER_HOME_ROUTE } from "@/utils/constants";

export default function SellerIndexPage() {
  redirect(SELLER_HOME_ROUTE);
}
