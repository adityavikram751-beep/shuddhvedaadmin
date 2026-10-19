"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  RotateCcw,
  Search,
  ChevronDown,
  Calendar,
  Check,
  Eye,
  Video,
  Image as ImageIcon,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  Copy,
  ExternalLink,
  X,
  Play,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

// ---------- Interfaces ----------
export interface PackagingImage {
  url: string;
  public_id?: string;
}

export interface UnboxingVideo {
  public_id?: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export interface ProductVariant {
  _id?: string;
  weight?: number;
  unit?: string;
  sku?: string;
  price?: number;
  mrp?: number;
  save?: number;
}

export interface ProductDetails {
  _id?: string;
  product_name?: string;
  name?: string;
  brand?: string;
  description?: string;
  product_type?: string;
  floral_source?: string;
  image?: {
    image_url?: string;
    public_id?: string;
  };
  variant?: ProductVariant;
}

export interface ReturnOrderItem {
  type?: string;
  quantity?: number;
  reserved_quantity?: number;
  _id?: string;
  product_details?: {
    cartItemId?: string;
    product?: ProductDetails;
    totalAmount?: number;
    totalWeight?: number;
    totalWeightUnit?: string;
    totalsave?: number;
  };
}

export interface ReturnOrderDetails {
  orderId?: string;
  order_id?: string;
  order_status?: string;
  items?: ReturnOrderItem[];
}

export interface ReturnRequestItem {
  _id: string;
  userId?: string;
  orderId?: string;
  orderGroupId?: string;
  packagingImages?: PackagingImage[];
  unboxingVideo?: UnboxingVideo;
  status: "requested" | "approved" | "rejected" | "processing" | "completed" | "under_review" | string;
  phoneNumber?: string;
  reason?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
  orderDetails?: ReturnOrderDetails;
}

export default function ReturnOrdersComponent() {
  const [returnOrders, setReturnOrders] = useState<ReturnRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Filter States
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All Statuses");
  const [dateFilter, setDateFilter] = useState<string>("All Time");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 8;

  // Modals
  const [inspectItem, setInspectItem] = useState<ReturnRequestItem | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);

  // Status update states
  const [adminNoteInput, setAdminNoteInput] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenInspect = (item: ReturnRequestItem) => {
    setInspectItem(item);
    setAdminNoteInput(item.adminNote || "");
  };

  // Update return request status API call
  const handleUpdateStatus = async (
    returnRequestsId: string,
    newStatus: "approved" | "rejected" | "under_review",
    customNote?: string
  ) => {
    if (!returnRequestsId) return;

    setUpdatingId(returnRequestsId);
    try {
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

      const note =
        (customNote !== undefined ? customNote : adminNoteInput).trim() ||
        (newStatus === "under_review"
          ? "Reviewing the packaging images and unboxing video."
          : newStatus === "approved"
          ? "Approved by admin after reviewing packaging images and unboxing video."
          : "Rejected by admin after reviewing packaging images and unboxing video.");

      const res = await fetch(
        `${API_BASE_URL}/api/admin/order-dashboard/update/return-request`,
        {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify({
            returnRequestsId,
            status: newStatus,
            adminNote: note,
          }),
        }
      );

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success !== false) {
        showToast(
          json.message ||
            `Return request ${
              newStatus === "under_review"
                ? "marked as under review"
                : newStatus === "approved"
                ? "approved"
                : "rejected"
            } successfully!`,
          "success"
        );

        // Update locally in returnOrders list
        setReturnOrders((prev) =>
          prev.map((item) =>
            item._id === returnRequestsId
              ? { ...item, status: newStatus, adminNote: note }
              : item
          )
        );

        // Update inspectItem if currently open
        setInspectItem((prev) =>
          prev && prev._id === returnRequestsId
            ? { ...prev, status: newStatus, adminNote: note }
            : prev
        );
      } else {
        showToast(json.message || "Failed to update return request status.", "error");
      }
    } catch (err: any) {
      console.error("Error updating return request status:", err);
      showToast("Network error while updating return request.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Fetch API
  const fetchReturnOrders = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage("");

    try {
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

      const res = await fetch(
        `${API_BASE_URL}/api/admin/order-dashboard/all-return-orders/details`,
        {
          method: "GET",
          credentials: "include",
          headers,
        }
      );

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success) {
        const list: ReturnRequestItem[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.returnOrders)
          ? json.returnOrders
          : [];
        setReturnOrders(list);
      } else {
        setErrorMessage(json.message || "Failed to load return orders from server.");
      }
    } catch (err: any) {
      console.error("Error fetching return orders:", err);
      setErrorMessage("Network error connecting to API. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchReturnOrders();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = returnOrders.length;
    let requested = 0;
    let approved = 0;
    let rejected = 0;

    returnOrders.forEach((item) => {
      const s = String(item.status || "").toLowerCase();
      if (s === "requested" || s === "pending" || s === "under_review") requested++;
      else if (s === "approved" || s === "completed") approved++;
      else if (s === "rejected" || s === "cancelled") rejected++;
    });

    return { total, requested, approved, rejected };
  }, [returnOrders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return returnOrders.filter((item) => {
      const q = search.trim().toLowerCase();

      // Search matching
      const matchesSearch =
        q === "" ||
        item._id.toLowerCase().includes(q) ||
        (item.orderId && item.orderId.toLowerCase().includes(q)) ||
        (item.orderDetails?.order_id && item.orderDetails.order_id.toLowerCase().includes(q)) ||
        (item.phoneNumber && item.phoneNumber.toLowerCase().includes(q)) ||
        (item.reason && item.reason.toLowerCase().includes(q)) ||
        item.orderDetails?.items?.some((it) =>
          it.product_details?.product?.product_name?.toLowerCase().includes(q)
        );

      // Status matching
      const matchesStatus = (() => {
        if (statusFilter === "All Statuses") return true;
        const target = statusFilter.toLowerCase();
        const current = String(item.status || "").toLowerCase();
        if (target === "requested") return current === "requested" || current === "pending";
        if (target === "approved") return current === "approved" || current === "completed";
        if (target === "rejected") return current === "rejected" || current === "cancelled";
        return current === target;
      })();

      // Date matching
      const matchesDate = (() => {
        if (dateFilter === "All Time") return true;
        const orderTime = new Date(item.createdAt).getTime();
        if (isNaN(orderTime)) return true;

        const now = new Date();
        if (dateFilter === "Today") {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          const endOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999
          ).getTime();
          return orderTime >= startOfToday && orderTime <= endOfToday;
        }
        if (dateFilter === "This Month") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          ).getTime();
          return orderTime >= startOfMonth && orderTime <= endOfMonth;
        }
        return true;
      })();

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [returnOrders, search, statusFilter, dateFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length);
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, startIndex, endIndex]);

  const handleCopy = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All Statuses");
    setDateFilter("All Time");
    setCurrentPage(1);
  };

  const isAnyFilterActive =
    search.trim() !== "" || statusFilter !== "All Statuses" || dateFilter !== "All Time";

  // Helpers
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: dateStr || "-", time: "" };
    return {
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
  };

  const getStatusBadge = (statusStr: string) => {
    const s = String(statusStr || "requested").toLowerCase();
    if (s === "approved" || s === "completed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} className="text-emerald-600" />
          Approved
        </span>
      );
    }
    if (s === "rejected" || s === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
          <XCircle size={12} className="text-red-600" />
          Rejected
        </span>
      );
    }
    if (s === "under_review" || s === "review" || s === "processing") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Clock size={12} className="text-blue-600" />
          Under Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={12} className="text-amber-600" />
        Requested
      </span>
    );
  };

  return (
    <div className="w-full space-y-5 min-w-0 relative">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <XCircle size={16} className="text-red-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
      {/* 1. Header Banner & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-bold border border-orange-200">
              <RotateCcw size={13} className="text-orange-600" />
              Return &amp; Exchange Requests
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-1">
            Return Orders Management
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Review customer return requests, inspect video &amp; packaging image proofs, and manage exchanges.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => void fetchReturnOrders(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition shadow-2xs cursor-pointer disabled:opacity-60"
            title="Refresh returns data"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-orange-500" : "text-gray-500"} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Returns */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Returns</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{loading ? "..." : stats.total}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <RotateCcw size={20} />
          </div>
        </div>

        {/* Requested / Pending */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Pending Review</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{loading ? "..." : stats.requested}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Approved</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{loading ? "..." : stats.approved}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Rejected</p>
            <p className="text-2xl font-black text-red-600 mt-1">{loading ? "..." : stats.rejected}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 sm:p-5 min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 min-w-0">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Order ID, Phone, Product Name, or Reason..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 shrink-0">
            {/* Status Select */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer pr-8 appearance-none"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Requested">Requested (Pending)</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Date Select */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer pr-8 appearance-none"
              >
                <option value="All Time">All Time</option>
                <option value="Today">Today</option>
                <option value="This Month">This Month</option>
              </select>
              <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filters Summary & Reset */}
        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-gray-100 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <span>
              Showing <strong className="text-gray-900 font-bold">{filteredOrders.length}</strong> of{" "}
              <strong className="text-gray-900 font-bold">{returnOrders.length}</strong> return requests
            </span>
            {isAnyFilterActive && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
                Filters applied
              </span>
            )}
          </div>

          {isAnyFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 font-bold text-orange-600 hover:text-orange-700 transition cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Table / Content Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0 w-full">
        {errorMessage && (
          <div className="p-4 bg-red-50 border-b border-red-100 text-xs text-red-700 flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle size={15} className="shrink-0 text-red-600" />
              {errorMessage}
            </span>
            <button
              onClick={() => void fetchReturnOrders()}
              className="underline font-bold text-red-800 hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[960px] text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3.5">Return ID &amp; Date</th>
                <th className="px-4 py-3.5">Order Reference</th>
                <th className="px-4 py-3.5">Customer Contact</th>
                <th className="px-4 py-3.5">Product Details</th>
                <th className="px-4 py-3.5">Return Reason</th>
                <th className="px-4 py-3.5">Proofs (Video / Photo)</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-orange-500" />
                      <span className="text-xs font-semibold text-gray-600">Loading return requests from server...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                        <RotateCcw size={22} />
                      </div>
                      <p className="font-bold text-gray-800 text-sm mt-1">No return requests found</p>
                      <p className="text-gray-400 text-xs">
                        {isAnyFilterActive
                          ? "Try clearing your search query or status filter."
                          : "No customers have requested returns or exchanges yet."}
                      </p>
                      {isAnyFilterActive && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg font-bold text-xs transition cursor-pointer"
                        >
                          <RotateCcw size={12} />
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((item) => {
                  const { date, time } = formatDateTime(item.createdAt);
                  const displayOrderId =
                    item.orderDetails?.order_id ||
                    (item.orderId ? `#SV${item.orderId.slice(-6).toUpperCase()}` : "-");
                  const primaryItem = item.orderDetails?.items?.[0];
                  const productObj = primaryItem?.product_details?.product;
                  const productName = productObj?.product_name || productObj?.name || "Pure Honey Jar";
                  const productImg =
                    productObj?.image?.image_url ||
                    "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=150&auto=format&fit=crop&q=80";
                  const variant = productObj?.variant;
                  const weightStr = variant?.weight ? `${variant.weight}${variant.unit || "g"}` : "250g";
                  const priceStr = variant?.price ? `₹${variant.price}` : "₹299";

                  const packagingImages = item.packagingImages || [];
                  const unboxingVideo = item.unboxingVideo;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-orange-50/20 transition-colors group cursor-pointer"
                      onClick={() => handleOpenInspect(item)}
                    >
                      {/* Return ID & Date */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-gray-900 text-xs">
                            #{item._id.slice(-6).toUpperCase()}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(item._id, item._id);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition"
                            title="Copy full Return ID"
                          >
                            {copiedId === item._id ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">{date}</p>
                        <p className="text-[10px] text-gray-400">{time}</p>
                      </td>

                      {/* Order Reference */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-[#593102] text-xs">
                            {displayOrderId}
                          </span>
                        </div>
                        {item.orderDetails?.order_status && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                            Order: {item.orderDetails.order_status}
                          </span>
                        )}
                      </td>

                      {/* Customer Contact */}
                      <td className="px-4 py-3.5">
                        {item.phoneNumber ? (
                          <div className="space-y-1">
                            <span className="font-mono font-bold text-gray-900 block">
                              +91 {item.phoneNumber}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`https://wa.me/91${item.phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                                  `Hello! We received your return/exchange request for Order ${displayOrderId}. We are reviewing your unboxing proofs.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
                                title="Chat with customer on WhatsApp"
                              >
                                <MessageCircle size={10} />
                                WhatsApp
                              </a>
                              <a
                                href={`tel:${item.phoneNumber}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 transition border border-gray-200"
                                title="Call customer"
                              >
                                <Phone size={10} />
                                Call
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No phone</span>
                        )}
                      </td>

                      {/* Product Details */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5 max-w-[220px]">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            <Image
                              src={productImg}
                              alt={productName}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 truncate leading-snug">{productName}</p>
                            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                              {weightStr} • <span className="font-bold text-orange-600">{priceStr}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Return Reason */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50/80 border border-orange-200 text-orange-800 text-xs font-semibold">
                          <ShieldAlert size={13} className="text-orange-600 shrink-0" />
                          <span className="truncate">{item.reason || "Product Defect / Return"}</span>
                        </div>
                      </td>

                      {/* Proofs: Images & Video */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {/* Video Thumbnail */}
                          {unboxingVideo?.videoUrl ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveVideoUrl(unboxingVideo.videoUrl);
                              }}
                              className="relative w-11 h-11 rounded-xl overflow-hidden bg-black/90 border-2 border-orange-400 hover:border-orange-500 transition group/v cursor-pointer shadow-2xs shrink-0 flex items-center justify-center"
                              title="Play Customer Unboxing Video"
                            >
                              {unboxingVideo.thumbnailUrl ? (
                                <Image
                                  src={unboxingVideo.thumbnailUrl}
                                  alt="Video preview"
                                  fill
                                  unoptimized
                                  className="object-cover opacity-80 group-hover/v:opacity-100 transition"
                                />
                              ) : (
                                <Video size={16} className="text-white" />
                              )}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Play size={14} className="text-white fill-white" />
                              </div>
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">No video</span>
                          )}

                          {/* Packaging Photos */}
                          {packagingImages.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {packagingImages.slice(0, 2).map((img, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePhotoUrl(img.url);
                                  }}
                                  className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 hover:border-orange-400 transition cursor-pointer shadow-2xs shrink-0"
                                  title="View Packaging Photo"
                                >
                                  <Image
                                    src={img.url}
                                    alt={`Packaging ${idx + 1}`}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </button>
                              ))}
                              {packagingImages.length > 2 && (
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 rounded-lg px-1.5 py-1">
                                  +{packagingImages.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">No photo</span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInspect(item);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold text-xs transition cursor-pointer border border-orange-200"
                        >
                          <Eye size={13} />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Bar */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 text-xs text-gray-500 flex-wrap gap-2">
            <span>
              Showing {startIndex + 1} to {endIndex} of {filteredOrders.length} entries
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-gray-800">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: FULL RETURN INSPECTION DRAWER / MODAL
          ========================================================================= */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-[#FAF5EC]/40">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-black text-gray-900">
                    Return Request Details
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    ID: #{inspectItem._id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInspectItem(null);
                  setAdminNoteInput("");
                }}
                className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
              {/* Order & Status Header Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Status</span>
                  <div className="mt-1">{getStatusBadge(inspectItem.status)}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Order ID</span>
                  <span className="font-mono font-extrabold text-[#593102] block mt-1">
                    {inspectItem.orderDetails?.order_id || inspectItem.orderId || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Phone</span>
                  <span className="font-mono font-bold text-gray-900 block mt-1">
                    {inspectItem.phoneNumber ? `+91 ${inspectItem.phoneNumber}` : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Date</span>
                  <span className="font-bold text-gray-700 block mt-1">
                    {formatDateTime(inspectItem.createdAt).date}
                  </span>
                </div>
              </div>

              {/* Stated Reason */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-900 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-orange-600" />
                  Customer Reason for Return / Exchange:
                </span>
                <p className="text-sm font-extrabold text-orange-950">
                  &ldquo;{inspectItem.reason || "Product leakage / defect"}&rdquo;
                </p>
              </div>

              {/* Proofs Section: Video & Images */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Video size={14} className="text-orange-500" />
                  Uploaded Unboxing Video &amp; Photos Proof
                </h4>

                {/* Video Player */}
                {inspectItem.unboxingVideo?.videoUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black aspect-video max-h-56 flex items-center justify-center shadow-xs">
                    <video
                      src={inspectItem.unboxingVideo.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-400 italic">
                    No unboxing video uploaded with this request.
                  </div>
                )}

                {/* Packaging Photos Grid */}
                {inspectItem.packagingImages && inspectItem.packagingImages.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-gray-600 block mb-2">
                      Packaging &amp; Jar Photos ({inspectItem.packagingImages.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {inspectItem.packagingImages.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActivePhotoUrl(img.url)}
                          className="relative h-28 rounded-xl overflow-hidden border border-gray-200 hover:border-orange-400 cursor-pointer shadow-2xs group"
                        >
                          <Image
                            src={img.url}
                            alt={`Photo proof ${idx + 1}`}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition duration-200"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Eye size={16} className="text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Products Included */}
              {inspectItem.orderDetails?.items && inspectItem.orderDetails.items.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                    Product(s) In This Order
                  </span>
                  <div className="space-y-2">
                    {inspectItem.orderDetails.items.map((it, idx) => {
                      const prod = it.product_details?.product;
                      const title = prod?.product_name || prod?.name || "Pure Honey";
                      const img =
                        prod?.image?.image_url ||
                        "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=150&auto=format&fit=crop&q=80";
                      const weight = prod?.variant?.weight
                        ? `${prod.variant.weight}${prod.variant.unit || "g"}`
                        : "250g";
                      const price = prod?.variant?.price ? `₹${prod.variant.price}` : "₹299";

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200/80"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-white border border-gray-200 shrink-0">
                              <Image src={img} alt={title} fill unoptimized className="object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{title}</p>
                              <p className="text-[11px] text-gray-500">{weight}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900 block">{price}</span>
                            <span className="text-[11px] text-gray-400">Qty: {it.quantity || 1}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Admin Decision & Status Update Card */}
              <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-[#FFFBF5] border border-amber-200/80 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                      <ShieldAlert size={15} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                        Admin Decision &amp; Action
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        Put under review, approve, or reject customer return request
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Current:</span>
                    {getStatusBadge(inspectItem.status)}
                  </div>
                </div>

                {/* Stored Admin Note (if any) */}
                {inspectItem.adminNote && (
                  <div className="p-3 rounded-xl bg-white border border-amber-200/60 text-xs">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1">
                      Existing Admin Note:
                    </span>
                    <p className="text-gray-700 italic">
                      &ldquo;{inspectItem.adminNote}&rdquo;
                    </p>
                  </div>
                )}

                {/* If already resolved (Approved or Rejected), do not show action buttons */}
                {inspectItem.status === "approved" || inspectItem.status === "rejected" ? (
                  <div
                    className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold ${
                      inspectItem.status === "approved"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    {inspectItem.status === "approved" ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-red-600 shrink-0" />
                    )}
                    <span>
                      This return request has already been{" "}
                      {inspectItem.status === "approved" ? "Approved" : "Rejected"}.
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Admin Note Input */}
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
                        Admin Note / Remarks:
                      </label>
                      <textarea
                        rows={2}
                        value={adminNoteInput}
                        onChange={(e) => setAdminNoteInput(e.target.value)}
                        placeholder="Reviewing the packaging images and unboxing video."
                        className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-none placeholder:text-gray-400 font-medium text-gray-800"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        This note will be recorded in the database and saved with the return request.
                      </p>
                    </div>

                    {/* Decision Action Buttons: Under Review, Reject, Approved */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {/* Under Review Button */}
                      <button
                        type="button"
                        disabled={updatingId === inspectItem._id}
                        onClick={() => handleUpdateStatus(inspectItem._id, "under_review")}
                        className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm cursor-pointer disabled:cursor-not-allowed ${
                          inspectItem.status === "under_review"
                            ? "bg-blue-100 text-blue-800 border-2 border-blue-400"
                            : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white"
                        }`}
                      >
                        {updatingId === inspectItem._id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Clock size={15} />
                        )}
                        <span>Under Review</span>
                      </button>

                      {/* Reject Button */}
                      <button
                        type="button"
                        disabled={updatingId === inspectItem._id}
                        onClick={() => handleUpdateStatus(inspectItem._id, "rejected")}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
                      >
                        {updatingId === inspectItem._id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <XCircle size={15} />
                        )}
                        <span>Reject</span>
                      </button>

                      {/* Approved Button */}
                      <button
                        type="button"
                        disabled={updatingId === inspectItem._id}
                        onClick={() => handleUpdateStatus(inspectItem._id, "approved")}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
                      >
                        {updatingId === inspectItem._id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                        <span>Approved</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50">
              {inspectItem.phoneNumber ? (
                <a
                  href={`https://wa.me/91${inspectItem.phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hello! Regarding your return request #${inspectItem._id.slice(-6).toUpperCase()} for Order ${
                      inspectItem.orderDetails?.order_id || inspectItem.orderId
                    }: We have inspected your uploaded unboxing video.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs transition"
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </a>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => {
                  setInspectItem(null);
                  setAdminNoteInput("");
                }}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-100 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: DIRECT VIDEO PLAYER LIGHTBOX
          ========================================================================= */}
      {activeVideoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveVideoUrl(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 bg-gray-900/90 text-white border-b border-gray-800">
              <span className="text-xs font-bold flex items-center gap-2">
                <Video size={15} className="text-orange-400" />
                Customer Unboxing Video Proof
              </span>
              <button
                type="button"
                onClick={() => setActiveVideoUrl(null)}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            <div className="aspect-video w-full flex items-center justify-center bg-black">
              <video src={activeVideoUrl} controls autoPlay className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: DIRECT PHOTO VIEWER LIGHTBOX
          ========================================================================= */}
      {activePhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActivePhotoUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePhotoUrl(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="relative w-full h-[70vh] min-w-[300px] sm:min-w-[500px]">
              <Image
                src={activePhotoUrl}
                alt="Enlarged proof"
                fill
                unoptimized
                className="object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
