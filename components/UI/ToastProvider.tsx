"use client";

import { FiAlertCircle, FiCheckCircle, FiInfo, FiLoader } from "react-icons/fi";
import { resolveValue, Toaster, type Toast } from "react-hot-toast";

function getToastIcon(toast: Toast) {
  if (toast.type === "success")
    return <FiCheckCircle className="sb-toast__icon-svg" />;
  if (toast.type === "error")
    return <FiAlertCircle className="sb-toast__icon-svg" />;
  if (toast.type === "loading") {
    return <FiLoader className="sb-toast__icon-svg sb-toast__icon-svg--spin" />;
  }

  return <FiInfo className="sb-toast__icon-svg" />;
}

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: 5200,
      }}
    >
      {(toast) => {
        return (
          <div className={`sb-toast sb-toast--${toast.type}`}>
            <div className="sb-toast__content">
              <span className="sb-toast__icon">{getToastIcon(toast)}</span>
              <p className="sb-toast__message">
                {resolveValue(toast.message, toast)}
              </p>
            </div>

            <div className="sb-toast__progress" />
          </div>
        );
      }}
    </Toaster>
  );
}
