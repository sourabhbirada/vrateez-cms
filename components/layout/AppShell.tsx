"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ToastHost from "@/components/layout/ToastHost";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiryTime;
  } catch {
    return true; // If we can't parse the token, consider it expired
  }
}

function clearAuthAndRedirect(router: ReturnType<typeof useRouter>) {
  localStorage.removeItem("token");
  localStorage.removeItem("cms_user");
  router.replace("/login");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === "/login") {
      setReady(true);
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
      clearAuthAndRedirect(router);
      return;
    }
    
    setReady(true);

    // Check token expiration every minute
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken || isTokenExpired(currentToken)) {
        clearAuthAndRedirect(router);
      }
    }, 60000); // Check every 60 seconds

    // Check token when user returns to the tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const currentToken = localStorage.getItem("token");
        if (!currentToken || isTokenExpired(currentToken)) {
          clearAuthAndRedirect(router);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, router]);

  if (!ready) {
    return <body className="h-screen overflow-hidden bg-surface" />;
  }

  if (pathname === "/login") {
    return (
      <body className="min-h-screen bg-surface">
        {children}
        <ToastHost />
      </body>
    );
  }

  return (
    <body className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-surface">{children}</main>
      </div>
      <ToastHost />
    </body>
  );
}
