"use client";

import React, { useState, useMemo } from "react";
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
  Filter,
  ChevronDown,
  ChevronRight,
  Bell,
  Check,
} from "lucide-react";

// Notification Types Definition
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

// Initial Mock Notifications Data (Matching Screenshot Exactly)
const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New Order Received",
    description: "Order #ORD-1052 has been placed by Priya Sharma.",
    time: "2 min ago",
    badge: "New",
    isRead: false,
    type: "Orders",
    icon: ShoppingCart,
    iconBg: "bg-[#E6F4EA]",
    iconColor: "text-[#34A853]",
    badgeBg: "bg-[#E6F4EA]",
    badgeColor: "text-[#34A853]",
    dotColor: "bg-[#34A853]",
  },
  {
    id: "notif-2",
    title: "Low Stock Alert",
    description: "Raw Honey 250g has only 4 units left in stock.",
    time: "10 min ago",
    badge: "New",
    isRead: false,
    type: "Inventory",
    icon: Package,
    iconBg: "bg-[#FEF3D6]",
    iconColor: "text-[#F5A623]",
    badgeBg: "bg-[#F3E8FF]",
    badgeColor: "text-[#A855F7]",
    dotColor: "bg-[#F5A623]",
  },
  {
    id: "notif-3",
    title: "New Product Added",
    description: "Wild Honey 1kg has been added successfully.",
    time: "25 min ago",
    badge: "New",
    isRead: false,
    type: "Products",
    icon: PlusCircle,
    iconBg: "bg-[#EEF2FF]",
    iconColor: "text-[#6366F1]",
    badgeBg: "bg-[#F3E8FF]",
    badgeColor: "text-[#A855F7]",
    dotColor: "bg-[#6366F1]",
  },
  {
    id: "notif-4",
    title: "Coupon Expiring Tomorrow",
    description: 'Coupon "FESTIVE20" will expire tomorrow.',
    time: "1 hour ago",
    badge: "New",
    isRead: false,
    type: "Promotions",
    icon: Percent,
    iconBg: "bg-[#FCE8E6]",
    iconColor: "text-[#EA4335]",
    badgeBg: "bg-[#F3E8FF]",
    badgeColor: "text-[#A855F7]",
    dotColor: "bg-[#EA4335]",
  },
  {
    id: "notif-5",
    title: "Website Content Updated",
    description: "Hero Banner on Homepage has been updated.",
    time: "3 hours ago",
    badge: "New",
    isRead: false,
    type: "System",
    icon: FileText,
    iconBg: "bg-[#E8F0FE]",
    iconColor: "text-[#1A73E8]",
    badgeBg: "bg-[#F3E8FF]",
    badgeColor: "text-[#A855F7]",
    dotColor: "bg-[#1A73E8]",
  },
  {
    id: "notif-6",
    title: "Monthly Sales Report Ready",
    description: "April 2025 sales report is ready to view.",
    time: "Yesterday, 10:30 AM",
    badge: "Read",
    isRead: true,
    type: "Orders",
    icon: TrendingUp,
    iconBg: "bg-[#E6F4EA]",
    iconColor: "text-[#34A853]",
    badgeBg: "bg-[#E6F4EA]",
    badgeColor: "text-[#34A853]",
    dotColor: "bg-[#34A853]",
  },
  {
    id: "notif-7",
    title: "New Custom Gift Request",
    description: "Rahul from Mumbai requested a Custom Gift Box.",
    time: "Yesterday, 09:15 AM",
    badge: "New",
    isRead: false,
    type: "Gifts",
    icon: Gift,
    iconBg: "bg-[#FFF4EB]",
    iconColor: "text-[#FF7A00]",
    badgeBg: "bg-[#FFF4EB]",
    badgeColor: "text-[#FF7A00]",
    dotColor: "bg-[#FF7A00]",
  },
  {
    id: "notif-8",
    title: "System Update",
    description: "System maintenance completed successfully.",
    time: "2 May 2025, 11:20 AM",
    badge: "Read",
    isRead: true,
    type: "System",
    icon: Settings,
    iconBg: "bg-[#E8F0FE]",
    iconColor: "text-[#1A73E8]",
    badgeBg: "bg-[#E8F0FE]",
    badgeColor: "text-[#1A73E8]",
    dotColor: "bg-[#1A73E8]",
  },
];

// Additional Batch for "Load More"
const loadMoreBatch: NotificationItem[] = [
  {
    id: "notif-9",
    title: "Bulk Order Query Received",
    description: "Anjali Gupta inquired about 50 Gift Packs.",
    time: "1 May 2025, 03:20 PM",
    badge: "Read",
    isRead: true,
    type: "Gifts",
    icon: Gift,
    iconBg: "bg-[#FFF4EB]",
    iconColor: "text-[#FF7A00]",
    badgeBg: "bg-[#E8F0FE]",
    badgeColor: "text-[#1A73E8]",
    dotColor: "bg-[#FF7A00]",
  },
  {
    id: "notif-10",
    title: "Stock Restocked",
    description: "50 Units of Tulsi Honey added to inventory.",
    time: "30 Apr 2025, 11:10 AM",
    badge: "Read",
    isRead: true,
    type: "Inventory",
    icon: Package,
    iconBg: "bg-[#FEF3D6]",
    iconColor: "text-[#F5A623]",
    badgeBg: "bg-[#E6F4EA]",
    badgeColor: "text-[#34A853]",
    dotColor: "bg-[#F5A623]",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<"All" | "Unread" | "Read">("All");
  
  // Filter Dropdown States
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Load More States
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Tab & Dropdown Filtering Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Tab Status Filter
      if (activeTab === "Unread" && item.isRead) return false;
      if (activeTab === "Read" && !item.isRead) return false;

      // 2. Dropdown Category Type Filter
      if (selectedType !== "All Types" && item.type !== selectedType) return false;

      return true;
    });
  }, [notifications, activeTab, selectedType]);

  // Counts for Tabs
  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const readCount = useMemo(() => notifications.filter((n) => n.isRead).length, [notifications]);

  // Handler: Mark all as read
  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        badge: "Read",
        isRead: true,
        badgeBg: "bg-[#E6F4EA]",
        badgeColor: "text-[#34A853]",
      }))
    );
  };

  // Handler: Mark single item read on click
  const handleItemClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, isRead: true, badge: "Read", badgeBg: "bg-[#E6F4EA]", badgeColor: "text-[#34A853]" }
          : n
      )
    );
  };

  // Handler: Load More Button
  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setNotifications((prev) => [...prev, ...loadMoreBatch]);
      setLoading(false);
      setHasMore(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 text-[#0F172A] font-sans">
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* ---------------- Top Controls Bar ---------------- */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Tabs Group */}
          <div className="flex items-center gap-2">
            {/* Tab: All */}
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

            {/* Tab: Unread */}
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

            {/* Tab: Read */}
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-end sm:self-auto relative">
            {/* Mark All As Read */}
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <CheckCircle2 size={15} className="text-[#64748B]" />
              <span>Mark all as read</span>
            </button>

            {/* Working Filter Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Filter size={14} className="text-[#64748B]" />
                <span>{selectedType}</span>
                <ChevronDown size={14} className="text-[#94A3B8]" />
              </button>

              {/* Filter Options Popover */}
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 space-y-1">
                  {["All Types", "Orders", "Inventory", "Products", "Promotions", "System", "Gifts"].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                        selectedType === type
                          ? "bg-amber-50 text-[#D97706]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{type}</span>
                      {selectedType === type && <Check size={14} className="text-[#D97706]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ---------------- Notifications Card Stack List ---------------- */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const IconComponent = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`bg-white rounded-2xl p-4 border transition-all flex items-center justify-between gap-4 cursor-pointer group shadow-[0_2px_8px_rgba(0,0,0,0.015)] ${
                    !item.isRead ? "border-slate-200/80 hover:border-slate-300" : "border-[#F1F5F9] opacity-90"
                  }`}
                >
                  {/* Left: Icon & Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Icon Box with Dot */}
                    <div className="relative shrink-0">
                      <div className={`h-11 w-11 rounded-2xl ${item.iconBg} flex items-center justify-center`}>
                        <IconComponent size={20} className={item.iconColor} />
                      </div>
                      {/* Status Dot */}
                      {!item.isRead && (
                        <span className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${item.dotColor}`} />
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#D97706] transition-colors leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#64748B] font-medium mt-0.5 truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Date, Badge & Arrow */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-[#94A3B8]">{item.time}</p>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold mt-0.5 ${item.badgeBg} ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <ChevronRight size={16} className="text-[#CBD5E1] group-hover:text-[#0F172A] transition-colors" />
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-[#F1F5F9]">
              <div className="h-12 w-12 rounded-full bg-amber-50 text-[#D97706] flex items-center justify-center mx-auto">
                <Bell size={22} />
              </div>
              <h3 className="text-base font-extrabold text-[#0F172A]">No Notifications Found</h3>
              <p className="text-xs text-[#64748B]">There are no notifications matching your active filters.</p>
            </div>
          )}
        </div>

        {/* ---------------- Load More Button ---------------- */}
        {hasMore && filteredNotifications.length > 0 && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] hover:bg-slate-50 transition-all shadow-2xs cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <span>{loading ? "Loading..." : "Load More"}</span>
              <ChevronDown size={15} className={`text-[#64748B] ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}