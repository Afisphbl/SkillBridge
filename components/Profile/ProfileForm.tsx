"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FiCheckCircle } from "react-icons/fi";
import Input from "@/components/UI/Input";
import Loader from "@/components/UI/Loader";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { useAvatarDraft } from "@/hooks/profile/useAvatarDraft";
import {
  useProfileSave,
  type ProfileFormValues,
} from "@/hooks/profile/useProfileSave";
import { useProfileView } from "@/hooks/profile/useProfileView";

const BIO_MAX = 240;

export default function ProfileForm() {
  const { session } = useAuth();
  const { profile, refreshProfile } = useUser();
  const profileView = useProfileView(profile, session);
  const avatarDraft = useAvatarDraft({ currentAvatar: profile?.avatar });
  const { savingProfile, profileSaved, handleSaveProfile, handleCancelEdit } =
    useProfileSave({
      userId: session?.user?.id,
      profile,
      refreshProfile,
      pendingAvatarFile: avatarDraft.pendingAvatarFile,
      avatarDirty: avatarDraft.avatarDirty,
      resolveNextAvatar: avatarDraft.resolveNextAvatar,
      resetAvatarDraft: avatarDraft.resetAvatarDraft,
    });

  const initialValues: ProfileFormValues = {
    fullName: profile?.full_name || "",
    bio: profileView.bio,
    role: profileView.roleLabel,
    email: profileView.email,
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    defaultValues: initialValues,
  });

  const { fullName, bio, role, email } = initialValues;

  useEffect(() => {
    reset({ fullName, bio, role, email });
  }, [bio, email, fullName, reset, role]);

  const bioValue = useWatch({ control, name: "bio" }) ?? "";

  const submitForm = async (values: ProfileFormValues) => {
    await handleSaveProfile(values);
  };

  const cancelEdit = () => {
    reset(initialValues);
    handleCancelEdit();
  };

  return (
    <section className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-(--card-shadow) sm:p-6">
      <h2 className="text-base font-semibold text-(--text-primary)">
        Profile Information
      </h2>
      <p className="mt-1 text-sm text-(--text-muted)">
        Keep your public details accurate and up to date.
      </p>

      <form className="mt-5 space-y-6" onSubmit={handleSubmit(submitForm)}>
        <div className="space-y-1.5">
          <label
            htmlFor="fullName"
            className="text-sm font-medium text-(--text-secondary)"
          >
            Full Name
          </label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            aria-invalid={Boolean(errors.fullName)}
            error={errors.fullName?.message}
            {...register("fullName", {
              required: "Full name is required.",
              minLength: {
                value: 2,
                message: "Full name must be at least 2 characters.",
              },
              maxLength: {
                value: 80,
                message: "Full name can be at most 80 characters.",
              },
            })}
          />
          {errors.fullName ? (
            <p className="text-xs text-(--color-danger)">
              {errors.fullName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="bio"
            className="text-sm font-medium text-(--text-secondary)"
          >
            Bio
          </label>
          <textarea
            id="bio"
            rows={7}
            maxLength={BIO_MAX}
            placeholder="Tell clients what you do best and what kind of work you love."
            className="w-full resize-none rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2 text-sm text-(--input-text) placeholder:text-(--input-placeholder) shadow-sm transition-colors focus:border-(--input-border-focus) focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            {...register("bio", {
              maxLength: {
                value: BIO_MAX,
                message: `Bio can be at most ${BIO_MAX} characters.`,
              },
            })}
          />
          <div className="flex items-center justify-between text-xs">
            {errors.bio ? (
              <p className="text-(--color-danger)">{errors.bio.message}</p>
            ) : (
              <span className="text-(--text-muted)">
                Share your expertise, style, and niche.
              </span>
            )}
            <span className="font-medium text-(--text-muted)">
              {bioValue.length}/{BIO_MAX}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="role"
              className="text-sm font-medium text-(--text-secondary)"
            >
              Role
            </label>
            <Input
              id="role"
              readOnly
              aria-readonly="true"
              className="cursor-not-allowed bg-(--input-bg-disabled) text-(--text-muted)"
              {...register("role")}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-(--text-secondary)"
            >
              Email
            </label>
            <Input
              id="email"
              readOnly
              aria-readonly="true"
              className="cursor-not-allowed bg-(--input-bg-disabled) text-(--text-muted)"
              {...register("email")}
            />
          </div>
        </div>

        {profileSaved ? (
          <p className="inline-flex items-center gap-1 text-sm font-medium text-(--color-success)">
            <FiCheckCircle className="size-4" /> Profile changes saved.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={savingProfile || (!isDirty && !avatarDraft.avatarDirty)}
            className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-(--btn-bg-primary) px-4 py-2.5 text-sm font-semibold text-(--btn-text-primary) hover:-translate-y-0.5 hover:bg-(--btn-bg-primary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) disabled:cursor-not-allowed disabled:opacity-70"
          >
            {savingProfile ? (
              <>
                <Loader className="border-white/35 border-t-white" /> Saving
              </>
            ) : (
              "Save Changes"
            )}
          </button>

          <button
            type="button"
            onClick={cancelEdit}
            disabled={savingProfile}
            className="inline-flex min-w-28 items-center justify-center rounded-lg border border-(--border-color) bg-(--btn-bg-secondary) px-4 py-2.5 text-sm font-semibold text-(--btn-text-secondary) hover:bg-(--btn-bg-secondary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
