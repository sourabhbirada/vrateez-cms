export type ToastVariant = "success" | "error" | "info";

export type ToastDetail = {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

export function notify(detail: ToastDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("cms:toast", { detail }));
}
