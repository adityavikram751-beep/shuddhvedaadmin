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

// Get stored session token from localStorage or Cookies
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  const lsToken =
    localStorage.getItem("admin_token") ||
    localStorage.getItem("sudhveda_token") ||
    localStorage.getItem("token");
  if (lsToken) return lsToken;

  const cookieMatch = document.cookie.match(
    /(?:^|;\s*)(?:admin_token|sudhveda_token|token)=([^;]*)/
  );
  return cookieMatch ? cookieMatch[1] : null;
}

// Check if JWT token is expired
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    // If not a standard 3-part JWT string, assume valid client-side (rely on server 401 response)
    if (parts.length !== 3) return false;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    if (payload && typeof payload.exp === "number") {
      // payload.exp is UNIX timestamp in seconds
      const currentTime = Math.floor(Date.now() / 1000);
      // Give a 5-second buffer before actual expiration
      return payload.exp <= currentTime + 5;
    }
  } catch (e) {
    console.warn("Could not decode JWT payload:", e);
  }
  return false;
}

// Get valid token or clear session if expired
export function getValidToken(): string | null {
  const token = getStoredToken();
  if (!token) return null;
  if (isTokenExpired(token)) {
    clearSession();
    return null;
  }
  return token;
}

// Session Saving Utility
export function saveSession(sessionData: { user: any; raw?: any }) {
  if (typeof window !== "undefined") {
    if (sessionData.user) {
      localStorage.setItem("shuddhveda_user", JSON.stringify(sessionData.user));
    }
    const token =
      sessionData.raw?.token ||
      sessionData.raw?.adminToken ||
      sessionData.raw?.data?.token ||
      sessionData.raw?.accessToken;
    if (token) {
      localStorage.setItem("sudhveda_token", token);
      localStorage.setItem("admin_token", token);
      document.cookie = `admin_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `sudhveda_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
    }
  }
}

// Clear Session
export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("shuddhveda_user");
    localStorage.removeItem("sudhveda_token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("token");
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "sudhveda_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";

    // Dispatch custom event for reactive UI updates across the app
    window.dispatchEvent(new Event("auth:logout"));
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