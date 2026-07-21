"use client";

import React, { useState, useMemo } from "react";
import {
  Wallet,
  ShoppingBag,
  PackageCheck,
  TrendingUp,
  Download,
  ChevronDown,
} from "lucide-react";

// Recharts Import
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";

// ================= Mock Yearly Analytics Datasets =================
const analyticsByYear: Record<string, any> = {
  "2026": {
    kpis: {
      totalRevenue: "₹12,48,500",
      revenueGrowthPercentage: "+12.5%",
      totalOrders: "1,245",
      ordersGrowthPercentage: "+8.2%",
      productsSold: "3,860",
      productsGrowthPercentage: "+15.4%",
      growthRate: "+18.6%",
    },
    salesTrend: [
      { month: "JAN", value: 32000 },
      { month: "FEB", value: 45000 },
      { month: "MAR", value: 78000 },
      { month: "APR", value: 92000 },
      { month: "MAY", value: 61000 },
      { month: "JUN", value: 110000 },
      { month: "JUL", value: 145000 },
      { month: "AUG", value: 128000 },
      { month: "SEP", value: 162000 },
      { month: "OCT", value: 180000 },
      { month: "NOV", value: 195000 },
      { month: "DEC", value: 185000 },
    ],
    ordersOverview: [
      { month: "JAN", orders: 45 },
      { month: "FEB", orders: 60 },
      { month: "MAR", orders: 85 },
      { month: "APR", orders: 110 },
      { month: "MAY", orders: 90 },
      { month: "JUN", orders: 130 },
      { month: "JUL", orders: 165 },
      { month: "AUG", orders: 140 },
      { month: "SEP", orders: 175 },
      { month: "OCT", orders: 280, isHighlight: true },
      { month: "NOV", orders: 195 },
      { month: "DEC", orders: 190 },
    ],
  },
  "2025": {
    kpis: {
      totalRevenue: "₹10,20,000",
      revenueGrowthPercentage: "+10.1%",
      totalOrders: "1,050",
      ordersGrowthPercentage: "+6.4%",
      productsSold: "3,120",
      productsGrowthPercentage: "+11.2%",
      growthRate: "+14.2%",
    },
    salesTrend: [
      { month: "JAN", value: 28000 },
      { month: "FEB", value: 39000 },
      { month: "MAR", value: 62000 },
      { month: "APR", value: 75000 },
      { month: "MAY", value: 55000 },
      { month: "JUN", value: 90000 },
      { month: "JUL", value: 120000 },
      { month: "AUG", value: 105000 },
      { month: "SEP", value: 135000 },
      { month: "OCT", value: 150000 },
      { month: "NOV", value: 160000 },
      { month: "DEC", value: 155000 },
    ],
    ordersOverview: [
      { month: "JAN", orders: 35 },
      { month: "FEB", orders: 50 },
      { month: "MAR", orders: 70 },
      { month: "APR", orders: 95 },
      { month: "MAY", orders: 75 },
      { month: "JUN", orders: 110 },
      { month: "JUL", orders: 140 },
      { month: "AUG", orders: 120 },
      { month: "SEP", orders: 150 },
      { month: "OCT", orders: 220, isHighlight: true },
      { month: "NOV", orders: 165 },
      { month: "DEC", orders: 160 },
    ],
  },
};

// Product Performance Mock Data
const productPerformance = [
  { name: "Raw Honey 250g", revenue: "₹4,20,000", percentage: 95 },
  { name: "Wild Honey 500g", revenue: "₹3,85,000", percentage: 85 },
  { name: "Forest Honey", revenue: "₹2,10,000", percentage: 50 },
  { name: "Organic Honey", revenue: "₹1,80,000", percentage: 42 },
  { name: "Gift Box", revenue: "₹53,500", percentage: 15 },
];

// Inventory Donut Mock Data
const inventoryData = [
  { name: "In Stock", value: 248, percentage: "75%", color: "#7A5200" },
  { name: "Low Stock", value: 42, percentage: "15%", color: "#EAB308" },
  { name: "Out of Stock", value: 12, percentage: "10%", color: "#C22525" },
];

// Promotion Performance Mock Data
const promotionPerformance = [
  { code: "FESTIVE20", redemptions: "452 Redemptions", percentage: 85 },
  { code: "SUMMER10", redemptions: "215 Redemptions", percentage: 48 },
  { code: "WELCOME5", redemptions: "188 Redemptions", percentage: 40 },
  { code: "NEWUSER", redemptions: "94 Redemptions", percentage: 22 },
];

export default function ReportsAnalyticsPage() {
  const [selectedYear, setSelectedYear] = useState("2026");

  // Get active dataset
  const activeData = useMemo(() => {
    return analyticsByYear[selectedYear] || analyticsByYear["2026"];
  }, [selectedYear]);

  // Handler: CSV Exporter
  const handleExportCSV = () => {
    const headers = "Month,Revenue (₹),Orders Count\n";
    const rows = activeData.salesTrend
      .map((item: any, idx: number) => `${item.month},${item.value},${activeData.ordersOverview[idx].orders}`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Reports_Analytics_FY${selectedYear}.csv`;
    a.click();
  };

  return (
    <div className="w-full bg-[#F8FAFC] p-4 md:p-8 text-[#0F172A] font-sans pb-10">
      <div className="max-w-[1300px] mx-auto space-y-6">

        {/* ---------------- 1. Top Header Section ---------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
              Reports & Analytics
            </h1>

            {/* Year Dropdown Filter */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none pl-4 pr-9 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] focus:outline-none focus:border-[#D97706] cursor-pointer shadow-2xs"
              >
                <option value="2026">Year: 2026</option>
                <option value="2025">Year: 2025</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#64748B]">
              <span className="uppercase tracking-wider text-[10px]">ACTIVE FILTERS:</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-200/60 text-[#334155] text-[11px]">
                FY {selectedYear}
              </span>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download size={15} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* ---------------- 2. KPI Stats Summary Cards ---------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Card 1: Total Revenue */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-[#FEF3C7]/60 flex items-center justify-center text-[#D97706]">
                <Wallet size={18} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-600">
                {activeData.kpis.revenueGrowthPercentage}
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-[#64748B]">Total Revenue</p>
              <h2 className="text-2xl font-black text-[#0F172A] mt-1 tracking-tight">
                {activeData.kpis.totalRevenue}
              </h2>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-[#FEF3C7]/60 flex items-center justify-center text-[#D97706]">
                <ShoppingBag size={18} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-600">
                {activeData.kpis.ordersGrowthPercentage}
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-[#64748B]">Total Orders</p>
              <h2 className="text-2xl font-black text-[#0F172A] mt-1 tracking-tight">
                {activeData.kpis.totalOrders}
              </h2>
            </div>
          </div>

          {/* Card 3: Products Sold */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
                <PackageCheck size={18} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-600">
                {activeData.kpis.productsGrowthPercentage}
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-[#64748B]">Products Sold</p>
              <h2 className="text-2xl font-black text-[#0F172A] mt-1 tracking-tight">
                {activeData.kpis.productsSold}
              </h2>
            </div>
          </div>

          {/* Card 4: Revenue Growth (Golden Card) */}
          <div className="bg-[#D97706] text-white rounded-3xl p-6 shadow-lg space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <TrendingUp size={18} />
            </div>

            <div>
              <p className="text-xs font-bold text-amber-100">Revenue Growth</p>
              <h2 className="text-3xl font-black text-white mt-0.5 tracking-tight">
                {activeData.kpis.growthRate}
              </h2>
              <p className="text-[10px] font-extrabold text-amber-200 uppercase tracking-wider mt-1">
                COMPARED TO {Number(selectedYear) - 1} FY
              </p>
            </div>
          </div>

        </div>

        {/* ---------------- 3. Main Charts Section Grid ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">

          {/* Left: Sales Trend Area Chart */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">Sales Trend</h3>
                <p className="text-xs font-medium text-[#64748B] mt-0.5">
                  Annual revenue distribution over 12 months
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-slate-100 text-xs font-bold text-[#64748B]">
                Monthly
              </span>
            </div>

            <div className="w-full h-72 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activeData.salesTrend}
                  margin={{ top: 10, right: 15, left: 15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="amberAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 10, right: 10 }}
                    tick={{ fill: "#64748B", fontSize: 10, fontWeight: "700" }}
                  />

                  <YAxis hide />

                  {/* 🎯 Custom Styled Visible Tooltip */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderRadius: "14px",
                      border: "none",
                      boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.3)",
                      padding: "10px 14px",
                    }}
                    labelStyle={{
                      color: "#94A3B8",
                      fontSize: "11px",
                      fontWeight: "bold",
                      marginBottom: "2px",
                    }}
                    itemStyle={{
                      color: "#F59E0B",
                      fontSize: "13px",
                      fontWeight: "900",
                    }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#D97706"
                    strokeWidth={3.5}
                    fillOpacity={1}
                    fill="url(#amberAreaGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Orders Overview Bar Chart */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">Orders Overview</h3>
                <p className="text-xs font-medium text-[#64748B] mt-0.5">
                  Volume of orders processed per month
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-slate-100 text-xs font-bold text-[#64748B]">
                Monthly
              </span>
            </div>

            <div className="w-full h-72 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeData.ordersOverview}
                  margin={{ top: 10, right: 15, left: 15, bottom: 0 }}
                >
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 10, right: 10 }}
                    tick={{ fill: "#64748B", fontSize: 10, fontWeight: "700" }}
                  />

                  <YAxis hide />

                  {/* 🎯 Custom Styled Visible Tooltip */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderRadius: "14px",
                      border: "none",
                      boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.3)",
                      padding: "10px 14px",
                    }}
                    labelStyle={{
                      color: "#94A3B8",
                      fontSize: "11px",
                      fontWeight: "bold",
                      marginBottom: "2px",
                    }}
                    itemStyle={{
                      color: "#F59E0B",
                      fontSize: "13px",
                      fontWeight: "900",
                    }}
                    formatter={(value: any) => [`${value} Orders`, "Volume"]}
                  />

                  <Bar dataKey="orders" radius={[10, 10, 0, 0]}>
                    {activeData.ordersOverview.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isHighlight ? "#4A2810" : "#FFF7ED"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ---------------- 4. Product Performance & Inventory Status Grid ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">

          {/* Product Performance */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">Product Performance</h3>
                <p className="text-xs font-medium text-[#94A3B8] mt-0.5">
                  Top revenue generating products
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-[#F1F5F9] text-xs font-bold text-[#64748B]">
                Top 5
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {productPerformance.map((prod, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-[#334155]">{prod.name}</span>
                    <span className="text-[#0F172A]">{prod.revenue}</span>
                  </div>

                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7A5200] rounded-full transition-all duration-500"
                      style={{ width: `${prod.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Status */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">Inventory Status</h3>
                <p className="text-xs font-medium text-[#94A3B8] mt-0.5">
                  Real-time stock level distribution
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-[#F1F5F9] text-xs font-bold text-[#64748B]">
                Current
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 pt-2">
              <div className="relative h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {inventoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-[#0F172A]">84%</span>
                  <span className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider">OPTIMAL</span>
                </div>
              </div>

              <div className="space-y-4">
                {inventoryData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full shrink-0 mt-0.5"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="text-xs font-extrabold text-[#0F172A] leading-tight">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] font-semibold mt-0.5">
                        {item.value} items ({item.percentage})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ---------------- 5. Promotion Performance Section ---------------- */}
        <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-[#0F172A]">Promotion Performance</h3>
              <p className="text-xs font-medium text-[#94A3B8] mt-0.5">
                Coupon code usage and effectiveness
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#F1F5F9] text-xs font-bold text-[#64748B]">
              Monthly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {promotionPerformance.map((promo, idx) => (
              <div
                key={idx}
                className="bg-[#FFFBF5] border border-[#FDE68A]/60 rounded-2xl p-5 text-center space-y-3"
              >
                <div>
                  <h4 className="text-base font-black text-[#7A5200] tracking-wider">
                    {promo.code}
                  </h4>
                  <p className="text-xs font-semibold text-[#94A3B8] mt-0.5">
                    {promo.redemptions}
                  </p>
                </div>

                <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7A5200] rounded-full"
                    style={{ width: `${promo.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}