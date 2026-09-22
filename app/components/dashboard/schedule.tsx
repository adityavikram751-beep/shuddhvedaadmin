"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/auth";
import {
  Plus,
  ShoppingBag,
  Box,
  Tag,
  Monitor,
  Settings,
  ChevronDown,
  Calendar,
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
  { label: "Add Product", href: "/product/addproduct", icon: Plus, color: "#FF7A00", bg: "#FFF1E0" },
  { label: "Orders", href: "/order", icon: ShoppingBag, color: "#FF7A00", bg: "#FFF1E0" },
  { label: "Inventory", href: "/inventory", icon: Box, color: "#22C55E", bg: "#E9FBF0" },
  { label: "Promotions", href: "/promotion", icon: Tag, color: "#A855F7", bg: "#F5EEFF" },
  { label: "Website Content", href: "/website-content", icon: Monitor, color: "#3B82F6", bg: "#EAF2FF" },
  { label: "Settings", href: "/settings", icon: Settings, color: "#6B7280", bg: "#F2F3F5" },
];

export function QuickActions() {
  return (
    <div className=" mt-8 rounded-[22px] bg-[#FFFFFF] border border-[#F1F1F1] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-7 py-6 h-full">
      <h2 className="text-[20px] font-bold text-[#1F1B2D] mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-3 gap-x-4 gap-y-6">
        {actions.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={i}
              href={item.href}
              className="flex flex-col items-center gap-2.5 group cursor-pointer"
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Orders Overview ---------------- */

const defaultOrderData = [
  { date: "May 31", label: "May 31, 2025", orders: 14 },
  { date: "Jun 1", label: "Jun 1, 2025", orders: 17 },
  { date: "Jun 2", label: "Jun 2, 2025", orders: 11 },
  { date: "Jun 3", label: "Jun 3, 2025", orders: 15 },
  { date: "Jun 4", label: "Jun 4, 2025", orders: 28 },
  { date: "Jun 5", label: "Jun 5, 2025", orders: 25 },
  { date: "Jun 6", label: "Jun 6, 2025", orders: 17 },
];

interface OrderChartPoint {
  date: string;
  label: string;
  orders: number;
}

function parseOrderPerWeekData(data: any): OrderChartPoint[] {
  if (!data) return [];

  let list: any[] = [];
  if (Array.isArray(data?.data?.dailyOrders)) {
    list = data.data.dailyOrders;
  } else if (Array.isArray(data?.dailyOrders)) {
    list = data.dailyOrders;
  } else if (Array.isArray(data)) {
    list = data;
  } else if (Array.isArray(data?.data)) {
    list = data.data;
  } else if (Array.isArray(data?.orders)) {
    list = data.orders;
  } else if (Array.isArray(data?.orderPerWeek)) {
    list = data.orderPerWeek;
  } else if (Array.isArray(data?.ordersPerWeek)) {
    list = data.ordersPerWeek;
  } else if (Array.isArray(data?.result)) {
    list = data.result;
  } else if (data?.data && typeof data.data === "object") {
    list = Object.entries(data.data)
      .filter(([k]) => !["selectedDate", "period", "totalOrders", "dailyOrders"].includes(k))
      .map(([key, val]) => ({ date: key, count: val }));
  }

  if (!list.length) return [];

  return list.map((item: any, idx: number) => {
    const rawDate =
      item.date ||
      item.day ||
      item._id ||
      item.week ||
      item.label ||
      item.createdAt ||
      item.created_at ||
      `Day ${idx + 1}`;

    const rawCount =
      item.orders !== undefined
        ? item.orders
        : item.count !== undefined
        ? item.count
        : item.totalOrders !== undefined
        ? item.totalOrders
        : item.total !== undefined
        ? item.total
        : item.quantity !== undefined
        ? item.quantity
        : typeof item === "number"
        ? item
        : 0;

    const countNum = Number(rawCount) || 0;

    let displayDate = String(rawDate);
    let displayLabel = String(rawDate);

    if (typeof rawDate === "string" && rawDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [y, m, d] = rawDate.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      displayDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      displayLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } else {
      const dObj = new Date(rawDate);
      if (!isNaN(dObj.getTime())) {
        displayDate = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        displayLabel = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
    }

    return {
      date: displayDate,
      label: displayLabel,
      orders: countNum,
    };
  });
}

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

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function OrdersOverview() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const [chartData, setChartData] = useState<OrderChartPoint[]>(defaultOrderData);
  const [loading, setLoading] = useState(false);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [periodInfo, setPeriodInfo] = useState<{ startDate?: string; endDate?: string } | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDateClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        try {
          dateInputRef.current.showPicker();
        } catch {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const fetchOrdersOverview = async (dateParam: string) => {
    setLoading(true);
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

      const url = `${API_BASE_URL}/api/admin/order-dashboard/order-per-week?date=${encodeURIComponent(dateParam)}`;

      const res = await fetch(url, {
        credentials: "include",
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        const parsed = parseOrderPerWeekData(json);
        if (parsed && parsed.length > 0) {
          setChartData(parsed);
        }
        if (typeof json?.data?.totalOrders === "number") {
          setTotalOrders(json.data.totalOrders);
        } else if (typeof json?.totalOrders === "number") {
          setTotalOrders(json.totalOrders);
        }
        if (json?.data?.period) {
          setPeriodInfo(json.data.period);
        }
      }
    } catch (err) {
      console.error("Failed to fetch order per week data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersOverview(selectedDate);
  }, [selectedDate]);

  const maxOrders = Math.max(...chartData.map((d) => d.orders), 10);
  const yMax = Math.ceil((maxOrders + 5) / 10) * 10;
  const yTicks = [
    Math.round(yMax * 0.25),
    Math.round(yMax * 0.5),
    Math.round(yMax * 0.75),
    yMax,
  ];

  const getFormattedDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${m}/${d}/${y}`;
    }
    return dateStr;
  };

  return (
    <div className=" mt-8 rounded-[22px] bg-white border border-[#F1F1F1] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-7 py-6 h-full relative">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#1F1B2D]">
            Orders Overview
          </h2>
          {periodInfo?.startDate && periodInfo?.endDate && (
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Period: {periodInfo.startDate} to {periodInfo.endDate}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {totalOrders !== null && (
            <span className="text-xs font-semibold px-2.5 py-1 bg-orange-50 text-[#FF7A00] rounded-lg border border-orange-100">
              Total: {totalOrders}
            </span>
          )}
          <div
            onClick={handleDateClick}
            className="relative group flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm hover:border-[#FF7A00] hover:bg-orange-50/20 transition-all cursor-pointer"
          >
            <Calendar size={15} className="text-gray-400 group-hover:text-[#FF7A00] transition-colors" />
            <span className="tracking-wide text-gray-800">{getFormattedDisplayDate(selectedDate)}</span>
            <ChevronDown size={15} className="text-gray-400 group-hover:text-gray-600 transition-colors ml-0.5" />

            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
          </div>
        </div>
      </div>

      <div className="h-[260px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
            <div className="flex items-center gap-2 px-4 py-2 bg-white shadow-md rounded-full text-xs font-semibold text-[#FF7A00] border border-orange-100">
              <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-ping" />
              Loading chart...
            </div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
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
              domain={[0, yMax]}
              ticks={yTicks}
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