"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { API_BASE_URL, apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data2 = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      console.log("data" , data2)
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        // method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.status) {
        throw new Error(data?.message || "Login failed");
      }

      const token = data?.data?.token;
      const user = data?.data?.user;
      if (!token) {
        throw new Error("Invalid login response");
      }
      if (user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("cms_user", JSON.stringify(user));
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4 shadow-lg shadow-primary/25">
            V
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Vrateez CMS</h1>
          <p className="text-sm text-muted mt-1">Sign in to your admin dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vrateez.com"
                  className="w-full h-12 pl-10 pr-4 border border-border rounded-xl text-sm leading-6 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-stone-700">Password</label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-12 pl-10 pr-12 border border-border rounded-xl text-sm leading-6 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm text-stone-600">Keep me signed in</span>
            </label>
            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm shadow-primary/25 disabled:opacity-60">
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          &copy; 2026 Vrateez. All rights reserved.
        </p>
      </div>
    </div>
  );
}
