"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Login page is public
    if (pathname === "/") {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    // Check if admin token exists in localStorage
    const token =
      localStorage.getItem("admin_token") ||
      localStorage.getItem("sudhveda_token");

    if (!token) {
      setAuthorized(false);
      setChecking(false);
      // Immediately redirect unauthenticated user to login page
      router.replace(`/?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setAuthorized(true);
      setChecking(false);
    }
  }, [pathname, router]);

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
        <h2 className="text-lg font-bold text-[#2D2118]">Access Denied</h2>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">
          Please login first. Redirecting to Admin Login...
        </p>
      </div>
    );
  }

  // Authorized: render protected pages
  return <>{children}</>;
}
