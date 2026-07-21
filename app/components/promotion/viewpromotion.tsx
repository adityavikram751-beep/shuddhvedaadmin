"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Edit3,
  PauseCircle,
  PlayCircle,
  Trash2,
  Copy,
  Check,
  MoreVertical,
  Percent,
  Clock,
  ShoppingBag,
  UserCheck,
  Tag,
  Info,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

// 📊 Recharts Import for Redemption Timeline Chart
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

// ================= Mock Data for Redemption Timeline Chart =================
const timelineData = [
  { date: "12 Jul", redemptions: 12 },
  { date: "14 Jul", redemptions: 5 },
  { date: "16 Jul", redemptions: 18 },
  { date: "18 Jul", redemptions: 22 },
  { date: "20 Jul", redemptions: 8 },
  { date: "22 Jul", redemptions: 10 },
  { date: "24 Jul", redemptions: 16 },
  { date: "26 Jul", redemptions: 11 },
  { date: "28 Jul", redemptions: 4 },
  { date: "30 Jul", redemptions: 15 },
];

export default function PromotionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const promoId = params?.id || "PROMO-1";

  // State Management
  const [copied, setCopied] = useState(false);
  const [promoStatus, setPromoStatus] = useState<"Active" | "Paused">("Active");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [timeRange, setTimeRange] = useState("Last 7 Days");

  // Copy Coupon Code Handler
  const handleCopy = () => {
    navigator.clipboard.writeText("HONEY20");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 text-[#0F172A] font-sans">
      <div className="max-w-[1280px] mx-auto space-y-6">

        {/* ---------------- Top Header ---------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A] mb-2 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Promotions
            </button>
            <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
              Promotion Details
            </h1>
            <p className="text-sm text-[#64748B] font-medium mt-0.5">
              View and manage all details of this promotion.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Edit Button */}
            <button
              onClick={() => router.push(`/promotion/addpromotion`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm font-bold text-[#334155] hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <Edit3 size={16} />
              <span>Edit Promotion</span>
            </button>

            {/* Pause / Resume Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                <span>{promoStatus === "Active" ? "Pause Promotion" : "Activate Promotion"}</span>
                <ChevronDown size={16} />
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-20 animate-in fade-in duration-150">
                  <button
                    onClick={() => {
                      setPromoStatus(promoStatus === "Active" ? "Paused" : "Active");
                      setShowStatusMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                  >
                    {promoStatus === "Active" ? (
                      <>
                        <PauseCircle size={15} className="text-amber-600" /> Pause Promotion
                      </>
                    ) : (
                      <>
                        <PlayCircle size={15} className="text-emerald-600" /> Activate Promotion
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this promotion?")) {
                        router.push("/promotion");
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} /> Delete Promotion
                  </button>
                </div>
              )}
            </div>

            {/* Three Dots Menu Button */}
            <button className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-slate-500 hover:bg-slate-50 transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* ---------------- Top Section Grid (Banner + Metadata Card) ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Promotion Banner */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-start gap-6">
            <div className="h-20 w-20 rounded-2xl bg-[#0F4C30] flex items-center justify-center shrink-0 shadow-inner">
              <Percent size={36} className="text-white" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-black text-[#0F172A]">Summer Special Offer</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    promoStatus === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {promoStatus}
                </span>
              </div>

              {/* Coupon Code Pill */}
              <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
                <span>Coupon Code</span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 font-bold text-[#0F172A]">
                  <span>HONEY20</span>
                  <button onClick={handleCopy} className="hover:text-[#D97706] transition-colors cursor-pointer" title="Copy Code">
                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {/* Offer Heading & Dates */}
              <div className="pt-2">
                <h3 className="text-2xl font-black text-[#D97706]">20% OFF</h3>
                <p className="text-xs font-semibold text-[#94A3B8] mt-1">Valid from 12 Jul 2026 to 31 Jul 2026</p>
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#64748B] flex items-center gap-2">
                <Info size={15} className="text-[#94A3B8]" /> Status
              </span>
              <span className={`font-black ${promoStatus === "Active" ? "text-emerald-600" : "text-amber-600"}`}>
                {promoStatus}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#64748B]">Created On</span>
              <span className="font-bold text-[#0F172A]">12 Jul 2026, 10:30 AM</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#64748B]">Start Date</span>
              <span className="font-bold text-[#0F172A]">12 Jul 2026, 12:00 AM</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#64748B]">End Date</span>
              <span className="font-bold text-[#0F172A]">31 Jul 2026, 11:59 PM</span>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#64748B]">Remaining Days</span>
              <span className="font-extrabold text-emerald-600">19 Days</span>
            </div>
          </div>

        </div>

        {/* ---------------- Rules & Applicable Products Grid ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Discount Rules Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <h3 className="text-base font-extrabold text-[#0F172A]">Discount Rules</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <Percent size={15} className="text-[#94A3B8]" /> Promotion Type
                </span>
                <span className="font-extrabold text-[#0F172A]">Percentage Discount</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <Tag size={15} className="text-[#94A3B8]" /> Discount
                </span>
                <span className="font-black text-[#0F172A]">20% OFF</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <ShoppingBag size={15} className="text-[#94A3B8]" /> Minimum Order Value
                </span>
                <span className="font-extrabold text-[#0F172A]">₹500</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <ShoppingBag size={15} className="text-[#94A3B8]" /> Maximum Discount
                </span>
                <span className="font-extrabold text-[#0F172A]">₹300</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <Clock size={15} className="text-[#94A3B8]" /> Usage Limit (Total)
                </span>
                <span className="font-extrabold text-[#0F172A]">500</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <UserCheck size={15} className="text-[#94A3B8]" /> Usage Limit (Per Customer)
                </span>
                <span className="font-extrabold text-[#0F172A]">1</span>
              </div>
            </div>
          </div>

          {/* Applicable Products Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0F172A]">Applicable Products (4)</h3>
              <button className="text-xs font-extrabold text-[#64748B] hover:text-[#0F172A] bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition-colors cursor-pointer">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {[
                { name: "Raw Honey 250g", sku: "SKU: RH250", status: "In Stock" },
                { name: "Raw Honey 500g", sku: "SKU: RH500", status: "In Stock" },
                { name: "Wild Honey 1kg", sku: "SKU: WH1000", status: "In Stock" },
                { name: "Premium Gift Box", sku: "SKU: PGB01", status: "In Stock" },
              ].map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/40">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#D9A74A] to-[#613D0C] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">{prod.name}</p>
                      <p className="text-[10px] text-[#94A3B8] font-semibold">{prod.sku}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100/70 text-emerald-700">
                    {prod.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ---------------- Usage Overview Card ---------------- */}
        <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <h3 className="text-base font-extrabold text-[#0F172A]">Usage Overview</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-bold text-[#94A3B8]">Total Usage</p>
              <p className="text-xl font-black text-[#0F172A] mt-1">
                <span className="text-emerald-600">145</span> / 500
              </p>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "29%" }} />
              </div>
              <p className="text-[10px] text-[#94A3B8] font-semibold mt-1">29% Used</p>
            </div>

            <div>
              <p className="text-xs font-bold text-[#94A3B8]">Remaining Uses</p>
              <p className="text-xl font-black text-[#0F172A] mt-1">
                <span className="text-amber-600">355</span> / 500
              </p>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "71%" }} />
              </div>
              <p className="text-[10px] text-[#94A3B8] font-semibold mt-1">71% Remaining</p>
            </div>

            <div className="border-l border-slate-100 pl-4">
              <p className="text-xs font-bold text-[#94A3B8]">Total Discount Given</p>
              <p className="text-2xl font-black text-[#0F172A] mt-1">₹18,450</p>
              <p className="text-[10px] text-[#94A3B8] font-semibold mt-1">Across 78 Orders</p>
            </div>

            <div className="border-l border-slate-100 pl-4">
              <p className="text-xs font-bold text-[#94A3B8]">Average Discount Per Order</p>
              <p className="text-2xl font-black text-[#0F172A] mt-1">₹236</p>
              <p className="text-[10px] text-[#94A3B8] font-semibold mt-1">Based on total usage</p>
            </div>
          </div>
        </div>

        {/* ---------------- 📊 REDEMPTION TIMELINE CHART (RECHARTS) & TOP REDEEMED PRODUCTS ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recharts Redemption Timeline Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0F172A]">Redemption Timeline</h3>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="All Time">All Time</option>
              </select>
            </div>

            {/* 📈 Recharts Dynamic Responsive Component */}
            <div className="w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: "bold" }}
                  />
                  
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: "bold" }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderRadius: "12px",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                    itemStyle={{ color: "#F59E0B" }}
                    formatter={(value: any) => [`${value} Redemptions`, "Usage"]}
                  />

                  <Area
                    type="monotone"
                    dataKey="redemptions"
                    stroke="#D97706"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#amberGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Redeemed Products Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-base font-extrabold text-[#0F172A]">Top Redeemed Products</h3>

            <div className="space-y-4 pt-2">
              {[
                { num: "1.", name: "Raw Honey 500g", uses: "68 Uses", percent: "(47%)" },
                { num: "2.", name: "Raw Honey 250g", uses: "45 Uses", percent: "(31%)" },
                { num: "3.", name: "Wild Honey 1kg", uses: "20 Uses", percent: "(14%)" },
                { num: "4.", name: "Premium Gift Box", uses: "12 Uses", percent: "(8%)" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8] font-bold">{item.num}</span>
                    <span className="font-bold text-[#0F172A]">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#0F172A]">{item.uses}</p>
                    <p className="text-[10px] text-[#94A3B8] font-semibold">{item.percent}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ---------------- Bottom Info Banner ---------------- */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold text-[#1D4ED8]">
          <Info size={18} className="shrink-0" />
          <span>This promotion is automatically applied at checkout when eligible conditions are met.</span>
        </div>

      </div>
    </div>
  );
}