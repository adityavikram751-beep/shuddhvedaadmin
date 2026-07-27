"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

// ================= Types Definitions =================
interface Promotion {
  id: string;
  code: string;
  title: string;
  type: string;
  discount: string;
  minOrderValue: string;
  maxDiscount: string;
}

const PAGE_SIZE = 8; // Exactly 8 items per page

export default function PromotionsPage() {
  const router = useRouter();

  // State Management
  const [promotionsList, setPromotionsList] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 🌐 1. FETCH ALL OFFERS FROM API
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/offers/all`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const data = await res.json();
      const rawOffers = data.data || data.offers || (Array.isArray(data) ? data : []);

      if (!Array.isArray(rawOffers)) {
        setPromotionsList([]);
        return;
      }

      // Format API Data based on exact Backend JSON Keys
      const formatted: Promotion[] = rawOffers.map((offer: any) => {
        const rawType = offer.discountType || offer.offer_type || "PERCENTAGE";
        let discountDisplay = "0% OFF";
        let typeFormatted = "Percentage";

        if (rawType === "PERCENTAGE" || rawType === "Percentage") {
          discountDisplay = `${offer.discountValue || 0}% OFF`;
          typeFormatted = "Percentage";
        } else if (rawType === "FREE_SHIPPING" || rawType === "Free Shipping") {
          discountDisplay = "FREE SHIPPING";
          typeFormatted = "Free Shipping";
        } else if (rawType === "FIXED" || rawType === "Fixed Amount") {
          discountDisplay = `₹${offer.discountValue || 0} OFF`;
          typeFormatted = "Fixed Amount";
        } else {
          discountDisplay = `${offer.discountValue || 0}`;
        }

        return {
          id: offer._id || offer.id,
          code: offer.couponCode || offer.code || "N/A",
          title: offer.title || "Offer",
          type: typeFormatted,
          discount: discountDisplay,
          minOrderValue: `₹${offer.minimumOrderAmount ?? 0}`,
          maxDiscount: offer.maximumDiscount ? `₹${offer.maximumDiscount}` : "N/A",
        };
      });

      setPromotionsList(formatted);
    } catch (err: any) {
      console.error("Error loading offers:", err);
      showToast(err.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // 🌐 2. DELETE OFFER VIA API
  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/offers/remove/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete offer");
      }

      setPromotionsList((prev) => prev.filter((p) => p.id !== id));
      showToast("Coupon deleted successfully!");
    } catch (err: any) {
      console.error("Delete Error:", err);
      showToast(err.message || "Could not delete coupon");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter Logic (Search by Coupon Code or Title)
  const filteredPromotions = useMemo(() => {
    return promotionsList.filter((promo) => {
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        return (
          promo.code.toLowerCase().includes(query) ||
          promo.title.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [promotionsList, searchQuery]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredPromotions.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedPromotions = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredPromotions.slice(start, start + PAGE_SIZE);
  }, [filteredPromotions, safePage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  // Reset Search
  const handleReset = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 text-[#0F172A] font-sans pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}

      <div className="max-w-[1280px] mx-auto space-y-6">
        {/* ---------------- Top Header Section ---------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
              Promotions (Coupons)
            </h1>
            <p className="text-xs md:text-sm text-[#64748B] mt-1 font-medium">
              Create and manage discount coupons for your store.
            </p>
          </div>

          <button
            onClick={() => router.push("/promotion/addpromotion")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs md:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            <span>Add New Coupon</span>
          </button>
        </div>

        {/* ---------------- Main Table Card ---------------- */}
        <div className="bg-white rounded-3xl border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 md:p-6 space-y-6">
          {/* Search Bar & Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by coupon code or title..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D97706] transition-colors"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
            </div>

            {searchQuery && (
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors px-3 py-2.5 rounded-xl border border-amber-100 bg-amber-50/50 cursor-pointer"
              >
                <RotateCw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-[#F8FAFC] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-5">COUPON CODE</th>
                  <th className="py-3.5 px-5">TITLE / TYPE</th>
                  <th className="py-3.5 px-5">DISCOUNT</th>
                  <th className="py-3.5 px-5">MIN. ORDER VALUE</th>
                  <th className="py-3.5 px-5 text-right">ACTIONS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <Loader2 size={24} className="animate-spin mx-auto text-[#D97706] mb-2" />
                      <p className="font-semibold text-xs">Loading coupons from server...</p>
                    </td>
                  </tr>
                ) : paginatedPromotions.length > 0 ? (
                  paginatedPromotions.map((promo) => (
                    <tr key={promo.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="inline-block px-3.5 py-1.5 rounded-xl border border-amber-200/80 bg-amber-50/60 text-xs font-black text-[#D97706] tracking-wider">
                          {promo.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="text-xs font-bold text-[#0F172A]">{promo.title}</div>
                        <div className="text-[10px] text-[#94A3B8] font-semibold mt-0.5">{promo.type}</div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="text-sm font-black text-[#0F172A]">{promo.discount}</div>
                        {promo.maxDiscount !== "N/A" && (
                          <div className="text-[10px] text-slate-400 font-medium">Max: {promo.maxDiscount}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-sm font-bold text-[#334155]">
                        {promo.minOrderValue}
                      </td>

                      {/* Delete Action Button */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            disabled={deletingId === promo.id}
                            onClick={() => handleDelete(promo.id, promo.code)}
                            className="p-2 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-100 hover:border-red-200 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Delete Coupon"
                          >
                            {deletingId === promo.id ? (
                              <Loader2 size={14} className="animate-spin text-red-500" />
                            ) : (
                              <Trash2 size={14} className="text-red-500 hover:text-red-700" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs font-semibold text-[#94A3B8]">
                      No promotions found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs font-semibold text-[#64748B]">
              Showing{" "}
              <span className="font-bold text-[#0F172A]">
                {filteredPromotions.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(safePage * PAGE_SIZE, filteredPromotions.length)}
              </span>{" "}
              of <span className="font-bold text-[#0F172A]">{filteredPromotions.length}</span> coupons
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
                className="p-2 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    safePage === pageNum ? "bg-[#D97706] text-white" : "text-[#64748B] hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
                className="p-2 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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