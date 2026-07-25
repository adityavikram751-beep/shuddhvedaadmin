"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  Loader2,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Step 1: Send OTP API Call
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 👈 Cookies & credentials include kiye hain
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP.");
      }

      // Verification ID Extract karna
      const vId =
        data.verificationId ||
        data.data?.verificationId ||
        data._id ||
        data.data?._id;

      if (!vId) {
        throw new Error("Verification ID was not received from server.");
      }

      setVerificationId(vId);
      setStep("otp");
      setSuccessMsg("OTP sent successfully to your email.");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP API Call
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setError("Please enter a valid OTP.");
      return;
    }

    if (!verificationId) {
      setError("Verification ID missing. Please request OTP again.");
      setStep("email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 👈 Cookie browser session me store karne ke liye
        body: JSON.stringify({
          verificationId,
          otp: cleanOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP. Please try again.");
      }

      setSuccessMsg("Login successful! Redirecting to dashboard...");

      // Backup localStorage session if token returned
      if (data.token) {
        localStorage.setItem("admin_token", data.token);
      }

      const redirectTo = searchParams.get("redirect") || "/dashboard";
      setTimeout(() => {
        router.push(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
      }, 800);
    } catch (err: any) {
      setError(err.message || "OTP Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0] px-4 py-8 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#E69A00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#2D3A1B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-[#F2E8D9] p-8 relative z-10">
        {/* Logo / Badge */}
        <div className="mx-auto w-14 h-14 bg-[#FFF8EF] border border-[#F2D6A7] rounded-full flex items-center justify-center text-[#E69A00] mb-5 shadow-sm">
          <ShieldCheck size={28} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-serif font-bold text-center text-[#2D2118] tracking-wide uppercase">
          SHUDDHVEDA
        </h1>
        <p className="text-center text-xs font-semibold tracking-widest text-[#B97B00] uppercase mt-1 mb-8">
          Admin Control Center
        </p>

        {/* STEP 1: EMAIL ENTRY */}
        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA6B2]"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="admin@shuddhveda.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 border border-[#E6EAF0] bg-white rounded-xl pl-12 pr-4 text-sm text-[#2D2118] outline-none transition focus:border-[#E69A00] focus:ring-2 focus:ring-[#E69A00]/20 placeholder:text-gray-400"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#2D3A1B] hover:bg-[#1E2712] text-white font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sending OTP...
                </>
              ) : (
                <>
                  Send Login OTP <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP VERIFICATION */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#334155]">
                  Enter Verification OTP
                </label>
                <span className="text-[11px] font-medium text-gray-500">
                  {email}
                </span>
              </div>
              <div className="relative">
                <KeyRound
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA6B2]"
                  size={18}
                />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                  className="w-full h-12 border border-[#E6EAF0] bg-white rounded-xl pl-12 pr-4 text-center text-lg font-bold tracking-[0.25em] text-[#2D2118] outline-none transition focus:border-[#E69A00] focus:ring-2 focus:ring-[#E69A00]/20 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </p>
            )}

            {successMsg && (
              <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#E69A00] hover:bg-[#C98715] text-white font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Verifying...
                </>
              ) : (
                "Verify OTP & Login"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError("");
                setSuccessMsg("");
              }}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#2D3A1B] hover:underline pt-1"
            >
              <ArrowLeft size={14} /> Change Email Address
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] font-medium text-gray-400">
          <Lock size={12} className="text-emerald-600" /> Secure Admin Access
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]">
          <Loader2 className="h-8 w-8 animate-spin text-[#E69A00]" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}