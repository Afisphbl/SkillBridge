"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import AvatarUpload from "@/components/Auth/AvatarUpload";
import Button from "@/components/UI/Button";
import Input from "@/components/UI/Input";
import { useAuth } from "@/hooks/useAuth";
import {
  type SignupPayload,
  validateImageFile,
} from "@/lib/validators/authSchemas";
import { getPasswordStrength } from "@/utils/helpers";

const roles: SignupPayload["role"][] = ["buyer", "seller", "both"];

export default function SignupForm() {
  const [avatarFile, setAvatarFile] = useState<File>();
  const [avatarError, setAvatarError] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { handleSignUp, submitting } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SignupPayload>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "buyer",
      termsAccepted: false,
    },
  });

  const passwordValue = useWatch({ control, name: "password" });
  const selectedRole = useWatch({ control, name: "role" });
  const passwordStrength = useMemo(
    () => getPasswordStrength(passwordValue ?? ""),
    [passwordValue],
  );

  const strengthWidthClass =
    passwordStrength.score <= 0
      ? "w-0"
      : passwordStrength.score === 1
        ? "w-1/4"
        : passwordStrength.score === 2
          ? "w-2/4"
          : passwordStrength.score === 3
            ? "w-3/4"
            : "w-full";

  const onAvatarChange = (file?: File) => {
    const validation = validateImageFile(file);
    if (validation) {
      setAvatarError(validation);
      setAvatarFile(undefined);
      return;
    }

    setAvatarError(undefined);
    setAvatarFile(file);
  };

  const onSubmit = async (payload: SignupPayload) => {
    if (avatarError) {
      toast.error(avatarError);
      return;
    }

    const result = await handleSignUp({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      avatarFile,
    });

    if (result.success) {
      reset();
      setAvatarFile(undefined);
      setAvatarError(undefined);
    }
  };

  return (
    <form
      className="mt-5 space-y-3"
      onSubmit={handleSubmit(onSubmit, () =>
        toast.error("Please fix form errors"),
      )}
      noValidate
    >
      <AvatarUpload
        file={avatarFile}
        error={avatarError}
        onChange={onAvatarChange}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Full Name
        </label>
        <Input
          placeholder="Jane Doe"
          error={errors.fullName?.message}
          {...register("fullName", { required: "Full name is required" })}
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Email Address
        </label>
        <Input
          type="email"
          placeholder="jane@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Enter a valid email",
            },
          })}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "At least 8 characters",
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
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Confirm
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value, values) =>
                  value === values.password || "Passwords must match",
              })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="size-4" />
              ) : (
                <FaEye className="size-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs text-slate-600">
          Password strength:{" "}
          <span className="font-semibold">{passwordStrength.label}</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full bg-cyan-800 transition-all ${strengthWidthClass}`}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          I want to...
        </label>
        <div className="grid grid-cols-3 gap-2 rounded-md bg-slate-100 p-1">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setValue("role", role)}
              className={`rounded-md px-3 py-2 text-sm capitalize ${
                selectedRole === role
                  ? "bg-white text-cyan-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <label className="inline-flex items-start gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          className="mt-0.5 rounded border-slate-300"
          {...register("termsAccepted", {
            required: "You must accept terms",
          })}
        />
        <span>
          I agree to the Terms of Service and Privacy Policy.
          {errors.termsAccepted && (
            <span className="block text-xs text-red-600">
              {errors.termsAccepted.message}
            </span>
          )}
        </span>
      </label>

      <input type="hidden" {...register("role")} />

      <Button type="submit" loading={submitting}>
        Create Account
      </Button>

      <p className="pt-1 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-cyan-900 hover:text-cyan-700"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}
