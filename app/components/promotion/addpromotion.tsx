"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, Save, Loader2, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

function CouponForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id"); // Checks if it's Edit Mode

  const isEditMode = Boolean(editId);

  // ---------- Form States ----------
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");

  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Auto-fill values if editing an existing coupon
  useEffect(() => {
    if (editId) {
      const fetchOfferDetails = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/offers/${editId}`, {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            const offer = data.data || data;
            setTitle(offer.title || "");
            setCode(offer.couponCode || "");
            setMinOrderAmount(offer.minimumOrderAmount ? String(offer.minimumOrderAmount) : "");
            
            // Format discount type string
            if (offer.discountType === "PERCENTAGE") setDiscountType("Percentage");
            else if (offer.discountType === "FREE_SHIPPING") setDiscountType("Free Shipping");
            else if (offer.discountType === "FIXED") setDiscountType("Fixed Amount");

            setDiscountValue(offer.discountValue ? String(offer.discountValue) : "");
            setMaxDiscount(offer.maximumDiscount ? String(offer.maximumDiscount) : "");
          }
        } catch (err) {
          console.error("Failed to fetch offer details:", err);
        }
      };

      fetchOfferDetails();
    }
  }, [editId]);

  // Handle Form Submission (API Call)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !code.trim() || !minOrderAmount) {
      showToast("Please fill in all required fields!");
      return;
    }

    // Convert UI type string to backend Enum
    let mappedDiscountType = "PERCENTAGE";
    if (discountType === "Percentage") mappedDiscountType = "PERCENTAGE";
    else if (discountType === "Free Shipping") mappedDiscountType = "FREE_SHIPPING";
    else if (discountType === "Fixed Amount") mappedDiscountType = "FIXED";

    const payload = {
      title: title.trim(),
      couponCode: code.trim().toUpperCase(),
      minimumOrderAmount: Number(minOrderAmount),
      discountType: mappedDiscountType,
      discountValue: Number(discountValue || 0),
      maximumDiscount: maxDiscount ? Number(maxDiscount) : null,
    };

    setLoading(true);

    try {
      // POST API for Add / PUT API for Edit
      const endpoint = isEditMode
        ? `${API_BASE_URL}/api/offers/update/${editId}`
        : `${API_BASE_URL}/api/offers/add`;

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save coupon");
      }

      showToast(isEditMode ? "Coupon updated successfully!" : "Coupon created successfully!");

      setTimeout(() => {
        router.push("/promotion");
      }, 800);
    } catch (err: any) {
      console.error("API Error:", err);
      showToast(err.message || "Something went wrong while saving coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans p-4 sm:p-6 md:p-8 pb-20">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}

      <div className="max-w-[1100px] mx-auto space-y-6">

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
              {isEditMode ? "Edit Coupon" : "Add New Coupon"}
            </h1>
            <p className="text-xs md:text-sm text-[#64748B] font-medium mt-1">
              {isEditMode
                ? `Update coupon details for ID: ${editId}`
                : "Create a new coupon to offer discounts to your customers."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Coupons
          </button>
        </div>

        {/* MAIN FORM CARD */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">

          {/* ROW 1: Title & Coupon Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter coupon title"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1e3a1e]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">
                Coupon Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code (e.g. SUMMER10)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-medium uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1e3a1e]"
                required
              />
            </div>
          </div>

          {/* ROW 2: Minimum Order Amount */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">
              Minimum Order Amount <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-[#1e3a1e]">
              <span className="px-4 py-3 bg-[#FAFAFA] border-r border-slate-200 text-xs font-bold text-slate-400 shrink-0">
                ₹
              </span>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="Enter minimum order amount"
                className="w-full px-4 py-3 text-xs font-medium text-slate-900 bg-white focus:outline-none placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          {/* ROW 3: Discount Type & Discount Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">
                Discount Type <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#1e3a1e] cursor-pointer"
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed Amount">Fixed Amount</option>
                  <option value="Free Shipping">Free Shipping</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">
                Discount Value {discountType !== "Free Shipping" && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="Enter discount value"
                disabled={discountType === "Free Shipping"}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1e3a1e] disabled:bg-slate-100 disabled:opacity-60"
              />
            </div>
          </div>

          {/* ROW 4: Maximum Discount */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">
              Maximum Discount <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-[#1e3a1e]">
              <span className="px-4 py-3 bg-[#FAFAFA] border-r border-slate-200 text-xs font-bold text-slate-400 shrink-0">
                ₹
              </span>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="Enter maximum discount cap"
                className="w-full px-4 py-3 text-xs font-medium text-slate-900 bg-white focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1e3a1e] hover:bg-[#152e15] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : (
                <Save size={16} />
              )}
              <span>{isEditMode ? "Update Coupon" : "Save Coupon"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default function CreateOrEditCouponPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-600" size={32} />
        </div>
      }
    >
      <CouponForm />
    </Suspense>
  );
}