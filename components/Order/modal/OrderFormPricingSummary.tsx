import { formatPrice } from "@/utils/format";
import { useOrderFormModalContext } from "./OrderFormModalProvider";

function useOrderFormPricingSummary() {
  const { platformFee, price, youWillPay } = useOrderFormModalContext();

  return {
    platformFee,
    price,
    youWillPay,
  };
}

export default function OrderFormPricingSummary() {
  const { platformFee, price, youWillPay } = useOrderFormPricingSummary();

  return (
    <div className="rounded-3xl bg-(--badge-success-bg) p-4 ring-1 ring-(--border-color)">
      <div className="grid gap-4 text-sm sm:grid-cols-3 sm:gap-0">
        <div className="space-y-1 sm:px-4">
          <p className="text-(--text-secondary)">Service Price</p>
          <p className="text-2xl font-black text-(--text-primary)">
            {formatPrice(price)}
          </p>
        </div>
        <div className="hidden sm:block sm:border-l sm:border-(--border-color)" />
        <div className="space-y-1 sm:px-4">
          <p className="text-(--text-secondary)">Platform Fee (10%)</p>
          <p className="text-2xl font-black text-(--text-primary)">
            {formatPrice(platformFee)}
          </p>
        </div>
        <div className="hidden sm:block sm:border-l sm:border-(--border-color)" />
        <div className="space-y-1 sm:px-4">
          <p className="text-(--text-secondary)">You&apos;ll Pay</p>
          <p className="text-2xl font-black text-(--color-success)">
            {formatPrice(youWillPay)}
          </p>
        </div>
      </div>
    </div>
  );
}
