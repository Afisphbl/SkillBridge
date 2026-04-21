"use client";

import { useState, useRef } from "react";
import { FiUploadCloud, FiX, FiCheckCircle, FiPaperclip } from "react-icons/fi";
import Loader from "@/components/UI/Loader";
import { uploadDeliveryFile } from "@/services/supabase/orderStorage";
import toast from "react-hot-toast";

type DeliverModalProps = {
  open: boolean;
  loading: boolean;
  orderId: string;
  orderNumber?: string;
  onClose: () => void;
  onConfirm: (data: { message: string; files: string[] }) => void;
};

export default function DeliverModal({
  open,
  loading: externalLoading,
  orderId,
  orderNumber,
  onClose,
  onConfirm,
}: DeliverModalProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please add a delivery message.");
      return;
    }
    if (files.length === 0) {
      toast.error("Please attach at least one file.");
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map((file) =>
        uploadDeliveryFile(file, orderId),
      );
      const fileUrls = await Promise.all(uploadPromises);
      onConfirm({ message, files: fileUrls });
    } catch (error) {
      toast.error("Failed to upload files. Please try again.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const isLoading = externalLoading || uploading;

  return (
    <div
      className="fixed inset-0 z-70 grid place-items-center bg-(--modal-overlay) px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={!isLoading ? onClose : undefined}
    >
      <div
        className="modal-pop w-full max-w-xl rounded-3xl border border-(--border-color) bg-(--bg-card) p-0 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-(--border-color) p-6 bg-(--bg-secondary)">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <FiCheckCircle className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-(--text-primary)">
                Deliver Order
              </h3>
              <p className="text-xs font-semibold text-(--text-muted)">
                {orderNumber || "New Delivery"}
              </p>
            </div>
          </div>
          <button
            type="button"
            title="Close deliver modal"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-(--text-muted) hover:bg-(--hover-bg) disabled:opacity-50"
          >
            <FiX className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-(--text-primary)">
              Delivery Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              placeholder="Explain what you've delivered and any instructions for the buyer..."
              className="h-32 w-full resize-none rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4 text-sm focus:border-(--input-border-focus) focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-(--text-primary)">
              Attach Files
            </label>
            <div
              onClick={() => !isLoading && fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all ${
                isLoading
                  ? "border-(--border-color) opacity-50 cursor-not-allowed"
                  : "border-(--border-color) hover:border-(--btn-bg-primary) hover:bg-blue-50/10"
              }`}
            >
              <FiUploadCloud className="mb-2 size-8 text-(--text-muted)" />
              <p className="text-sm font-semibold text-(--text-muted)">
                Click to upload files or drag and drop
              </p>
              <p className="mt-1 text-xs text-(--text-muted)">
                Maximum 50MB per file
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                title="Upload delivery files"
                aria-label="Upload delivery files"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {files.length > 0 && (
              <div className="mt-4 grid gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl border border-(--border-color) bg-(--bg-secondary) px-4 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <FiPaperclip className="size-4 text-(--text-muted)" />
                      <span className="text-sm font-medium text-(--text-primary) line-clamp-1">
                        {file.name}
                      </span>
                      <span className="text-xs text-(--text-muted)">
                        ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    {!isLoading && (
                      <button
                        type="button"
                        title="Remove file"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-(--border-color) bg-(--bg-secondary) p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-11 rounded-xl border border-(--border-color) px-6 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg) disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-8 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader className="border-white/40 border-t-white" />
                {uploading ? "Uploading..." : "Delivering..."}
              </>
            ) : (
              "Deliver Work"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
