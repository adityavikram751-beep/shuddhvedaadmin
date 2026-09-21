"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  ShoppingCart,
  FileText,
  TriangleAlert,
  ChevronRight,
  ArrowUp,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

export default function OrderStats() {
  const [loading, setLoading] = useState<boolean>(true);
  const [counts, setCounts] = useState({
    processing: "0",
    packed: "0",
    shipped: "0",
    delivered: "0",
  });

  const parseCount = (json: any, targetStatus?: string): number => {
    if (json === null || json === undefined) return 0;
    if (typeof json === "number") return json;

    const itemsArray = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json?.orders)
      ? json.orders
      : Array.isArray(json?.products)
      ? json.products
      : Array.isArray(json?.items)
      ? json.items
      : Array.isArray(json?.result)
      ? json.result
      : Array.isArray(json?.data?.orders)
      ? json.data.orders
      : Array.isArray(json?.data?.products)
      ? json.data.products
      : null;

    if (targetStatus) {
      const lower = targetStatus.toLowerCase();

      if (itemsArray) {
        return itemsArray.filter((item: any) => {
          const st = String(
            item.status ||
            item.order_status ||
            item.delivery_status ||
            item.deliveryStatus ||
            item.shipment_status ||
            ""
          ).toLowerCase();
          return st.includes(lower);
        }).length;
      }

      const obj = json?.counts || (json?.data && typeof json.data === "object" && !Array.isArray(json.data) ? json.data : json);
      if (obj && typeof obj === "object") {
        for (const key of Object.keys(obj)) {
          if (key.toLowerCase().includes(lower)) {
            if (typeof obj[key] === "number") return obj[key];
            if (Array.isArray(obj[key])) return obj[key].length;
          }
        }
      }

      for (const key of Object.keys(json)) {
        if (key.toLowerCase().includes(lower) && typeof json[key] === "number") {
          return json[key];
        }
      }

      return 0;
    }

    if (itemsArray) {
      return itemsArray.length;
    }

    if (typeof json.count === "number") return json.count;
    if (typeof json.total === "number") return json.total;
    if (typeof json.totalOrders === "number") return json.totalOrders;
    if (typeof json.total_orders === "number") return json.total_orders;
    if (typeof json.ordersCount === "number") return json.ordersCount;
    if (typeof json.data === "number") return json.data;

    return 0;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchOrderStats = async () => {
      setLoading(true);
      const token = typeof window !== "undefined"
        ? (localStorage.getItem("sudhveda_token") || localStorage.getItem("admin_token") || localStorage.getItem("token"))
        : null;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const [procRes, packedRes, shippedRes, delRes, allRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders-with-status?status=Processing`, { credentials: "include", headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders-with-status?status=Packed`, { credentials: "include", headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders-with-status?status=Shipped`, { credentials: "include", headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders-with-status?status=Delivered`, { credentials: "include", headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders-with-status`, { credentials: "include", headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders`, { credentials: "include", headers }).catch(() => null),
        ]);

        const procJson = procRes && procRes.ok ? await procRes.json().catch(() => null) : null;
        const packedJson = packedRes && packedRes.ok ? await packedRes.json().catch(() => null) : null;
        const shippedJson = shippedRes && shippedRes.ok ? await shippedRes.json().catch(() => null) : null;
        const delJson = delRes && delRes.ok ? await delRes.json().catch(() => null) : null;
        const allJson = allRes && allRes.ok ? await allRes.json().catch(() => null) : null;
        const ordersJson = ordersRes && ordersRes.ok ? await ordersRes.json().catch(() => null) : null;

        const fallbackJson = allJson || ordersJson;

        const procVal = procJson ? parseCount(procJson, "Processing") : (fallbackJson ? parseCount(fallbackJson, "Processing") : 0);
        const packedVal = packedJson ? parseCount(packedJson, "Packed") : (fallbackJson ? parseCount(fallbackJson, "Packed") : 0);
        const shippedVal = shippedJson ? parseCount(shippedJson, "Shipped") : (fallbackJson ? parseCount(fallbackJson, "Shipped") : 0);
        const delVal = delJson ? parseCount(delJson, "Delivered") : (fallbackJson ? parseCount(fallbackJson, "Delivered") : 0);

        if (isMounted) {
          setCounts({
            processing: String(procVal),
            packed: String(packedVal),
            shipped: String(shippedVal),
            delivered: String(delVal),
          });
        }
      } catch (err) {
        console.error("Error fetching order stats:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchOrderStats();
    return () => { isMounted = false; };
  }, []);

  const stats = [
    {
      label: "Processing Order",
      value: counts.processing,
      subtext: "Across all categories",
      icon: Box,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      chevronBg: "bg-orange-50",
      chevronColor: "text-orange-500",
    },
    {
      label: "PACKED",
      value: counts.packed,
      subtext: "Ready to Ship",
      icon: ShoppingCart,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      chevronBg: "bg-emerald-50",
      chevronColor: "text-emerald-500",
    },
    {
      label: "Shiped Order",
      value: counts.shipped,
      subtext: "18.6% from yesterday",
      subtextColor: "text-emerald-500",
      trend: "up",
      icon: FileText,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
      chevronBg: "bg-purple-50",
      chevronColor: "text-purple-500",
    },
    {
      label: "DELIVERED",
      value: counts.delivered,
      subtext: "Need attention",
      icon: TriangleAlert,
      iconBg: "bg-red-50",
      iconColor: "text-red-400",
      chevronBg: "bg-red-50",
      chevronColor: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 w-full">
      {stats.map(
        ({
          label,
          value,
          subtext,
          subtextColor,
          trend,
          icon: Icon,
          iconBg,
          iconColor,
          chevronBg,
          chevronColor,
        }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all p-3.5 sm:p-4 md:p-5 flex flex-col justify-between min-h-[135px] select-none group min-w-0 w-full"
          >
            {/* Top row: icon + label/value */}
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-105 transition-transform shrink-0`}
              >
                <Icon size={20} className={iconColor} strokeWidth={2} />
              </div>
              <div className="text-right min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-gray-400 truncate">
                  {label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1 truncate">
                  {loading ? (
                    <Loader2 className="animate-spin inline-block h-5 w-5 text-gray-400" />
                  ) : (
                    value
                  )}
                </p>
              </div>
            </div>

            {/* Bottom row: subtext + chevron button */}
            <div className="flex items-center justify-between mt-3 sm:mt-4 gap-2 min-w-0">
              <p
                className={`text-[11px] sm:text-xs flex items-center gap-1 min-w-0 truncate ${
                  subtextColor ?? "text-gray-400"
                }`}
              >
                {trend === "up" && <ArrowUp size={12} strokeWidth={3} className="shrink-0" />}
                <span className="truncate">{subtext}</span>
              </p>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${chevronBg} shrink-0`}
              >
                <ChevronRight size={14} className={chevronColor} />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}