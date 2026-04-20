import Link from "next/link";
import PricingCard from "@/components/ServiceDetails/PricingCard";
import RelatedServices from "@/components/ServiceDetails/RelatedServices";
import ReviewsSection from "@/components/ServiceDetails/ReviewsSection";
import SellerCard from "@/components/ServiceDetails/SellerCard";
import ServiceDescription from "@/components/ServiceDetails/ServiceDescription";
import ServiceGallery from "@/components/ServiceDetails/ServiceGallery";
import ServiceHeader from "@/components/ServiceDetails/ServiceHeader";
import OrderFormModal from "@/components/Order/OrderFormModal";
import { FiArrowLeft } from "react-icons/fi";
export default function ServiceDetailsPage() {

  return (
    <section className="space-y-6">
      <Link
        href="/services"
        className="inline-flex space-x-2 h-9 items-center rounded-md border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
      >
        <FiArrowLeft className="size-4" />
        <span>Back to services</span>
      </Link>

      <ServiceHeader />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-6">
          <ServiceGallery />

          <ServiceDescription />

          <SellerCard />

          <ReviewsSection />

          <RelatedServices />
        </div>

        <PricingCard />
      </div>

      <OrderFormModal />
    </section>
  );
}
