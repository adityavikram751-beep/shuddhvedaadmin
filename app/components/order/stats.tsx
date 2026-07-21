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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between min-h-[150px] cursor-pointer group"
          >
            {/* Top row: icon + label/value */}
            <div className="flex items-start justify-between">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-105 transition-transform`}
              >
                <Icon size={20} className={iconColor} strokeWidth={2} />
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {value}
                </p>
              </div>
            </div>

            {/* Bottom row: subtext + chevron button */}
            <div className="flex items-center justify-between mt-4">
              <p
                className={`text-xs flex items-center gap-1 ${
                  subtextColor ?? "text-gray-400"
                }`}
              >
                {trend === "up" && <ArrowUp size={12} strokeWidth={3} />}
                {subtext}
              </p>
              <button
                type="button"
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${chevronBg} group-hover:translate-x-0.5 transition`}
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