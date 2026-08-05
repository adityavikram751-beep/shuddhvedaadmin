"use client";

import { Bell, Search, Menu, X, Pencil, ChevronDown, User, Settings as SettingsIcon, LogOut, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/auth";

interface HeaderProps {
  onMenuClick: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/order": "Order",
  "/product": "Product",
  "/inventory": "Inventory",
  "/custom-gift-orders": "Custom Gift Orders",
  "/promotions": "Promotions",
  "/website-content": "Website Content",
  "/website-content/coming-product": "Coming Product",
  "/website-content/health-benefit": "Health Benefit",
  "/website-content/customer-review": "Customer Review",
  "/website-content/customer-query": "Customer Query",
  "/notifications": "Notifications",
  "/reports": "Reports",
  "/settings": "Settings",
};

function getTitleForPath(pathname: string): string {
  const path = pathname.toLowerCase();
  if (pageTitles[pathname]) return pageTitles[pathname];

  if (path.includes("order")) return "Order";
  if (path.includes("product")) return "Product";
  if (path.includes("inventory")) return "Inventory";
  if (path.includes("gift")) return "Custom Gift Orders";
  if (path.includes("promotion")) return "Promotions";
  if (path.includes("coming-product")) return "Coming Product";
  if (path.includes("health-benefit")) return "Health Benefit";
  if (path.includes("customer-review")) return "Customer Review";
  if (path.includes("customer-query")) return "Customer Query";
  // if (path.includes("bulk-enquiry")) return "Bulk Enquiry";
  if (path.includes("contactus")) return "Contactus";

  if (path.includes("website") || path.includes("content")) return "Website Content";
  if (path.includes("notification")) return "Notifications";
  if (path.includes("report")) return "Reports";
  if (path.includes("setting")) return "Settings";
  if (path.includes("dashboard")) return "Dashboard";

  return "Dashboard";
}

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" ? (value as ApiRecord) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const [adminName, setAdminName] = useState("Admin User");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminImage, setAdminImage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const router = useRouter();

  const currentTitle = getTitleForPath(pathname);

  // Fetch Admin Profile for Header
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/profile`, {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));
        const raw = asRecord(json.data || json.admin || json);

        setAdminName(asString(raw.fullname) || asString(raw.full_name) || asString(raw.name) || "Admin User");
        setAdminEmail(asString(raw.email) || asString(raw.business_email) || "");
        setAdminImage(asString(raw.profile_img) || asString(raw.image) || asString(raw.profile_url) || "");
      } catch (err) {
        console.error("Failed to fetch admin profile for header:", err);
      }
    };
    void fetchAdminProfile();
  }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notification/all`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const rawList = Array.isArray(data) 
          ? data 
          : Array.isArray(data.data) 
          ? data.data 
          : Array.isArray(data.data?.notifications)
          ? data.data.notifications
          : [];

        const formatted = rawList.map((item: any) => ({
          id: item._id || item.id,
          title: item.title || item.subject || "Notification",
          description: item.description || item.message || "",
          time: new Date(item.createdAt || item.notification_time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: Boolean(item.is_read || item.isRead || item.seen || item.read),
        }));

        setNotifications(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    void fetchNotifications();
  }, [pathname]);

  // Real-time Socket.io
  useEffect(() => {
    const socket: Socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("join-admin-room");
    });

    const handleNewNotification = () => {
      fetchNotifications();
    };

    socket.on("new-notification", handleNewNotification);
    socket.on("notification", handleNewNotification);

    return () => {
      socket.disconnect();
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleItemClick = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await fetch(`${API_BASE_URL}/api/notification/seen/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to mark as seen", err);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${API_BASE_URL}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      setIsLoggingOut(false);
      setShowProfileDropdown(false);
      router.push("/");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 px-3 sm:px-5 md:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm">
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors shrink-0 cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-base sm:text-xl md:text-2xl lg:text-[26px] font-bold text-gray-900 truncate max-w-[120px] sm:max-w-xs">
            {currentTitle}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          <div className="hidden sm:block relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-24 sm:w-36 md:w-48 lg:w-64 pl-9 pr-3 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 hidden md:inline-block">⌘K</kbd>
          </div>

          <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="sm:hidden p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
            <Search size={18} className="text-gray-500" />
          </button>

          <button className="p-1.5 sm:p-2 text-gray-500 hover:text-orange-500 transition-colors hidden xs:flex cursor-pointer">
            <Pencil size={18} className="sm:w-5 sm:h-5" />
          </button>

          {/* 🔔 Notification Bell Icon Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="relative p-1 text-gray-500 hover:text-gray-700 transition-colors shrink-0 cursor-pointer"
              title="Notifications"
            >
              <Bell size={20} className="sm:w-[22px] sm:h-[22px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-amber-500 text-white text-[10px] font-semibold rounded-full shadow-xs">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Notifications ({unreadCount} Unread)
                  </h3>
                  <button
                    onClick={() => {
                      setShowNotificationsDropdown(false);
                      router.push("/notifications");
                    }}
                    className="text-xs font-bold text-[#D97706] hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
                  {notifications.length > 0 ? (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          !item.isRead ? "bg-[#FFFBEB] border-amber-200" : "bg-slate-50 border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                          <span className="text-[10px] font-medium text-slate-400 shrink-0">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium mt-1 line-clamp-1">{item.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">No notifications available</p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowNotificationsDropdown(false);
                    router.push("/notifications");
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#214b21] text-white text-xs font-bold text-center transition-colors cursor-pointer block"
                >
                  Open Notifications Page
                </button>
              </div>
            )}
          </div>

          <div className="hidden sm:block h-7 w-px bg-gray-200" />

          {/* 👤 Profile Dropdown with Name & Logout */}
          <div className="relative" ref={profileDropdownRef}>
            <div
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-1.5 sm:gap-2 md:gap-3 cursor-pointer group shrink-0"
            >
              {adminImage ? (
                <img src={adminImage} alt="Admin" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-orange-200 transition-all" />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                  <User size={18} />
                </div>
              )}
              <div className="hidden md:block leading-tight min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{adminName}</p>
                <p className="text-xs text-gray-400 truncate">Owner</p>
              </div>
              <ChevronDown size={16} className={`hidden sm:block text-gray-400 group-hover:text-gray-600 transition-transform ${showProfileDropdown ? "rotate-180" : ""}`} />
            </div>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 space-y-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-extrabold text-slate-900 truncate">{adminName}</p>
                  <p className="text-[11px] font-medium text-slate-500 truncate">{adminEmail}</p>
                </div>

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    router.push("/settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <SettingsIcon size={16} className="text-slate-500" />
                  Settings / Profile
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {mobileSearchOpen && (
        <div className="sm:hidden sticky top-[60px] z-40 bg-white px-4 py-3 border-b border-gray-100 shadow-sm">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search anything..." className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400" autoFocus />
            <button onClick={() => setMobileSearchOpen(false)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}