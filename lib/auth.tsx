export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://suddhvedha-honey-backend.onrender.com";

// Helper to extract verificationId from API response
export function findVerificationId(data: any): string | null {
  if (!data) return null;
  return (
    data.verificationId ||
    data.data?.verificationId ||
    data._id ||
    data.data?._id ||
    null
  );
}

// Session Saving Utility
export function saveSession(sessionData: { user: any; raw?: any }) {
  if (typeof window !== "undefined") {
    localStorage.setItem("shuddhveda_user", JSON.stringify(sessionData.user));
    if (sessionData.raw?.token) {
      localStorage.setItem("sudhveda_token", sessionData.raw.token);
    }
  }
}

// Clear Session
export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("shuddhveda_user");
    localStorage.removeItem("sudhveda_token");
    localStorage.removeItem("admin_token");
  }
}

// Admin & User Authentication API Handlers
export const authApi = {
  // --- USER AUTH ---
  login: async ({ mobile }: { mobile: string }) => {
    const res = await fetch(`${API_BASE_URL}/api/user/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ mobile }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send OTP");
    return data;
  },

  createUser: async ({ name, mobile }: { name: string; mobile: string }) => {
    const res = await fetch(`${API_BASE_URL}/api/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, mobile }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create user");
    return data;
  },

  verifyLoginOtp: async ({
    verificationId,
    otp,
  }: {
    verificationId: string;
    otp: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/api/user/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ verificationId, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Invalid OTP");
    return data;
  },

  verifySignupOtp: async ({
    verificationId,
    otp,
  }: {
    verificationId: string;
    otp: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/api/user/verify-signup-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ verificationId, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Invalid OTP");
    return data;
  },

  // --- ADMIN AUTH ---
  adminSignin: async ({ email }: { email: string }) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send Admin OTP");
    return data;
  },

  adminVerifyOtp: async ({
    verificationId,
    otp,
  }: {
    verificationId: string;
    otp: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ verificationId, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Invalid Admin OTP");
    return data;
  },
};