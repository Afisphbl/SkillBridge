"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useOrderFormState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = useMemo(() => {
    const orderForm = searchParams.get("orderform");
    return orderForm === "true" || orderForm === "1";
  }, [searchParams]);

  const openOrderForm = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("orderform", "true");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const closeOrderForm = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("orderform");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return {
    isOpen,
    openOrderForm,
    closeOrderForm,
  };
}
