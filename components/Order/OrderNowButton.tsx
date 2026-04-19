"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/utils/helpers";

type OrderNowButtonProps = {
  className?: string;
};

export default function OrderNowButton({ className }: OrderNowButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleOpenOrderForm = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("orderform", "true");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <button
      type="button"
      onClick={handleOpenOrderForm}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-(--color-primary) px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      Order Now
    </button>
  );
}
