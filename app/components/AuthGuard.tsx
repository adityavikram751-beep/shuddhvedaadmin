"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { getStoredToken, isTokenExpired, clearSession } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  // Core authorization verification logic
  const verifyAuth = useCallback(() => {
    const token = getStoredToken();
    const expired = isTokenExpired(token);

    // If login page
    if (pathname === "/") {
      if (token && !expired) {
        // Active valid session: redirect to dashboard
        router.replace("/dashboard");
      } else {
        if (token && expired) {
          clearSession();
        }
        setAuthorized(true);
        setChecking(false);
      }
      return;
    }

    // Protected routes
    if (!token || expired) {
      clearSession();
      setAuthorized(false);
      setChecking(false);
      router.replace("/?expired=true");
    } else {
      setAuthorized(true);
      setChecking(false);
    }
  }, [pathname, router]);

  // Initial check & route-change handler
  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  // Global 401 Fetch Interceptor
  useEffect(() => {
    if (typeof window === "undefined") return;

    const win = window as any;
    if (!win.__fetch_401_interceptor_installed) {
      win.__fetch_401_interceptor_installed = true;
      const originalFetch = window.fetch;

      window.fetch = async function (...args) {
        try {
          const response = await originalFetch.apply(this, args);
          if (response.status === 401) {
            // Unauthenticated/Expired response from server
            if (window.location.pathname !== "/") {
              clearSession();
              window.location.href = "/?expired=true";
            }
          }
          return response;
        } catch (err) {
          throw err;
        }
      };
    }
  }, []);

  // Periodic token expiration monitor & tab focus listener
  useEffect(() => {
    if (typeof window === "undefined" || pathname === "/") return;

    // Background interval check every 5 seconds
    const interval = setInterval(() => {
      const token = getStoredToken();
      if (!token || isTokenExpired(token)) {
        clearSession();
        setAuthorized(false);
        router.replace("/?expired=true");
      }
    }, 5000);

    // Re-check when window gains focus
    const handleFocus = () => {
      verifyAuth();
    };

    // Re-check if storage changes (e.g. logout in another tab)
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === "admin_token" ||
        e.key === "sudhveda_token" ||
        e.key === "token"
      ) {
        verifyAuth();
      }
    };

    // React to custom logout event
    const handleCustomLogout = () => {
      if (pathname !== "/") {
        setAuthorized(false);
        router.replace("/?expired=true");
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth:logout", handleCustomLogout);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth:logout", handleCustomLogout);
    };
  }, [pathname, router, verifyAuth]);

  // If public route (Login page '/')
  if (pathname === "/") {
    return <>{children}</>;
  }

  // While verifying token status
  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6F0]">
        <div className="w-12 h-12 rounded-full bg-[#FFF8EF] border border-[#F2D6A7] flex items-center justify-center text-[#E69A00] mb-3 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-[#E69A00]" />
        </div>
        <p className="text-xs font-bold text-[#2D2118] uppercase tracking-widest">
          Verifying Admin Access...
        </p>
      </div>
    );
  }

  // If unauthenticated: redirecting screen
  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6F0]">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-4 shadow-sm">
          <Lock size={24} />
        </div>
        <h2 className="text-lg font-bold text-[#2D2118]">Session Expired</h2>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">
          Your token has expired. Redirecting to Admin Login...
        </p>
      </div>
    );
  }

  // Authorized: render protected pages
  return <>{children}</>;
}
