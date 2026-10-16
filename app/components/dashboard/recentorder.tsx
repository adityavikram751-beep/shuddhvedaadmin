"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Gift,
  AlertTriangle,
  Package,
  Loader2,
  Settings,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";
import { io, Socket } from "socket.io-client";

// ---------- Interfaces ----------
export interface RecentOrderItem {
  id: string;
  customer: string;
  status: string;
  time: string;
}

export interface NotificationWidgetDisplay {
  text: string;
  time: string;
  icon: any;
  color: string;
  bg: string;
}

// ---------- Initial Mock Fallbacks ----------
const defaultRecentOrders: RecentOrderItem[] = [
  { id: "#ORD-1028", customer: "Priya Sharma", status: "New", time: "10 min ago" },
  { id: "#ORD-1027", customer: "Anjali Mehta", status: "New", time: "35 min ago" },
  { id: "#ORD-1026", customer: "Anjali Mehta", status: "Processing", time: "1 hour ago" },
  { id: "#ORD-1025", customer: "Neha Kapoor", status: "Processing", time: "2 hours ago" },
  { id: "#ORD-1024", customer: "Arjun Singh", status: "Pending", time: "3 hours ago" },
];

const defaultNotifications: NotificationWidgetDisplay[] = [
  { text: "New custom gift request received", time: "15 min ago", icon: Gift, color: "#A855F7", bg: "#F5EEFF" },
  { text: "Order #ORD-1028 has been placed", time: "20 min ago", icon: ShoppingCart, color: "#22C55E", bg: "#ECFDF3" },
  { text: "Low stock alert for 7 items", time: "1 hour ago", icon: AlertTriangle, color: "#EAB308", bg: "#FEF9E7" },
  { text: "Website settings updated", time: "2 hours ago", icon: Settings, color: "#3B82F6", bg: "#EFF6FF" },
  { text: "New product inquiry received", time: "3 hours ago", icon: Package, color: "#6366F1", bg: "#EEF2FF" },
];

// ---------- Helpers ----------
function StatusBadge({ status }: { status: string }) {
  const lower = (status || "").toLowerCase().trim();
  let badgeStyle = "bg-gray-100 text-gray-600";

  if (lower.includes("new")) {
    badgeStyle = "bg-[#ECFDF3] text-[#22C55E]";
  } else if (lower.includes("process")) {
    badgeStyle = "bg-[#EFF6FF] text-[#3B82F6]";
  } else if (lower.includes("pend")) {
    badgeStyle = "bg-[#FFF4EB] text-[#FF7A00]";
  } else if (lower.includes("deliver") || lower.includes("complet") || lower.includes("active")) {
    badgeStyle = "bg-emerald-100 text-emerald-800";
  } else if (lower.includes("cancel") || lower.includes("fail")) {
    badgeStyle = "bg-red-50 text-red-600";
  } else if (lower.includes("ship")) {
    badgeStyle = "bg-purple-50 text-purple-600";
  }

  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "New";

  return (
    <span
      className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold tracking-wide capitalize ${badgeStyle}`}
    >
      {label}
    </span>
  );
}

function formatRelativeTime(timeStr?: string): string {
  if (!timeStr) return "Recently";
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return timeStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export default function RecentOrdersSection() {
  const [recentOrders, setRecentOrders] = useState<RecentOrderItem[]>(defaultRecentOrders);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationWidgetDisplay[]>(defaultNotifications);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // 🌐 GET API Call: Fetch Recent Orders ({{baseUrl}}/api/admin/order-dashboard/recent-orders)
  const fetchRecentOrders = async () => {
    setLoadingOrders(true);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("sudhveda_token") ||
          localStorage.getItem("admin_token") ||
          localStorage.getItem("token")
        : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/order-dashboard/recent-orders`, {
        method: "GET",
        credentials: "include",
        headers,
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json.success || Array.isArray(json.data) || Array.isArray(json))) {
        const rawList: any[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : Array.isArray(json.orders)
          ? json.orders
          : [];

        if (rawList.length > 0) {
          const mapped: RecentOrderItem[] = rawList.slice(0, 5).map((item) => {
            // Customer name formatting
            const rawName =
              item.name || item.customer_name || item.customerName || item.customer || "Customer";
            const customerName = String(rawName)
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ");

            // Status & Time
            const status = item.order_status || item.status || "New";
            const time =
              item.placed_ago ||
              (item.placed_at ? formatRelativeTime(item.placed_at) : item.time || "Recently");

            return {
              id: item.order_id || item.orderId || item.id || "#ORD-1000",
              customer: customerName,
              status,
              time,
            };
          });
          setRecentOrders(mapped);
        } else if (json.success) {
          setRecentOrders([]);
        }
      }
    } catch (err) {
      console.error("Error fetching recent orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // 🌐 GET API Call: Fetch Notifications (/api/notification/all)
  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notification/all`, {
        method: "GET",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const rawList: any[] = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.notifications)
          ? json.notifications
          : [];

        if (rawList.length > 0) {
          const mapped: NotificationWidgetDisplay[] = rawList.slice(0, 5).map((item) => {
            const title = item.title || item.subject || item.description || "System Notification";
            const lower = title.toLowerCase();
            let icon = Settings;
            let color = "#3B82F6";
            let bg = "#EFF6FF";

            if (lower.includes("order") || lower.includes("sales")) {
              icon = ShoppingCart;
              color = "#22C55E";
              bg = "#ECFDF3";
            } else if (lower.includes("stock") || lower.includes("inventory")) {
              icon = AlertTriangle;
              color = "#EAB308";
              bg = "#FEF9E7";
            } else if (lower.includes("gift")) {
              icon = Gift;
              color = "#A855F7";
              bg = "#F5EEFF";
            } else if (lower.includes("product")) {
              icon = Package;
              color = "#6366F1";
              bg = "#EEF2FF";
            }

            return {
              text: title,
              time: formatRelativeTime(item.createdAt || item.notification_time || item.updatedAt),
              icon,
              color,
              bg,
            };
          });
          setNotifications(mapped);
        }
      }
    } catch (err) {
      console.error("Error fetching notifications for dashboard:", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    void fetchRecentOrders();
    void fetchNotifications();

    const socket: Socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("join-admin-room");
    });

    const handleNewOrder = () => {
      void fetchRecentOrders();
      void fetchNotifications();
    };

    socket.on("new-order", handleNewOrder);
    socket.on("newOrder", handleNewOrder);
    socket.on("order-created", handleNewOrder);

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="mt-14 grid grid-cols-1 w-full gap-8 lg:grid-cols-[1.6fr_1fr] items-stretch">
      {/* Left Column: Recent Orders Table */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#1E293B]">Recent Orders</h3>
            <Link
              href="/order"
              className="text-sm font-bold text-[#0F172A] hover:opacity-70 transition-opacity"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest border-b border-gray-100">
                  <th className="pb-5 pr-4">ORDER ID</th>
                  <th className="pb-5 pr-4">CUSTOMER</th>
                  <th className="pb-5 pr-4">STATUS</th>
                  <th className="pb-5 text-right">TIME</th>
                </tr>
              </thead>
              <tbody>
                {loadingOrders ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400">
                        <Loader2 size={16} className="animate-spin text-[#FF7A00]" />
                        Loading recent orders...
                      </div>
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-[#94A3B8] font-medium">
                      No recent orders found
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-5 pr-4 font-bold text-[#0F172A] text-sm whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="py-5 pr-4 text-[#64748B] text-sm font-medium">
                        {order.customer}
                      </td>
                      <td className="py-5 pr-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-5 text-right text-[#94A3B8] text-xs font-medium uppercase tracking-wider whitespace-nowrap">
                        {order.time}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/order"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F8F9FA] text-xs font-bold text-[#0F172A] hover:bg-gray-100 transition-colors"
          >
            View All Orders →
          </Link>
        </div>
      </div>

      {/* Right Column: Notifications */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#1E293B]">Notifications</h3>
            <Link
              href="/notifications"
              className="text-sm font-bold text-[#0F172A] hover:opacity-70 transition-opacity"
            >
              View All
            </Link>
          </div>

          <div className="space-y-6">
            {loadingNotifs ? (
              <div className="flex items-center justify-center py-6 text-gray-400 text-xs gap-2">
                <Loader2 size={16} className="animate-spin text-[#E69A00]" />
                Loading notifications...
              </div>
            ) : (
              notifications.map((notif, idx) => {
                const NotifIcon = notif.icon;
                return (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: notif.bg }}
                      >
                        <NotifIcon size={18} style={{ color: notif.color }} />
                      </div>
                      <p className="text-sm font-semibold text-[#334155] leading-snug line-clamp-2">
                        {notif.text}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-[#94A3B8] shrink-0 text-right whitespace-nowrap">
                      {notif.time}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/notifications"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F8F9FA] text-xs font-bold text-[#0F172A] hover:bg-gray-100 transition-colors"
          >
            View All Notifications →
          </Link>
        </div>
      </div>
    </div>
  );
}