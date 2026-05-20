"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ToastDetail, ToastVariant } from "@/lib/notify";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

const variantStyles: Record<ToastVariant, string> = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-danger/30 bg-danger/10 text-danger",
  info: "border-info/30 bg-info/10 text-info",
};

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      if (!detail?.message) return;
      const toast: ToastItem = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        message: detail.message,
        variant: detail.variant || "success",
        durationMs: detail.durationMs || 2400,
      };
      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, toast.durationMs);
    };

    window.addEventListener("cms:toast", handler as EventListener);
    return () => window.removeEventListener("cms:toast", handler as EventListener);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed right-6 top-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[240px] max-w-[360px] rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${variantStyles[toast.variant]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
              className="text-current/70 hover:text-current transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
