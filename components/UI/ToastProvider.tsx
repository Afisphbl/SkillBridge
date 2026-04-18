"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "12px",
          border: "1px solid #dbe2ea",
          color: "#0f172a",
          background: "#f8fbff",
        },
      }}
    />
  );
}
