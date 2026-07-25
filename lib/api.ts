import { notify } from "@/lib/notify";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3301/api";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; 
    return Date.now() >= expiryTime;
  } catch {
    return true; // If we can't parse the token, consider it expired
  }
}

function clearAuthAndRedirect() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("cms_user");
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  
  if (!token) return {};
  
  // Check if token is expired before making the request
  if (isTokenExpired(token)) {
    clearAuthAndRedirect();
    throw new Error("Session expired. Please login again.");
  }
  
  return { Authorization: `Bearer ${token}` };
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
      clearAuthAndRedirect();
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
