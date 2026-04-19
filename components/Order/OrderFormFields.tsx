"use client";

import { useEffect } from "react";
import {
  useWatch,
  type FieldErrors,
  type Control,
  type UseFormSetValue,
  type UseFormRegister,
} from "react-hook-form";
import { FiCalendar, FiPaperclip, FiUploadCloud } from "react-icons/fi";
import { cn } from "@/utils/helpers";

export type OrderFormValues = {
  requirements: string;
  deliveryDate: string;
  additionalNotes: string;
  attachments: File[];
};

type OrderFormFieldsProps = {
  register: UseFormRegister<OrderFormValues>;
  control: Control<OrderFormValues>;
  setValue: UseFormSetValue<OrderFormValues>;
  errors: FieldErrors<OrderFormValues>;
  disabled?: boolean;
};

const MAX_ATTACHMENTS_TOTAL_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function OrderFormFields({
  register,
  control,
  setValue,
  errors,
  disabled,
}: OrderFormFieldsProps) {
  const requirementsValue = useWatch({ control, name: "requirements" }) || "";
  const additionalNotesValue =
    useWatch({ control, name: "additionalNotes" }) || "";
  const attachments = useWatch({ control, name: "attachments" }) || [];

  useEffect(() => {
    register("attachments", {
      validate: {
        maxTotalSize: (value) => {
          const files = Array.isArray(value) ? value : [];
          const totalSize = files.reduce((sum, file) => sum + file.size, 0);
          return (
            totalSize <= MAX_ATTACHMENTS_TOTAL_SIZE ||
            "Attachments must total 10MB or less."
          );
        },
      },
    });
  }, [register]);

  const handleAttachmentChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    if (totalSize > MAX_ATTACHMENTS_TOTAL_SIZE) {
      setValue("attachments", [], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      event.target.value = "";
      return;
    }

    setValue("attachments", files, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <label
          htmlFor="requirements"
          className="text-sm font-semibold text-(--text-primary)"
        >
          Requirements <span className="text-red-500">*</span>
        </label>
        <textarea
          id="requirements"
          rows={6}
          disabled={disabled}
          placeholder="Describe what you need, features, style preferences, content, etc..."
          className={cn(
            "min-h-32 w-full rounded-2xl border border-(--border-color) bg-(--bg-card) px-4 py-3 text-sm text-(--text-primary) outline-none transition placeholder:text-(--text-muted) focus:border-(--border-focus) focus:ring-4 focus:ring-(--border-focus)/10",
            disabled && "cursor-not-allowed bg-(--bg-secondary) opacity-70",
          )}
          {...register("requirements", {
            required: "Requirements are required.",
            minLength: {
              value: 10,
              message: "Requirements must be at least 10 characters.",
            },
            maxLength: {
              value: 1000,
              message: "Requirements must be 1000 characters or less.",
            },
          })}
        />
        <div className="flex items-center justify-between gap-3 text-xs text-(--text-muted)">
          <p>Minimum 10 characters. Be as detailed as possible.</p>
          <span>{Math.min(requirementsValue.length, 1000)} / 1000</span>
        </div>
        {errors.requirements?.message ? (
          <p className="text-sm font-medium text-(--color-danger)">
            {errors.requirements.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2.5">
        <label
          htmlFor="deliveryDate"
          className="text-sm font-semibold text-(--text-primary)"
        >
          Preferred Delivery Date{" "}
          <span className="font-medium text-(--text-muted)">(Optional)</span>
        </label>
        <div className="relative">
          <FiCalendar className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-(--text-muted)" />
          <input
            id="deliveryDate"
            type="date"
            disabled={disabled}
            className={cn(
              "h-12 w-full rounded-2xl border border-(--border-color) bg-(--bg-card) pl-11 pr-4 text-sm text-(--text-primary) outline-none transition focus:border-(--border-focus) focus:ring-4 focus:ring-(--border-focus)/10",
              disabled && "cursor-not-allowed bg-(--bg-secondary) opacity-70",
            )}
            {...register("deliveryDate")}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <label
          htmlFor="additionalNotes"
          className="text-sm font-semibold text-(--text-primary)"
        >
          Additional Notes{" "}
          <span className="font-medium text-(--text-muted)">(Optional)</span>
        </label>
        <textarea
          id="additionalNotes"
          rows={4}
          disabled={disabled}
          placeholder="Any additional information or special instructions..."
          className={cn(
            "min-h-28 w-full rounded-2xl border border-(--border-color) bg-(--bg-card) px-4 py-3 text-sm text-(--text-primary) outline-none transition placeholder:text-(--text-muted) focus:border-(--border-focus) focus:ring-4 focus:ring-(--border-focus)/10",
            disabled && "cursor-not-allowed bg-(--bg-secondary) opacity-70",
          )}
          {...register("additionalNotes", {
            maxLength: {
              value: 500,
              message: "Additional notes must be 500 characters or less.",
            },
          })}
        />
        <div className="flex justify-end text-xs text-(--text-muted)">
          <span>{Math.min(additionalNotesValue.length, 500)} / 500</span>
        </div>
        {errors.additionalNotes?.message ? (
          <p className="text-sm font-medium text-(--color-danger)">
            {errors.additionalNotes.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2.5">
        <label
          htmlFor="attachments"
          className="text-sm font-semibold text-(--text-primary)"
        >
          Attachments{" "}
          <span className="font-medium text-(--text-muted)">(Optional)</span>
        </label>

        <label
          htmlFor="attachments"
          className={cn(
            "flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-(--border-color) bg-(--bg-secondary) px-5 py-5 transition hover:border-(--border-hover) hover:bg-(--hover-bg)",
            disabled && "cursor-not-allowed opacity-70",
          )}
        >
          <div className="flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-(--badge-success-bg) text-(--color-primary)">
              <FiUploadCloud className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-(--text-primary)">
                Upload reference files
              </p>
              <p className="text-xs text-(--text-muted)">
                Images, PDF, or documents (Max 10MB)
              </p>
            </div>
          </div>

          <span className="inline-flex h-10 shrink-0 items-center rounded-xl bg-(--bg-card) px-4 text-sm font-semibold text-(--text-secondary) shadow-sm ring-1 ring-(--border-color)">
            Choose Files
          </span>
        </label>

        <input
          id="attachments"
          type="file"
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={handleAttachmentChange}
        />

        {attachments.length > 0 ? (
          <div className="space-y-2 rounded-2xl border border-(--border-color) bg-(--bg-card) p-3">
            {attachments.map((file) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-(--bg-secondary) px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FiPaperclip className="size-4 shrink-0 text-(--text-muted)" />
                  <span className="truncate text-sm font-medium text-(--text-secondary)">
                    {file.name}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-(--text-muted)">
                  {formatFileSize(file.size)}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {errors.attachments?.message ? (
          <p className="text-sm font-medium text-(--color-danger)">
            {String(errors.attachments.message)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
