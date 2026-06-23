import { notify } from "@/lib/notify";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3301/api";

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.set("Authorization", authHeaders.Authorization);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.status === false) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("cms_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    throw new Error(data?.message || "API request failed");
  }

  const method = (init?.method || "GET").toUpperCase();
  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const isUpload = path.startsWith("/uploads/");
  if (isWrite && !isUpload) {
    const message =
      method === "DELETE" ? "Deleted successfully" : method === "POST" ? "Created successfully" : "Updated successfully";
    notify({ message, variant: "success" });
  }
  return data.data as T;
}

export async function uploadFilesToS3(files: File[]) {
  if (!files.length) return [];

  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  try {
    const result = await apiFetch<{ uploads: Array<{ publicUrl: string }> }>("/uploads/images/direct", {
      method: "POST",
      body: formData,
    });

    const urls = result.uploads.map((upload) => upload.publicUrl).filter(Boolean);
    if (urls.length) {
      notify({
        message: urls.length === 1 ? "Image uploaded successfully" : `${urls.length} images uploaded successfully`,
        variant: "success",
      });
    }
    return urls;
  } catch (error) {
    notify({
      message: error instanceof Error ? error.message : "Image upload failed",
      variant: "error",
    });
    throw error;
  }
}
