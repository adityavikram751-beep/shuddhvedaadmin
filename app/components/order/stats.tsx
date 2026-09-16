"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  ShoppingCart,
  FileText,
  TriangleAlert,
  ChevronRight,
  ArrowUp,
} from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  subtext: string;
  subtextColor?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  chevronBg: string;
  chevronColor: string;
  trend?: string;
  route: string; // Added route property
}

const stats: StatCard[] = [
  {
    label: "Processing Order",
    value: "8",
    subtext: "Across all categories",
    icon: Box,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    chevronBg: "bg-orange-50",
    chevronColor: "text-orange-500",
    route: "/order/process",
  },
  {
    label: "PACKED",
    value: "6",
    subtext: "Ready to Ship",
    icon: ShoppingCart,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    chevronBg: "bg-emerald-50",
    chevronColor: "text-emerald-500",
    route: "/order/packed",
  },
  {
    label: "Shiped Order",
    value: "₹8,450",
    subtext: "18.6% from yesterday",
    subtextColor: "text-emerald-500",
    trend: "up",
    icon: FileText,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    chevronBg: "bg-purple-50",
    chevronColor: "text-purple-500",
    route: "/dashboard/shipped",
  },
  {
    label: "DELIVERED",
    value: "2",
    subtext: "Need attention",
    icon: TriangleAlert,
    iconBg: "bg-red-50",
    iconColor: "text-red-400",
    chevronBg: "bg-red-50",
    chevronColor: "text-red-400",
    route: "/order/delivered",
  },
];

export default function OrderStats() {
  const router = useRouter();

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
          route,
        }) => (
          <div
            key={label}
            onClick={() => router.push(route)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-3.5 sm:p-4 md:p-5 flex flex-col justify-between min-h-[135px] cursor-pointer group min-w-0 w-full"
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
                  {value}
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
              <button
                type="button"
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${chevronBg} group-hover:translate-x-0.5 transition shrink-0`}
                aria-label={`View ${label}`}
              >
                <ChevronRight size={14} className={chevronColor} />
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}