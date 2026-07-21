"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Clock,
  Plus,
  RotateCcw,
  History,
  ArrowLeft,
} from "lucide-react";

export default function StockUpdateSuccessPage() {
  const router = useRouter();

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-16">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-8 space-y-6">
        
        {/* 1. TOP GREEN SUCCESS BANNER CARD */}
        <div className="bg-[#f2fcf6] border border-emerald-100 rounded-3xl p-8 sm:p-10 text-center shadow-sm space-y-3">
          {/* Big Green Circle Check Icon */}
          <div className="w-14 h-14 rounded-full bg-[#22c55e] text-white flex items-center justify-center mx-auto shadow-md">
            <Check size={30} className="stroke-[3]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Stock Updated Successfully!
          </h1>
          <p className="text-xs font-semibold text-slate-400">
            The stock information has been updated.
          </p>
        </div>

        {/* 2. PRODUCT DETAILS CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
          
          {/* Product Thumbnail */}
          <div className="w-28 h-28 rounded-2xl bg-[#faf8f5] border border-slate-200/80 p-2 shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80"
              alt="Raw Honey 250g"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          {/* Metadata Grid */}
          <div className="flex-1 space-y-4 w-full">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900">Raw Honey 250g</h2>
              <span className="px-2.5 py-0.5 rounded-md bg-[#e8f8ee] text-[#16a34a] text-[10px] font-extrabold tracking-wide uppercase">
                IN STOCK
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SKU</p>
                <p className="font-extrabold text-slate-800 mt-0.5">RH250</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WAREHOUSE</p>
                <p className="font-extrabold text-slate-800 mt-0.5">Main Warehouse</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CATEGORY</p>
                <p className="font-extrabold text-slate-800 mt-0.5">Honey</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPDATED STOCK</p>
                <p className="font-black text-[#16a34a] text-sm mt-0.5">58 Units</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BATCH NO.</p>
                <p className="font-extrabold text-slate-800 mt-0.5">BATCH2507</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPDATED ON</p>
                <p className="font-extrabold text-slate-800 mt-0.5">07 Jul 2026, 10:35 AM</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPDATED BY</p>
                <p className="font-extrabold text-slate-800 mt-0.5">Admin User</p>
              </div>
            </div>
          </div>

        </div>

        {/* 3. UPDATE SUMMARY SECTION */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900">
            Update Summary
          </h2>

          {/* 4 Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Update Type */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  UPDATE TYPE
                </p>
                <p className="text-sm font-black text-slate-900">Add Stock</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#e8f8ee] text-[#16a34a] flex items-center justify-center shrink-0">
                <Plus size={16} className="stroke-[3]" />
              </div>
            </div>

            {/* Card 2: Quantity Added */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                QUANTITY ADDED
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#16a34a]">+16</span>
                <span className="text-xs font-bold text-slate-500">Units</span>
              </div>
            </div>

            {/* Card 3: Previous Stock */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PREVIOUS STOCK
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">42</span>
                <span className="text-xs font-bold text-slate-500">Units</span>
              </div>
            </div>

            {/* Card 4: New Stock */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                NEW STOCK
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#16a34a]">58</span>
                <span className="text-xs font-bold text-slate-500">Units</span>
              </div>
            </div>

          </div>
        </div>

        {/* 4. STOCK REFLECTION INFO BANNER */}
        <div className="bg-[#f2fcf6] border border-emerald-200/60 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-800 font-semibold shadow-sm">
          <Clock size={16} className="text-[#16a34a] shrink-0" />
          <span>Stock will be reflected in inventory and available for sale.</span>
        </div>

        {/* 5. BOTTOM ACTION FOOTER BAR */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Left Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* View Stock History Button (Redirects to /inventory/addupdate) */}
            <button
              onClick={() => router.push("/inventory/addupdate")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              <History size={14} className="text-slate-500" />
              View Stock History
            </button>

            {/* Update Again Button (Redirects to /inventory/addupdate) */}
            <button
              onClick={() => router.push("/inventory/addupdate")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              <RotateCcw size={14} className="text-slate-500" />
              Update Again
            </button>
          </div>

          {/* Right Action Button */}
          <button
            onClick={() => router.push("/inventory")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft size={15} />
            Back to Inventory
          </button>

        </div>

      </div>
    </div>
  );
}