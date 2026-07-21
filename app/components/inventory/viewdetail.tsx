"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Box,
  Lock,
  Trash2,
  Bell,
  History,
  Pencil,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface ActivityItem {
  id: string;
  change: string; // "+50" or "-4"
  type: "added" | "deducted";
  title: string;
  subtitle: string;
  dateTime: string;
  modifiedBy: string;
}

export default function InventoryDetailPage() {
  const router = useRouter();

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Mock Stock Activities (Exact Screenshot Data)
  const activities: ActivityItem[] = [
    {
      id: "act1",
      change: "+50",
      type: "added",
      title: "New Production",
      subtitle: "Stock Added",
      dateTime: "07 Jul 2026, 09:15 AM",
      modifiedBy: "Admin User",
    },
    {
      id: "act2",
      change: "-4",
      type: "deducted",
      title: "Customer Order",
      subtitle: "Stock Deducted",
      dateTime: "07 Jul 2026, 11:20 AM",
      modifiedBy: "System",
    },
    {
      id: "act3",
      change: "-2",
      type: "deducted",
      title: "Damaged",
      subtitle: "Stock Deducted",
      dateTime: "06 Jul 2026, 04:45 PM",
      modifiedBy: "Admin User",
    },
  ];

  // Export CSV Handler
  const handleExport = () => {
    const csvData =
      "Field,Value\nProduct Name,Raw Honey 250g\nSKU,RH250\nCategory,Honey\nAvailable Stock,42 Units\nReserved Stock,6 Units\nDamaged Stock,1 Units\nReorder Level,10 Units";
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_detail_RH250.csv";
    a.click();
    showToast("Inventory Details exported!");
  };

  return (
    <div className="min-h-screen  text-slate-800 font-sans pb-12">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* BREADCRUMB & HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1">
              <span className="hover:text-slate-600 cursor-pointer" onClick={() => router.push("/inventory")}>
                Inventory
              </span>
              <ChevronRight size={12} />
              <span className="text-slate-800 font-bold">Inventory Details</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Inventory DETAIL
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Manage stock levels and inventory for all products.
            </p>
          </div>

          <div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm"
            >
              <Download size={14} className="text-slate-500" />
              Export
            </button>
          </div>
        </div>

        {/* 1. TOP METRIC CARDS (4 CARDS GRID) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Available Stock */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400">Available Stock</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">42</span>
                <span className="text-xs font-bold text-slate-400">Units</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <Box size={20} />
            </div>
          </div>

          {/* Reserved Stock */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400">Reserved Stock</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">6</span>
                <span className="text-xs font-bold text-slate-400">Units</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Lock size={18} />
            </div>
          </div>

          {/* Damaged Stock */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400">Damaged Stock</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">1</span>
                <span className="text-xs font-bold text-slate-400">Units</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <Trash2 size={18} />
            </div>
          </div>

          {/* Reorder Level */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400">Reorder Level</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">10</span>
                <span className="text-xs font-bold text-slate-400">Units</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <Bell size={18} />
            </div>
          </div>

        </div>

        {/* 2. PRODUCT INFO & CURRENT STOCK OVERVIEW (2 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PRODUCT DETAILS CARD (LEFT - 8 COLS) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-start">
            {/* Product Image */}
            <div className="w-36 h-36 rounded-2xl bg-[#faf8f5] border border-slate-200 p-2 shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80"
                alt="Raw Honey 250g"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            {/* Fields Grid */}
            <div className="flex-1 space-y-5 w-full">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-900">Raw Honey 250g</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#e8f8ee] text-[#16a34a] text-[10px] font-extrabold tracking-wide">
                  • IN STOCK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">SKU</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">RH250</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">CATEGORY</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">Honey</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">WEIGHT</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">250g</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">PRODUCT TYPE</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">Single Product</p>
                </div>

                <div className="col-span-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">WAREHOUSE</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">Main Warehouse</p>
                </div>
              </div>
            </div>
          </div>

          {/* CURRENT STOCK CARD (RIGHT - 4 COLS) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400">Current Stock</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-slate-900">42</span>
                <span className="text-sm font-bold text-slate-500">Units</span>
              </div>
              <div className="mt-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#e8f8ee] text-[#16a34a] text-[10px] font-extrabold tracking-wide">
                  • IN STOCK
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Last Updated</span>
                <span className="font-extrabold text-slate-800">07 Jul 2026, 10:30 AM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Updated By</span>
                <span className="font-extrabold text-slate-800">Admin User</span>
              </div>
            </div>
          </div>

        </div>

        {/* 3. RECENT STOCK ACTIVITY SECTION */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900">
            Recent Stock Activity
          </h2>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-[#f7f5f2] border-b border-slate-200/60 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-6">ACTIVITY</th>
                    <th className="py-3.5 px-6">DATE &amp; TIME</th>
                    <th className="py-3.5 px-6 text-right">MODIFIED BY</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                  {activities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Activity & Change Badge */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-9 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                              act.type === "added"
                                ? "bg-[#e8f8ee] text-[#16a34a]"
                                : "bg-[#fde8e8] text-[#dc2626]"
                            }`}
                          >
                            {act.change}
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-800 text-xs">
                              {act.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {act.subtitle}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-6 text-slate-600 font-semibold">
                        {act.dateTime}
                      </td>

                      {/* Modified By */}
                      <td className="py-4 px-6 text-right text-slate-500 font-bold">
                        {act.modifiedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM ACTION BAR (Exact Matches Screenshot) */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => showToast("Stock History modal opened!")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
          >
            <History size={14} className="text-slate-500" />
            View Stock History
          </button>

          <button
            onClick={() => router.push("/inventory/addupdate")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm"
          >
            <Pencil size={14} />
            Update Stock
          </button>
        </div>

      </div>
    </div>
  );
}