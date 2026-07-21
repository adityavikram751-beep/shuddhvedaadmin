"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  BadgeIndianRupee,
  TriangleAlert,
  ChevronRight,
} from "lucide-react";

const cards = [
  {
    title: "Total Order",
    value: "8",
    desc: "Across all categories",
    icon: Package,
    color: "#FF7A00",
    bg: "#FFF4EB",
    route: "/dashboard/viewall", // Route 1
  },
  {
    title: "Pending Orders",
    value: "6",
    desc: "Awaiting processing",
    icon: ShoppingCart,
    color: "#22C55E",
    bg: "#ECFDF3",
    route: "/dashboard/pending", // Route 2
  },
  {
    title: "Shiped Order",
    value: "₹8,450",
    desc: "18.6% from yesterday",
    icon: BadgeIndianRupee,
    color: "#A855F7",
    bg: "#F5EEFF",
    growth: true,
    route: "/dashboard/shipped", // Route 3
  },
  {
    title: "Low Stock",
    value: "2",
    desc: "Need attention",
    icon: TriangleAlert,
    color: "#EF4444",
    bg: "#FEF2F2",
    route: "/dashboard/lowstock", // Route 4
  },
];

export default function DashboardCards() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((item, i) => {
        const Icon = item.icon;

        return (
          <div
            key={i}
            onClick={() => router.push(item.route)}
            className="cursor-pointer rounded-[22px] border border-[#F1F1F1] bg-white px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-slate-300 transition-all group"
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
                  {item.value}
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
                className="flex h-8 w-8 items-center justify-center rounded-xl group-hover:translate-x-1 transition-transform"
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