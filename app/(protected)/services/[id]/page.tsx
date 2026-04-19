import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getServiceById,
  getServices,
  getServicesByCategory,
} from "@/services/supabase/servicesApi";
import { getUserById } from "@/services/supabase/userApi";
import PricingCard from "@/components/ServiceDetails/PricingCard";
import RelatedServices from "@/components/ServiceDetails/RelatedServices";
import ReviewsSection from "@/components/ServiceDetails/ReviewsSection";
import SellerCard from "@/components/ServiceDetails/SellerCard";
import ServiceDescription from "@/components/ServiceDetails/ServiceDescription";
import ServiceGallery from "@/components/ServiceDetails/ServiceGallery";
import ServiceHeader from "@/components/ServiceDetails/ServiceHeader";
import OrderFormModal from "@/components/Order/OrderFormModal";
import { FiArrowLeft } from "react-icons/fi";

type ServicePageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ orderform?: string | string[] }>;
};

type ServiceRecord = {
  id?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  thumbnail_url?: string;
  gallery_urls?: unknown;
  gallery_images?: unknown;
  image_url?: string;
  cover_image?: string;
  rating?: number | string;
  average_rating?: number | string;
  reviews_count?: number | string;
  review_count?: number | string;
  ratings_count?: number | string;
  views_count?: number | string;
  view_count?: number | string;
  delivery_days?: number | string;
  delivery_time?: number | string;
  price?: number | string;
  base_price?: number | string;
  hourly_rate?: number | string;
  seller_id?: string;
  tags?: unknown;
  features?: unknown;
  reviews?: unknown;
  [key: string]: unknown;
};

type ReviewItem = {
  id?: string;
  user_name?: string;
  user_avatar?: string;
  rating?: number | string;
  comment?: string;
  created_at?: string;
};

type SellerProfile = {
  full_name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  bio?: string;
  response_time?: string;
};

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export default async function ServiceDetailsPage({
  params,
  searchParams,
}: ServicePageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const isOrderFormOpen =
    resolvedSearchParams?.orderform === "true" ||
    resolvedSearchParams?.orderform === "1";

  const { service, error } = await getServiceById(id);

  if (error || !service) {
    notFound();
  }

  const currentService = service as ServiceRecord;

  const [{ data: sellerProfile }, relatedResult] = await Promise.all([
    currentService.seller_id
      ? getUserById(currentService.seller_id)
      : Promise.resolve({ data: null }),
    currentService.category
      ? getServicesByCategory(String(currentService.category))
      : getServices(),
  ]);

  const relatedServices =
    (relatedResult.services as ServiceRecord[] | null) ?? [];
  const seller = (sellerProfile as SellerProfile | null) ?? null;

  const rating = toNumber(
    currentService.average_rating ?? currentService.rating,
    0,
  );
  const reviewsCount = toNumber(
    currentService.reviews_count ??
      currentService.review_count ??
      currentService.ratings_count,
    0,
  );

  const reviews = Array.isArray(currentService.reviews)
    ? currentService.reviews
    : [];

  const viewCount = toNumber(
    currentService.views_count ?? currentService.view_count,
    0,
  );

  return (
    <section className="space-y-6">
      <Link
        href="/services"
        className="inline-flex space-x-2 h-9 items-center rounded-md border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
      >
        <FiArrowLeft className="size-4" />
        <span>Back to services</span>
      </Link>

      <ServiceHeader
        title={currentService.title || "Service"}
        category={currentService.category}
        subcategory={currentService.subcategory}
        rating={rating}
        reviewsCount={reviewsCount}
        viewCount={viewCount > 0 ? viewCount : undefined}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-6">
          <ServiceGallery
            title={currentService.title || "Service"}
            thumbnail={
              currentService.thumbnail_url ||
              currentService.image_url ||
              currentService.cover_image
            }
            galleryImages={
              currentService.gallery_urls ?? currentService.gallery_images
            }
          />

          <ServiceDescription
            description={currentService.description}
            tags={currentService.tags}
            features={currentService.features}
          />

          <SellerCard
            fullName={seller?.full_name || seller?.email}
            avatar={seller?.avatar}
            role={seller?.role}
            bio={seller?.bio}
            responseTime={seller?.response_time}
          />

          <ReviewsSection
            reviews={reviews as ReviewItem[]}
            averageRating={rating}
            totalReviews={reviewsCount}
          />

          <RelatedServices
            services={relatedServices}
            currentServiceId={String(currentService.id || "")}
          />
        </div>

        <PricingCard
          title={currentService.title || "Service"}
          price={
            currentService.price ??
            currentService.base_price ??
            currentService.hourly_rate ??
            0
          }
          deliveryDays={
            currentService.delivery_days ?? currentService.delivery_time ?? 1
          }
          summary={currentService.description}
        />
      </div>

      <OrderFormModal
        open={isOrderFormOpen}
        title={currentService.title || "Service"}
        sellerName={seller?.full_name || seller?.email}
        thumbnail={
          currentService.thumbnail_url ||
          currentService.image_url ||
          currentService.cover_image ||
          undefined
        }
        price={
          currentService.price ??
          currentService.base_price ??
          currentService.hourly_rate ??
          0
        }
        serviceId={String(currentService.id || "")}
        sellerId={String(currentService.seller_id || "")}
        summary={currentService.description}
      />
    </section>
  );
}
