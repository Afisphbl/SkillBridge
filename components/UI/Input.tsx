import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/helpers";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export default function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "soft-field h-11 w-full rounded-md px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-cyan-700/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-700/20",
        error && "border-red-300 focus:ring-red-200",
        className,
      )}
      {...props}
    />
  );
}
