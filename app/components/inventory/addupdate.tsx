"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  ChevronRight,
  ChevronDown,
  Clock,
  Check,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function UpdateStockPage() {
  const router = useRouter();

  // Current Base Stock
  const currentStock = 42;

  // --- Form States ---
  const [updateType, setUpdateType] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Calculate New Stock dynamically
  const parsedQty = parseInt(quantity, 10);
  const isValidQty = !isNaN(parsedQty) && parsedQty > 0;

  let calculatedNewStock = currentStock;
  if (isValidQty) {
    calculatedNewStock =
      updateType === "add"
        ? currentStock + parsedQty
        : Math.max(0, currentStock - parsedQty);
  }

  // --- Working Submit Handler (Redirects to Success Page) ---
  const handleUpdateStock = () => {
    if (!isValidQty) {
      showToast("Please enter a valid quantity!");
      return;
    }
    if (!reason) {
      showToast("Please select a reason!");
      return;
    }

    showToast("🚀 Stock updated successfully!");
    
    // Save updated data to localStorage so Success Page can read it
    const updatedData = {
      productName: "Raw Honey 250g",
      sku: "RH250",
      updateType: updateType === "add" ? "Add Stock" : "Remove Stock",
      quantityAdded: parsedQty,
      previousStock: currentStock,
      newStock: calculatedNewStock,
      updatedOn: "07 Jul 2026, 10:35 AM",
      updatedBy: "Admin User",
    };
    localStorage.setItem("last_stock_update", JSON.stringify(updatedData));

    // Redirect to Stock Update Success Page
    setTimeout(() => {
      router.push("/inventory/complete");
    }, 800);
  };

  // Export CSV Handler
  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Product,SKU,Current Stock,Warehouse\nRaw Honey 250g,RH250,42,Main Warehouse";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stock_update_RH250.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported stock summary!");
  };

  return (
    <div className="min-h-screen  text-slate-800 font-sans pb-16">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* BREADCRUMB & PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1">
             
              <span
                className="hover:text-slate-600 cursor-pointer"
                onClick={() => router.push("/inventory")}
              >
                Inventory
              </span>
              <ChevronRight size={12} />
              <span
                className="hover:text-slate-600 cursor-pointer"
                onClick={() => router.push("/inventory/details")}
              >
                Inventory Details
              </span>
              <ChevronRight size={12} />
              <span className="text-slate-800 font-bold">Update Stock</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Update Stock
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

        {/* 1. PRODUCT SUMMARY TOP CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
          
          {/* Product Thumbnail */}
          <div className="w-24 h-24 rounded-2xl bg-[#faf8f5] border border-slate-200/80 p-2 shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80"
              alt="Raw Honey 250g"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          {/* Product Quick Meta Info */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900">Raw Honey 250g</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e8f8ee] text-[#16a34a] text-[10px] font-extrabold tracking-wide">
                In Stock
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">SKU</p>
                <p className="font-extrabold text-slate-800 mt-0.5">RH250</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">WAREHOUSE</p>
                <p className="font-extrabold text-slate-800 mt-0.5">Main Warehouse</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">CATEGORY</p>
                <p className="font-extrabold text-slate-800 mt-0.5">Honey</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">CURRENT STOCK</p>
                <p className="font-extrabold text-slate-800 mt-0.5">{currentStock} Units</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">BATCH NO.</p>
                <p className="font-extrabold text-slate-800 mt-0.5">BATCH2507</p>
              </div>

              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">LAST UPDATED</p>
                <p className="font-extrabold text-slate-800 mt-0.5">07 Jul 2026, 10:30 AM</p>
              </div>
            </div>
          </div>

        </div>

        {/* 2. UPDATE STOCK INFORMATION FORM CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-sm font-extrabold text-slate-900">
            Update Stock Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT INPUT FIELDS (7 COLS) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Update Type (Add Stock / Remove Stock Radio) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-2">
                  Update Type <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-6">
                  {/* Add Stock Option */}
                  <label
                    onClick={() => setUpdateType("add")}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        updateType === "add"
                          ? "border-[#d9730d] bg-[#d9730d]"
                          : "border-slate-300"
                      }`}
                    >
                      {updateType === "add" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-700">Add Stock</span>
                  </label>

                  {/* Remove Stock Option */}
                  <label
                    onClick={() => setUpdateType("remove")}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        updateType === "remove"
                          ? "border-[#d9730d] bg-[#d9730d]"
                          : "border-slate-300"
                      }`}
                    >
                      {updateType === "remove" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-700">Remove Stock</span>
                  </label>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-[#d9730d]">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    min="1"
                    className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none placeholder-slate-400 bg-white"
                  />
                  <span className="px-4 py-2.5 bg-[#f7f5f2] border-l border-slate-200 text-xs font-bold text-slate-500 shrink-0">
                    Units
                  </span>
                </div>
              </div>

              {/* Reason Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#d9730d] cursor-pointer"
                  >
                    <option value="" disabled>
                      Select reason
                    </option>
                    <option value="New Production">New Production / Batch</option>
                    <option value="Stock Adjustment">Stock Audit Adjustment</option>
                    <option value="Customer Return">Customer Return</option>
                    <option value="Damaged / Expired">Damaged / Expired Stock</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Reference Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Reference <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Enter reference (e.g., PO no., Invoice no.)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#d9730d] placeholder-slate-400"
                />
              </div>

            </div>

            {/* RIGHT DISPLAY CALCULATION & NOTES (5 COLS) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* New Stock After Update Preview Box */}
              <div>
                <p className="text-[11px] font-bold text-slate-700 mb-2">
                  New Stock After Update
                </p>
                
                <div className="bg-[#fffcf7] rounded-2xl border border-amber-200/80 p-5 flex items-center justify-between text-center">
                  
                  {/* Current Base */}
                  <div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl font-black text-slate-900">{currentStock}</span>
                      <span className="text-xs font-bold text-slate-500">Units</span>
                    </div>
                    <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mt-1">
                      (CURRENT STOCK)
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="text-[#d9730d]">
                    <ArrowRight size={22} className="stroke-[2.5]" />
                  </div>

                  {/* Calculated After Update */}
                  <div>
                    {isValidQty ? (
                      <div>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-2xl font-black text-[#d9730d]">
                            {calculatedNewStock}
                          </span>
                          <span className="text-xs font-bold text-[#d9730d]">Units</span>
                        </div>
                        <p className="text-[9px] font-extrabold uppercase text-[#d9730d] tracking-wider mt-1">
                          (AFTER UPDATE)
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-slate-400">Enter quantity</p>
                        <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mt-1">
                          (AFTER UPDATE)
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Notes Textarea */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter notes about this stock update."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#d9730d] placeholder-slate-400 leading-relaxed"
                />
              </div>

            </div>

          </div>

          {/* Warehouse Info Banner */}
          <div className="bg-[#f0f7ff] border border-blue-100 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-blue-700 font-semibold">
            <Clock size={16} className="text-blue-500 shrink-0" />
            <span>Stock will be updated in Main Warehouse.</span>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm"
            >
              Cancel
            </button>

            <button
              onClick={handleUpdateStock}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Check size={15} className="stroke-[3]" />
              Update Stock
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}