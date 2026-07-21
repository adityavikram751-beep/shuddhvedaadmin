"use client";

import { useState } from "react";
import {
  Plus,
  ShoppingBag,
  Box,
  Tag,
  Monitor,
  Settings,
  ChevronDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

/* ---------------- Quick Actions ---------------- */

const actions = [
  { label: "Add Product", icon: Plus, color: "#FF7A00", bg: "#FFF1E0" },
  { label: "Orders", icon: ShoppingBag, color: "#FF7A00", bg: "#FFF1E0" },
  { label: "Inventory", icon: Box, color: "#22C55E", bg: "#E9FBF0" },
  { label: "Promotions", icon: Tag, color: "#A855F7", bg: "#F5EEFF" },
  { label: "Website Content", icon: Monitor, color: "#3B82F6", bg: "#EAF2FF" },
  { label: "Settings", icon: Settings, color: "#6B7280", bg: "#F2F3F5" },
];

export function QuickActions() {
  return (
    <div className=" mt-8 rounded-[22px] bg-white border border-[#F1F1F1] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-7 py-6 h-full">
      <h2 className="text-[20px] font-bold text-[#1F1B2D] mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-3 gap-x-4 gap-y-6">
        {actions.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              className="flex flex-col items-center gap-2.5 group"
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                style={{ background: item.bg }}
              >
                <Icon size={24} strokeWidth={2} style={{ color: item.color }} />
              </div>
              <span className="text-[13px] font-semibold text-[#3A3550] text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Orders Overview ---------------- */

const orderData = [
  { date: "May 31", label: "May 31, 2025", orders: 14 },
  { date: "Jun 1", label: "Jun 1, 2025", orders: 17 },
  { date: "Jun 2", label: "Jun 2, 2025", orders: 11 },
  { date: "Jun 3", label: "Jun 3, 2025", orders: 15 },
  { date: "Jun 4", label: "Jun 4, 2025", orders: 28 },
  { date: "Jun 5", label: "Jun 5, 2025", orders: 25 },
  { date: "Jun 6", label: "Jun 6, 2025", orders: 17 },
];

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="rounded-xl bg-white shadow-lg border border-gray-100 px-4 py-3">
        <p className="text-xs text-gray-400 mb-1">{point.label}</p>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
          <span className="h-2 w-2 rounded-full bg-[#F5A623]" />
          Orders: {point.orders}
        </div>
      </div>
    );
  }
  return null;
}

export function OrdersOverview() {
  const [range, setRange] = useState("Last 7 Days");

  return (
    <div className=" mt-8 rounded-[22px] bg-white border border-[#F1F1F1] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-7 py-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-bold text-[#1F1B2D]">
          Orders Overview
        </h2>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium">
          {range}
          <ChevronDown size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={orderData}
            margin={{ top: 30, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F5A623" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#F5A623" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#F0F0F0" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#B0B4BC", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, 40]}
              ticks={[10, 20, 30, 40]}
              tick={{ fill: "#B0B4BC", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="none"
              fill="url(#ordersFill)"
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#F5A623"
              strokeWidth={3}
              dot={{ r: 5, fill: "#F5A623", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#F5A623", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------------- Combined layout (as in the reference screenshot) ---------------- */

export default function DashboardWidgets() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
      <OrdersOverview />
      <QuickActions />
    </div>
  );
}