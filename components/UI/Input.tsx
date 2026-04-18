import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/helpers";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export default function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "soft-field h-11 w-full rounded-md px-3 text-sm focus:border-(--input-border-focus) focus:outline-none focus:ring-2 focus:ring-blue-500/20",
        error && "border-red-300 focus:ring-red-200",
        className,
      )}
      {...props}
    />
  );
}
