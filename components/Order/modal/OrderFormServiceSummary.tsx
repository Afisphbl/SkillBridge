import Image from "next/image";
import { formatPrice } from "@/utils/format";
import { useOrderFormModalContext } from "./OrderFormModalProvider";

function useOrderFormServiceSummary() {
  const { price, sellerName, thumbnail, title } = useOrderFormModalContext();

  return {
    price,
    sellerName,
    thumbnail,
    title,
  };
}

export default function OrderFormServiceSummary() {
  const { price, sellerName, thumbnail, title } = useOrderFormServiceSummary();

  return (
    <div className="rounded-3xl bg-(--bg-secondary) p-4 ring-1 ring-(--border-color)">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-18 w-30 overflow-hidden rounded-xl bg-(--bg-primary) ring-1 ring-(--border-color)">
            <Image
              src={thumbnail || "/SkillBridge.png"}
              alt={title}
              fill
              unoptimized
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-(--text-primary)">{title}</h3>
            <p className="text-base text-(--text-secondary)">
              by {sellerName || "the seller"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 rounded-2xl bg-transparent px-2 py-2 md:min-w-60 md:justify-between">
          <span className="border-l border-(--border-color) pl-6 text-base text-(--text-secondary)">
            Price
          </span>
          <span className="text-[2rem] font-black text-(--color-success)">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </div>
  );
}
