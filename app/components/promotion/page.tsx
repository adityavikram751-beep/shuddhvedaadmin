"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Gift,
  Zap,
  Music,
  Percent,
  Sparkles,
  FileText,
} from "lucide-react";

// ================= Types Definitions =================
interface Promotion {
  id: string;
  name: string;
  description: string;
  code: string;
  type: "Percentage" | "Free Shipping" | "Fixed Amount";
  discount: string;
  validFrom: string;
  validTo: string;
  usedCount: number;
  totalLimit: number;
  status: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "DRAFT";
  iconType: "tag" | "zap" | "gift" | "music" | "sparkles" | "star";
  iconBg: string;
  iconColor: string;
}

// ================= Mock Dataset =================
const promotionsData: Promotion[] = [
  {
    id: "PROMO-1",
    name: "Summer Special Offer",
    description: "Flat 20% off on all products",
    code: "SUMMER20",
    type: "Percentage",
    discount: "20% OFF",
    validFrom: "01 Jul 2026",
    validTo: "31 Jul 2026",
    usedCount: 145,
    totalLimit: 500,
    status: "ACTIVE",
    iconType: "tag",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    id: "PROMO-2",
    name: "Free Shipping Offer",
    description: "Free shipping on orders above ₹999",
    code: "FREESHIP",
    type: "Free Shipping",
    discount: "₹0",
    validFrom: "01 Jul 2026",
    validTo: "15 Jul 2026",
    usedCount: 320,
    totalLimit: 1000,
    status: "ACTIVE",
    iconType: "zap",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    id: "PROMO-3",
    name: "Monsoon Delight",
    description: "Flat 15% off on honey products",
    code: "MONSOON15",
    type: "Percentage",
    discount: "15% OFF",
    validFrom: "16 Jul 2026",
    validTo: "31 Jul 2026",
    usedCount: 78,
    totalLimit: 400,
    status: "SCHEDULED",
    iconType: "gift",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
  },
  {
    id: "PROMO-4",
    name: "Weekend Sale",
    description: "Flat 10% off on all orders",
    code: "WEEKEND10",
    type: "Percentage",
    discount: "10% OFF",
    validFrom: "27 Jun 2026",
    validTo: "29 Jun 2026",
    usedCount: 620,
    totalLimit: 800,
    status: "EXPIRED",
    iconType: "music",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    id: "PROMO-5",
    name: "Birthday Special",
    description: "Special discount for birthday month",
    code: "BDAY25",
    type: "Percentage",
    discount: "25% OFF",
    validFrom: "01 Jul 2026",
    validTo: "31 Dec 2026",
    usedCount: 45,
    totalLimit: 200,
    status: "ACTIVE",
    iconType: "sparkles",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
  },
  {
    id: "PROMO-6",
    name: "Loyal Customer Offer",
    description: "Exclusive offer for loyal customers",
    code: "LOYAL30",
    type: "Percentage",
    discount: "30% OFF",
    validFrom: "01 Jul 2026",
    validTo: "31 Aug 2026",
    usedCount: 12,
    totalLimit: 100,
    status: "SCHEDULED",
    iconType: "star",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: "PROMO-7",
    name: "Diwali Early Bird Draft",
    description: "Festive discount draft offer",
    code: "DIWALI40",
    type: "Percentage",
    discount: "40% OFF",
    validFrom: "01 Oct 2026",
    validTo: "10 Nov 2026",
    usedCount: 0,
    totalLimit: 1000,
    status: "DRAFT",
    iconType: "tag",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
];

export default function PromotionsPage() {
  const router = useRouter();

  // State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showDraftsOnly, setShowDraftsOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Logic
  const filteredPromotions = useMemo(() => {
    return promotionsData.filter((promo) => {
      // Drafts Filter
      if (showDraftsOnly && promo.status !== "DRAFT") return false;
      if (!showDraftsOnly && promo.status === "DRAFT" && statusFilter !== "DRAFT") return false;

      // Search Match
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = promo.name.toLowerCase().includes(query);
        const matchCode = promo.code.toLowerCase().includes(query);
        if (!matchName && !matchCode) return false;
      }

      // Status Match
      if (statusFilter !== "ALL" && promo.status !== statusFilter) return false;

      // Type Match
      if (typeFilter !== "ALL" && promo.type !== typeFilter) return false;

      return true;
    });
  }, [searchQuery, statusFilter, typeFilter, showDraftsOnly]);

  // Toggle Drafts Mode
  const handleToggleDrafts = () => {
    setShowDraftsOnly((prev) => !prev);
    setCurrentPage(1);
  };

  // Reset Filters
  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setShowDraftsOnly(false);
    setCurrentPage(1);
  };

  // Helper for Promotion Icon
  const renderPromoIcon = (type: string, bg: string, color: string) => {
    return (
      <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        {type === "tag" && <Tag size={18} className={color} />}
        {type === "zap" && <Zap size={18} className={color} />}
        {type === "gift" && <Gift size={18} className={color} />}
        {type === "music" && <Music size={18} className={color} />}
        {type === "sparkles" && <Sparkles size={18} className={color} />}
        {type === "star" && <Percent size={18} className={color} />}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 text-[#0F172A] font-sans">
      <div className="max-w-[1280px] mx-auto space-y-6">

        {/* ---------------- Top Header Section ---------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
              Promotions
            </h1>
            <p className="text-sm text-[#64748B] mt-1 font-medium">
              Manage all coupons, discounts and promotional offers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 👈 Fully Working Draft Toggle / Route Button */}
            <button
              onClick={handleToggleDrafts}
              className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all shadow-xs flex items-center gap-2 ${
                showDraftsOnly
                  ? "bg-[#0F172A] text-white border-[#0F172A]"
                  : "bg-white text-[#334155] border-[#E2E8F0] hover:bg-slate-50"
              }`}
            >
              <FileText size={16} />
              <span>{showDraftsOnly ? "All Promotions" : "Draft"}</span>
            </button>

            {/* 👈 Fully Working Create Promotion Route Button */}
            <button
              onClick={() => router.push("/promotion/addpromotion")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus size={18} />
              <span>Create Promotion</span>
            </button>
          </div>
        </div>

        {/* ---------------- Top Stat Summary Cards ---------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-[#F1F5F9] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                <Tag size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">TOTAL PROMOTIONS</p>
                <h3 className="text-2xl font-black text-[#0F172A] mt-0.5">28</h3>
                <p className="text-[11px] font-medium text-[#94A3B8] mt-0.5">All Promotions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#F1F5F9] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">ACTIVE PROMOTIONS</p>
                <h3 className="text-2xl font-black text-[#0F172A] mt-0.5">15</h3>
                <p className="text-[11px] font-medium text-[#94A3B8] mt-0.5">53.6% of total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#F1F5F9] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">SCHEDULED</p>
                <h3 className="text-2xl font-black text-[#0F172A] mt-0.5">7</h3>
                <p className="text-[11px] font-medium text-[#94A3B8] mt-0.5">25.0% of total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#F1F5F9] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">EXPIRED</p>
                <h3 className="text-2xl font-black text-[#0F172A] mt-0.5">6</h3>
                <p className="text-[11px] font-medium text-[#94A3B8] mt-0.5">21.4% of total</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- Main Table Card & Controls ---------------- */}
        <div className="bg-white rounded-3xl border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 md:p-6 space-y-6">

          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search promotions or coupon codes..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D97706] transition-colors"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] focus:outline-none focus:border-[#D97706] cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="EXPIRED">Expired</option>
              <option value="DRAFT">Draft</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] focus:outline-none focus:border-[#D97706] cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="Percentage">Percentage</option>
              <option value="Free Shipping">Free Shipping</option>
            </select>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors px-2 py-2"
            >
              <RotateCw size={13} />
              <span>Clear</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-[#F8FAFC] text-[11px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                  <th className="py-3 px-4">PROMOTION NAME</th>
                  <th className="py-3 px-4">COUPON CODE</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">DISCOUNT</th>
                  <th className="py-3 px-4">VALIDITY</th>
                  <th className="py-3 px-4">USAGE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredPromotions.length > 0 ? (
                  filteredPromotions.map((promo) => {
                    const usagePercentage = Math.round((promo.usedCount / promo.totalLimit) * 100);

                    return (
                      <tr key={promo.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {renderPromoIcon(promo.iconType, promo.iconBg, promo.iconColor)}
                            <div>
                              <p className="text-xs font-extrabold text-[#0F172A] leading-snug">
                                {promo.name}
                              </p>
                              <p className="text-[11px] text-[#94A3B8] font-medium mt-0.5 max-w-[160px] truncate">
                                {promo.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-xs font-black text-emerald-600 tracking-wider">
                            {promo.code}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                              promo.type === "Free Shipping"
                                ? "bg-amber-100/70 text-amber-800"
                                : "bg-emerald-100/70 text-emerald-800"
                            }`}
                          >
                            {promo.type}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-black text-sm text-[#0F172A]">
                          {promo.discount}
                        </td>

                        <td className="py-4 px-4">
                          <div className="text-xs font-bold text-[#334155]">{promo.validFrom}</div>
                          <div className="text-[10px] text-[#94A3B8] font-medium mt-0.5">- {promo.validTo}</div>
                        </td>

                        <td className="py-4 px-4 w-[160px]">
                          <div className="flex items-center justify-between text-[11px] font-extrabold mb-1">
                            <span className="text-[#0F172A]">{promo.usedCount} / {promo.totalLimit}</span>
                            <span className="text-[#94A3B8]">{usagePercentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                promo.status === "EXPIRED"
                                  ? "bg-rose-500"
                                  : promo.status === "SCHEDULED"
                                  ? "bg-amber-500"
                                  : promo.status === "DRAFT"
                                  ? "bg-slate-400"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${
                              promo.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-700"
                                : promo.status === "SCHEDULED"
                                ? "bg-amber-100 text-amber-700"
                                : promo.status === "DRAFT"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {promo.status}
                          </span>
                        </td>

                        {/* 👈 Route to Detail View */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => router.push(`/promotion/viewpromotion`)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                            title="View Promotion Details"
                          >
                            <Eye size={16} className="text-[#94A3B8] hover:text-[#0F172A]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm font-semibold text-[#94A3B8]">
                      No promotions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#F1F5F9]">
            <p className="text-xs font-semibold text-[#64748B]">
              Showing <span className="font-bold text-[#0F172A]">1 to {filteredPromotions.length}</span> of{" "}
              <span className="font-bold text-[#0F172A]">28</span> promotions
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {[1, 2, 3, 4, 5].map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                    currentPage === pageNum ? "bg-[#D97706] text-white" : "text-[#64748B] hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-2 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}