"use client";

import { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  Gift,
  TriangleAlert,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

export default function DashboardCards() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    honeyProducts: 0,
    giftBoxProducts: 0,
    lowStockItems: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const fetchConfig: RequestInit = {
          credentials: "include", // Sent with cookies
          headers: {
            "Content-Type": "application/json",
          },
        };

        // Parallel Fetch Requests
        const [totalRes, honeyRes, giftRes, lowStockRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard/total-product`, fetchConfig).catch(() => null),
          fetch(`${API_BASE_URL}/api/dashboard/filter?product_type=honey`, fetchConfig).catch(() => null),
          fetch(`${API_BASE_URL}/api/dashboard/filter?product_type=gift_box`, fetchConfig).catch(() => null),
          fetch(`${API_BASE_URL}/api/dashboard/low-stock`, fetchConfig).catch(() => null),
        ]);

        // 🎯 Helper to extract numeric count safely from nested API structure
        const getCount = async (res: Response | null) => {
          if (!res || !res.ok) return 0;
          try {
            const body = await res.json();
            
            // Direct number check
            if (typeof body === "number") return body;
            
            // Check top level keys
            if (typeof body.totalProducts === "number") return body.totalProducts;
            if (typeof body.total === "number") return body.total;
            if (typeof body.count === "number") return body.count;

            // Check inside body.data object (Aapke API structure ke hisab se)
            if (body.data && typeof body.data === "object") {
              if (typeof body.data.totalProducts === "number") return body.data.totalProducts;
              if (typeof body.data.total === "number") return body.data.total;
              if (typeof body.data.count === "number") return body.data.count;
              if (Array.isArray(body.data)) return body.data.length;
            }

            // Fallback for direct arrays
            if (Array.isArray(body.products)) return body.products.length;
            if (Array.isArray(body)) return body.length;

            return 0;
          } catch {
            return 0;
          }
        };

        const totalProducts = await getCount(totalRes);
        const honeyProducts = await getCount(honeyRes);
        const giftBoxProducts = await getCount(giftRes);
        const lowStockItems = await getCount(lowStockRes);

        setStats({
          totalProducts,
          honeyProducts,
          giftBoxProducts,
          lowStockItems,
        });
      } catch (err) {
        console.error("Dashboard Stats Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const cards = [
    {
      title: "Total Products",
      value: loading ? "..." : String(stats.totalProducts),
      desc: "Across all categories",
      icon: Package,
      color: "#FF7A00",
      bg: "#FFF4EB",
    },
    {
      title: "Honey Products",
      value: loading ? "..." : String(stats.honeyProducts),
      desc: "Honey related items",
      icon: ShoppingCart,
      color: "#22C55E",
      bg: "#ECFDF3",
    },
    {
      title: "Gift Boxes",
      value: loading ? "..." : String(stats.giftBoxProducts),
      desc: "Gift box products",
      icon: Gift,
      color: "#A855F7",
      bg: "#F5EEFF",
    },
    {
      title: "Low Stock Items",
      value: loading ? "..." : String(stats.lowStockItems),
      desc: "Need attention",
      icon: TriangleAlert,
      color: "#EF4444",
      bg: "#FEF2F2",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 p-6">
      {cards.map((item, i) => {
        const Icon = item.icon;

        return (
          <div
            key={i}
            className="rounded-[22px] border border-[#F1F1F1] bg-white px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shrink-0"
                style={{ background: item.bg }}
              >
                <Icon size={22} strokeWidth={2} style={{ color: item.color }} />
              </div>

              <div className="text-right">
                <p className="text-[15px] font-medium text-[#6B7280]">
                  {item.title}
                </p>

                <h2 className="mt-1 text-[24px] font-bold leading-none text-[#1F1B2D] flex items-center justify-end min-h-[28px]">
                  {loading ? (
                    <Loader2 size={20} className="animate-spin text-slate-400" />
                  ) : (
                    item.value
                  )}
                </h2>
              </div>
            </div>

            <div className="mt-9 flex items-center justify-between">
              <p className="text-sm text-[#98A2B3]">{item.desc}</p>

              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: item.bg }}
              >
                <ChevronRight size={18} style={{ color: item.color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}