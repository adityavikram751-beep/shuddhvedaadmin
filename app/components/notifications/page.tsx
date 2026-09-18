"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Package,
  PlusCircle,
  Percent,
  FileText,
  TrendingUp,
  Gift,
  Settings,
  CheckCircle2,
  Bell,
  Trash2,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  badge: "New" | "Read";
  isRead: boolean;
  type: "Orders" | "Inventory" | "Products" | "Promotions" | "System" | "Gifts";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
  dotColor: string;
}

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" ? (value as ApiRecord) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function formatTime(value: string): string {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + ", " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function mapNotification(raw: ApiRecord): NotificationItem {
  const id = asString(raw._id) || asString(raw.id);
  const title = asString(raw.title) || asString(raw.subject) || "Notification";
  const description = asString(raw.description) || asString(raw.message) || "";
  
  // 🎯 Properly detect 'is_read' from your backend response schema
  const isRead = Boolean(
    raw.is_read === true || 
    raw.is_read === "true" || 
    raw.isRead === true || 
    raw.isRead === "true" || 
    raw.seen === true || 
    raw.seen === "true" || 
    raw.read === true || 
    raw.read === "true" ||
    raw.status === "Read" ||
    raw.status === "read"
  );

  const createdAt = asString(raw.createdAt) || asString(raw.updatedAt) || asString(raw.notification_time);

  let type: NotificationItem["type"] = "System";
  let icon = Settings;
  let iconBg = "bg-[#E8F0FE]";
  let iconColor = "text-[#1A73E8]";
  let dotColor = "bg-[#1A73E8]";

  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("order") || lowerTitle.includes("sales")) {
    type = "Orders";
    icon = ShoppingCart;
    iconBg = "bg-[#E6F4EA]";
    iconColor = "text-[#34A853]";
    dotColor = "bg-[#34A853]";
  } else if (lowerTitle.includes("stock") || lowerTitle.includes("inventory")) {
    type = "Inventory";
    icon = Package;
    iconBg = "bg-[#FEF3D6]";
    iconColor = "text-[#F5A623]";
    dotColor = "bg-[#F5A623]";
  } else if (lowerTitle.includes("product")) {
    type = "Products";
    icon = PlusCircle;
    iconBg = "bg-[#EEF2FF]";
    iconColor = "text-[#6366F1]";
    dotColor = "bg-[#6366F1]";
  } else if (lowerTitle.includes("coupon") || lowerTitle.includes("discount") || lowerTitle.includes("promo")) {
    type = "Promotions";
    icon = Percent;
    iconBg = "bg-[#FCE8E6]";
    iconColor = "text-[#EA4335]";
    dotColor = "bg-[#EA4335]";
  } else if (lowerTitle.includes("gift") || lowerTitle.includes("enquiry")) {
    type = "Gifts";
    icon = Gift;
    iconBg = "bg-[#FFF4EB]";
    iconColor = "text-[#FF7A00]";
    dotColor = "bg-[#FF7A00]";
  }

  return {
    id,
    title,
    description,
    time: formatTime(createdAt),
    badge: isRead ? "Read" : "New",
    isRead,
    type,
    icon,
    iconBg,
    iconColor,
    badgeBg: isRead ? "bg-[#E6F4EA]" : "bg-[#F3E8FF]",
    badgeColor: isRead ? "text-[#34A853]" : "text-[#A855F7]",
    dotColor,
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"All" | "Unread" | "Read">("All");
  const [message, setMessage] = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    setMessage("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sudhveda_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // 1. Fetch system notifications
      const notifRes = await fetch(`${API_BASE_URL}/api/notification/all`, {
        method: "GET",
        credentials: "include",
        headers,
      }).catch(() => null);

      let systemNotifs: NotificationItem[] = [];
      if (notifRes && notifRes.ok) {
        const data: unknown = await notifRes.json().catch(() => ({}));
        const rawList = (Array.isArray(data) 
          ? data 
          : Array.isArray(asRecord(data).data) 
          ? asRecord(data).data 
          : Array.isArray(asRecord(asRecord(data).data).notifications)
          ? asRecord(asRecord(data).data).notifications
          : []) as unknown[];

        systemNotifs = rawList.map((item: unknown) => mapNotification(asRecord(item))).filter((n: NotificationItem) => n.id);
      }

      // 2. Fetch order notifications from GET /api/admin/order-dashboard/orders
      const orderRes = await fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders`, {
        method: "GET",
        credentials: "include",
        headers,
      }).catch(() => null);

      let orderNotifs: NotificationItem[] = [];
      if (orderRes && orderRes.ok) {
        const orderData = await orderRes.json().catch(() => ({}));
        const rawOrders: any[] = Array.isArray(orderData.data)
          ? orderData.data
          : Array.isArray(orderData.orders)
          ? orderData.orders
          : Array.isArray(orderData)
          ? orderData
          : [];

        orderNotifs = rawOrders.map((item: any, idx: number) => {
          const u = typeof item.userId === "object" && item.userId ? item.userId : typeof item.user === "object" && item.user ? item.user : {};
          const uName = u.name || item.customer_name || item.customer || "Unknown User";
          const uMobile = u.mobile || u.phone || item.customer_phone || item.mobile || "Unknown Mobile";
          const displayId = item.orderId || item.order_id || (item._id ? `#SV${item._id.slice(-5).toUpperCase()}` : `#ORD-${1000 + idx}`);
          const og = typeof item.order_group_id === "object" && item.order_group_id ? item.order_group_id : {};
          const codAmt = og.cod_amount ?? item.cod_amount ?? 0;
          const finalAmt = item.original_finalAmount ?? item.originalFinalAmount ?? item.original_final_amount ?? og.original_finalAmount ?? og.originalFinalAmount ?? og.original_final_amount ?? og.finalAmount ?? item.finalAmount ?? item.totalAmount ?? item.amount ?? 0;
          const createdAt = asString(item.createdAt) || asString(item.date) || "";

          return {
            id: `order-notif-${item._id || item.id || idx}`,
            title: `Order #${displayId} (${item.status || "Placed"})`,
            description: `Customer: ${uName} (${uMobile}) | COD: ₹${codAmt} | Total: ₹${finalAmt}`,
            time: formatTime(createdAt),
            badge: "New",
            isRead: false,
            type: "Orders" as const,
            icon: ShoppingCart,
            iconBg: "bg-[#E6F4EA]",
            iconColor: "text-[#34A853]",
            badgeBg: "bg-[#F3E8FF]",
            badgeColor: "text-[#A855F7]",
            dotColor: "bg-[#34A853]",
          };
        });
      }

      setNotifications([...orderNotifs, ...systemNotifs]);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab === "Unread" && item.isRead) return false;
      if (activeTab === "Read" && !item.isRead) return false;
      return true;
    });
  }, [notifications, activeTab]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const readCount = useMemo(() => notifications.filter((n) => n.isRead).length, [notifications]);

  const handleItemClick = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (target?.isRead) return;

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, isRead: true, badge: "Read", badgeBg: "bg-[#E6F4EA]", badgeColor: "text-[#34A853]" }
          : n
      )
    );

    try {
      await fetch(`${API_BASE_URL}/api/notification/seen/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to mark notification as seen on backend:", err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadItems = notifications.filter((n) => !n.isRead);
    
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true,
        badge: "Read",
        badgeBg: "bg-[#E6F4EA]",
        badgeColor: "text-[#34A853]",
      }))
    );

    for (const item of unreadItems) {
      try {
        await fetch(`${API_BASE_URL}/api/notification/seen/${item.id}`, {
          method: "PATCH",
          credentials: "include",
        });
      } catch (err) {
        console.error("Failed for ID:", item.id);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/notification/remove/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } else {
        alert("Failed to delete notification");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 text-[#0F172A] font-sans">
      <div className="max-w-[1200px] mx-auto space-y-6">

        {message && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("All")}
              className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "All"
                  ? "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] shadow-2xs"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-slate-50"
              }`}
            >
              <span>All</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === "All" ? "bg-[#D97706] text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {notifications.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("Unread")}
              className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "Unread"
                  ? "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] shadow-2xs"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-slate-50"
              }`}
            >
              <span>Unread</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === "Unread" ? "bg-[#D97706] text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {unreadCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("Read")}
              className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "Read"
                  ? "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] shadow-2xs"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-slate-50"
              }`}
            >
              <span>Read</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === "Read" ? "bg-[#D97706] text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {readCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <CheckCircle2 size={15} className="text-[#64748B]" />
              <span>Mark all as read</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-[#F1F5F9]">
              <Loader2 size={28} className="animate-spin text-[#D97706] mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const IconComponent = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`rounded-2xl p-4 border transition-all flex items-center justify-between gap-4 cursor-pointer group shadow-[0_2px_8px_rgba(0,0,0,0.015)] ${
                    !item.isRead 
                      ? "bg-[#FFFBEB] border-amber-200/80 hover:border-amber-300" 
                      : "bg-white border-[#F1F5F9]"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <div className={`h-11 w-11 rounded-2xl ${item.iconBg} flex items-center justify-center`}>
                        <IconComponent size={20} className={item.iconColor} />
                      </div>
                      {!item.isRead && (
                        <span className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${item.dotColor}`} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#D97706] transition-colors leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#64748B] font-medium mt-0.5 truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-[#94A3B8]">{item.time}</p>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold mt-0.5 ${item.badgeBg} ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete Notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-[#F1F5F9]">
              <div className="h-12 w-12 rounded-full bg-amber-50 text-[#D97706] flex items-center justify-center mx-auto">
                <Bell size={22} />
              </div>
              <h3 className="text-base font-extrabold text-[#0F172A]">No Notifications Found</h3>
              <p className="text-xs text-[#64748B]">There are no notifications matching your active filters.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}