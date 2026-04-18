"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";
import Button from "@/components/UI/Button";
import Input from "@/components/UI/Input";
import SocialLoginButtons from "@/components/Auth/SocialLoginButtons";
import { useAuth } from "@/hooks/useAuth";
import type { LoginPayload } from "@/lib/validators/authSchemas";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { handleSignIn, submitting } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginPayload>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (payload: LoginPayload) => {
    const result = await handleSignIn(
      payload.email,
      payload.password,
      payload.rememberMe,
    );

    if (result.success) {
      reset();
    }
  };

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={handleSubmit(onSubmit, () =>
        toast.error("Please fix form errors"),
      )}
      noValidate
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Email Address
        </label>
        <div className="relative">
          <FaEnvelope className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            type="email"
            placeholder="name@company.com"
            className="pl-9"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Enter a valid email",
              },
            })}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </label>
        <div className="relative">
          <FaLock className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-9 pr-10"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <FaEyeSlash className="size-4" />
            ) : (
              <FaEye className="size-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            className="rounded border-slate-300"
            {...register("rememberMe")}
          />
          Remember Me
        </label>
        <Link
          href="#"
          className="font-medium text-cyan-900 hover:text-cyan-700"
        >
          Forgot Password?
        </Link>
      </div>

      <Button type="submit" loading={submitting}>
        Sign In
      </Button>

      <SocialLoginButtons />

      <p className="pt-2 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-cyan-900 hover:text-cyan-700"
        >
          Sign Up
        </Link>
      </p>
    </form>
  );
}
