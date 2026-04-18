import type { ButtonHTMLAttributes } from "react";
import Loader from "@/components/UI/Loader";
import { cn } from "@/utils/helpers";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export default function Button({
  className,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 w-full items-center justify-center rounded-md bg-cyan-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700/40 disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader /> : children}
    </button>
  );
}
