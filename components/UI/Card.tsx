import type { ReactNode } from "react";
import { cn } from "@/utils/helpers";

export default function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl p-7 ", className, `auth-card`)}>
      {children}
    </section>
  );
}
