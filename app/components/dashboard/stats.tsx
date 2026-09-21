"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  BadgeIndianRupee,
  TriangleAlert,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

export default function DashboardCards() {
  const [loading, setLoading] = useState<boolean>(true);
  const [counts, setCounts] = useState({
    total: "0",
    pending: "0",
    shipped: "0",
    lowStock: "0",
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
    if (typeof json.lowStockCount === "number") return json.lowStockCount;
    if (typeof json.low_stock_count === "number") return json.low_stock_count;
    if (typeof json.totalProducts === "number") return json.totalProducts;
    if (typeof json.data === "number") return json.data;

    if (json?.data && typeof json.data === "object") {
      if (typeof json.data.totalProducts === "number") return json.data.totalProducts;
      if (typeof json.data.total === "number") return json.data.total;
      if (typeof json.data.count === "number") return json.data.count;
    }

    return 0;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardStats = async () => {
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
        const [totalRes, pendingRes, shippedRes, lowStockRes1, lowStockRes2, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders-with-status`, { credentials: "include", headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders-with-status?status=Processing`, { credentials: "include", headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders-with-status?status=Shipped`, { credentials: "include", headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/admin/order-dashboard/low-stock/product`, { credentials: "include", headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/dashboard/low-stock`, { credentials: "include", headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders`, { credentials: "include", headers }).catch(() => null),
        ]);

        const totalJson = totalRes && totalRes.ok ? await totalRes.json().catch(() => null) : null;
        const pendingJson = pendingRes && pendingRes.ok ? await pendingRes.json().catch(() => null) : null;
        const shippedJson = shippedRes && shippedRes.ok ? await shippedRes.json().catch(() => null) : null;
        const lowStockJson1 = lowStockRes1 && lowStockRes1.ok ? await lowStockRes1.json().catch(() => null) : null;
        const lowStockJson2 = lowStockRes2 && lowStockRes2.ok ? await lowStockRes2.json().catch(() => null) : null;
        const ordersJson = ordersRes && ordersRes.ok ? await ordersRes.json().catch(() => null) : null;

        const fallbackJson = totalJson || ordersJson;

        const totalVal = totalJson ? parseCount(totalJson) : (ordersJson ? parseCount(ordersJson) : 0);
        
        let pendingVal = 0;
        if (pendingJson) {
          pendingVal = parseCount(pendingJson, "Processing");
        } else if (fallbackJson) {
          pendingVal = parseCount(fallbackJson, "Processing");
        }

        let shippedVal = 0;
        if (shippedJson) {
          shippedVal = parseCount(shippedJson, "Shipped");
        } else if (fallbackJson) {
          shippedVal = parseCount(fallbackJson, "Shipped");
        }

        let lowStockVal = 0;
        if (lowStockJson1) {
          lowStockVal = parseCount(lowStockJson1);
        }
        if (lowStockVal === 0 && lowStockJson2) {
          lowStockVal = parseCount(lowStockJson2);
        }

        if (isMounted) {
          setCounts({
            total: String(totalVal),
            pending: String(pendingVal),
            shipped: String(shippedVal),
            lowStock: String(lowStockVal),
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchDashboardStats();
    return () => { isMounted = false; };
  }, []);

  const cards = [
    {
      title: "Total Order",
      value: counts.total,
      desc: "Across all categories",
      icon: Package,
      color: "#FF7A00",
      bg: "#FFF4EB",
    },
    {
      title: "Pending Orders",
      value: counts.pending,
      desc: "Awaiting processing",
      icon: ShoppingCart,
      color: "#22C55E",
      bg: "#ECFDF3",
    },
    {
      title: "Shiped Order",
      value: counts.shipped,
      desc: "18.6% from yesterday",
      icon: BadgeIndianRupee,
      color: "#A855F7",
      bg: "#F5EEFF",
      growth: true,
    },
    {
      title: "Low Stock",
      value: counts.lowStock,
      desc: "Need attention",
      icon: TriangleAlert,
      color: "#EF4444",
      bg: "#FEF2F2",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((item, i) => {
        const Icon = item.icon;

        return (
          <div
            key={i}
            className="rounded-[22px] border border-[#F1F1F1] bg-white px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all group select-none"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl group-hover:scale-105 transition-transform"
                style={{ background: item.bg }}
              >
                <Icon
                  size={22}
                  strokeWidth={2}
                  style={{ color: item.color }}
                />
              </div>

              <div className="text-right">
                <p className="text-[15px] font-medium text-[#6B7280]">
                  {item.title}
                </p>

                <h2 className="mt-1 text-[24px] font-bold leading-none text-[#1F1B2D]">
                  {loading ? (
                    <Loader2 className="animate-spin inline-block h-5 w-5 text-gray-400" />
                  ) : (
                    item.value
                  )}
                </h2>
              </div>
            </div>

            <div className="mt-9 flex items-center justify-between">
              {item.growth ? (
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-semibold text-green-500">
                    ↗ 18.6%
                  </span>

                  <span className="text-[#98A2B3]">
                    from yesterday
                  </span>
                </div>
              ) : (
                <p className="text-sm text-[#98A2B3]">
                  {item.desc}
                </p>
              )}

              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: item.bg }}
              >
                <ChevronRight
                  size={18}
                  style={{ color: item.color }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}