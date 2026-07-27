"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Info,
  RotateCcw,
  Save,
  Loader2,
  CheckCircle2,
  Package,
  Layers,
  Calculator,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface SelectedVariantData {
  variantId: string;
  weight: number | string;
  unit: string;
  sku: string;
  available_stock: number;
  price: string | number;
  mrp: string | number;
  low_stock_alert: number;
}

function UpdateStockFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Params
  const productId = searchParams.get("productId") || searchParams.get("id") || "";
  const targetVariantId = searchParams.get("variantId") || "";

  // States
  const [activeVariant, setActiveVariant] = useState<SelectedVariantData | null>(null);
  const [productMeta, setProductMeta] = useState({
    name: "Mustard Honey",
    category: "Mustard Honey",
    image: "",
  });

  // Inputs State
  const [addQuantity, setAddQuantity] = useState<string>("0");
  const [updateDate, setUpdateDate] = useState<string>(
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  );
  const [reason, setReason] = useState<string>("New Stock Arrived");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 🌐 1. FETCH PRODUCT & VARIANT DETAILS FROM STOCK LIST
  useEffect(() => {
    const loadSpecificVariant = async () => {
      if (!productId) {
        setFetching(false);
        return;
      }

      setFetching(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/stock-list`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        const data = await res.json();
        const rawItems = data.data || [];

        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const matchedProduct =
            rawItems.find(
              (item: any) =>
                item.productId === productId || item._id === productId
            ) || rawItems[0];

          if (matchedProduct) {
            let categoryName = "Honey";
            if (typeof matchedProduct.category === "string") {
              categoryName = matchedProduct.category;
            } else if (
              matchedProduct.category &&
              typeof matchedProduct.category === "object"
            ) {
              categoryName =
                matchedProduct.category.category_name ||
                matchedProduct.category.name ||
                "Honey";
            }

            let imgUrl =
              matchedProduct.image?.image_url || matchedProduct.image_url || "";
            if (
              typeof imgUrl === "string" &&
              imgUrl &&
              !imgUrl.startsWith("http") &&
              !imgUrl.startsWith("data:")
            ) {
              imgUrl = `${API_BASE_URL}/${imgUrl.replace(/^\//, "")}`;
            }

            setProductMeta({
              name: matchedProduct.product_name || "Untitled Product",
              category: categoryName,
              image: typeof imgUrl === "string" ? imgUrl : "",
            });

            const rawVars: any[] = Array.isArray(matchedProduct.variants)
              ? matchedProduct.variants
              : [];

            const matchedVariant =
              rawVars.find(
                (v: any) =>
                  v.variantId === targetVariantId || v._id === targetVariantId
              ) ||
              rawVars[0] ||
              {};

            setActiveVariant({
              variantId: matchedVariant.variantId || matchedVariant._id || targetVariantId,
              weight: matchedVariant.weight || "500",
              unit: matchedVariant.unit || "g",
              sku: matchedVariant.sku || "N/A",
              available_stock: Number(matchedVariant.available_stock ?? 0),
              price:
                matchedVariant.price !== undefined && matchedVariant.price !== null
                  ? String(matchedVariant.price)
                  : "",
              mrp:
                matchedVariant.mrp !== undefined && matchedVariant.mrp !== null
                  ? String(matchedVariant.mrp)
                  : "",
              low_stock_alert: Number(matchedVariant.low_stock_alert ?? 2),
            });
          }
        }
      } catch (err) {
        console.error("Failed to load stock list data:", err);
      } finally {
        setFetching(false);
      }
    };

    loadSpecificVariant();
  }, [productId, targetVariantId]);

  // Stock Calculations
  const currentStock = activeVariant ? Number(activeVariant.available_stock) : 0;
  const parsedAddQty = parseInt(addQuantity, 10);
  const validAddQty = !isNaN(parsedAddQty) && parsedAddQty >= 0 ? parsedAddQty : 0;
  const calculatedTotalStock = currentStock + validAddQty;

  const handleReset = () => {
    setAddQuantity("0");
    setReason("New Stock Arrived");
  };

  // 🌐 2. PUT API CALL TO UPDATE VARIANT STOCK
  const handleSaveStock = async () => {
    if (!productId || !activeVariant?.variantId) {
      showToast("Error: Product ID or Variant ID is missing!");
      return;
    }

    setLoading(true);

    try {
      // 🎯 Backend khud additive calculation kar raha hai, isiliye sirf validAddQty bhej rahe hain
      const payload = {
        price: activeVariant.price !== undefined && activeVariant.price !== null ? String(activeVariant.price) : "",
        mrp: activeVariant.mrp !== undefined && activeVariant.mrp !== null ? String(activeVariant.mrp) : "",
        updated_stock: validAddQty,
      };

      const targetUrl = `${API_BASE_URL}/api/products/${productId}/stock/${activeVariant.variantId}`;

      console.log("Submitting PUT to:", targetUrl);
      console.log("Payload:", payload);

      const res = await fetch(targetUrl, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}: Failed to update variant stock`);
      }

      showToast(`Stock updated for ${activeVariant.weight}${activeVariant.unit}!`);

      setTimeout(() => {
        router.push(
          `/inventory/complete?productId=${productId}&variantId=${activeVariant.variantId}&addedQty=${validAddQty}&prevStock=${currentStock}&newStock=${calculatedTotalStock}`
        );
      }, 500);
    } catch (err: any) {
      console.error("PUT Request Error:", err);
      showToast(err.message || "Failed to save stock update");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-2">
        <Loader2 size={32} className="animate-spin text-[#214b21]" />
        <p className="text-xs font-bold text-slate-600">Loading Variant Details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans p-4 sm:p-6 md:p-8 pb-24">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}

      <div className="max-w-[1180px] mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
              Update Stock
            </h1>
            <p className="text-xs md:text-sm text-[#64748B] font-medium mt-1">
              Add new stock to update total available quantity for this variant.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Details
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Product Meta Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 text-[#D97706]">
                  <Package size={18} />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Product Information</h3>
              </div>

              <div className="flex items-start sm:items-center gap-6">
                <div className="w-28 h-28 rounded-2xl bg-[#F8FAFC] border border-slate-100 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                  {productMeta.image ? (
                    <img
                      src={productMeta.image}
                      alt={productMeta.name}
                      className="w-full h-full object-contain rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-amber-50 flex items-center justify-center text-[#D97706] font-bold text-xs text-center p-2">
                      {productMeta.name}
                    </div>
                  )}
                </div>

                <div className="space-y-3.5 flex-1">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      PRODUCT NAME
                    </p>
                    <p className="text-base font-black text-[#0F172A] mt-0.5">
                      {productMeta.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      CATEGORY
                    </p>
                    <p className="text-xs font-bold text-slate-600 mt-0.5">
                      {productMeta.category}
                    </p>
                  </div>

                  {activeVariant && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        VARIANT / WEIGHT
                      </p>
                      <p className="text-xs font-black text-[#D97706] mt-0.5">
                        {activeVariant.weight}{activeVariant.unit}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stock Update Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-[#D97706]">
                    <Layers size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Stock Update</h3>
                </div>

                {activeVariant && (
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-amber-50 text-[#D97706]">
                    SKU: {activeVariant.sku}
                  </span>
                )}
              </div>

              {/* Current Stock Display */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Current Stock ({activeVariant ? `${activeVariant.weight}${activeVariant.unit}` : ""})
                </span>
                <span className="text-sm font-black text-[#0F172A]">
                  {currentStock} Units
                </span>
              </div>

              {/* Add Quantity Field */}
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-bold text-slate-700 shrink-0">
                  Add Stock (Units)
                </label>
                <div className="w-48">
                  <input
                    type="number"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-right text-slate-900 focus:outline-none focus:border-[#214b21]"
                  />
                  <p className="text-[10px] text-slate-400 font-medium text-right mt-1">
                    Enter quantity to add.
                  </p>
                </div>
              </div>

              {/* Total Calculated Stock Preview */}
              <div className="pt-2">
                <div className="bg-[#f0fdf4] border border-emerald-100 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-emerald-900">
                      Total Stock (After Update)
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 mt-1">
                      <CheckCircle2 size={13} />
                      <span>Automatically calculated</span>
                    </div>
                  </div>

                  <span className="text-2xl font-black text-emerald-900">
                    {calculatedTotalStock} Units
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 text-[#D97706]">
                  <Calendar size={18} />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Update Details</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Update Date</label>
                <div className="relative">
                  <input
                    type="text"
                    value={updateDate}
                    onChange={(e) => setUpdateDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#214b21]"
                  />
                  <Calendar
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Reason <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#214b21] cursor-pointer"
                  >
                    <option value="New Stock Arrived">New Stock Arrived</option>
                    <option value="Inventory Restock">Inventory Restock</option>
                    <option value="Stock Audit Adjustment">Stock Audit Adjustment</option>
                    <option value="Customer Return">Customer Return</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="bg-[#f0fdf4] border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                <Info size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px] text-emerald-800 leading-relaxed font-medium">
                  <p className="font-bold text-emerald-900">How it works</p>
                  <p>Add the new quantity received for this variant. Total stock updates automatically.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 text-[#D97706]">
                  <Calculator size={18} />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Stock Calculation</h3>
              </div>

              <div className="space-y-3 pt-1 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Current Stock</span>
                  <span className="font-bold text-slate-900">{currentStock} Units</span>
                </div>

                <div className="flex justify-between items-center text-emerald-600">
                  <span className="font-medium">Add Stock</span>
                  <span className="font-bold">+ {validAddQty} Units</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-slate-900">
                  <span className="font-bold text-sm">Total Stock</span>
                  <span className="font-black text-lg text-slate-900">
                    {calculatedTotalStock} Units
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-200/80">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-amber-200 bg-[#FFFDF7] hover:bg-amber-50 text-xs font-bold text-[#D97706] transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              Reset
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleSaveStock}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#214b21] hover:bg-[#183b18] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : (
                <Save size={16} />
              )}
              <span>Save Stock</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function UpdateStockPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#214b21]" size={32} />
        </div>
      }
    >
      <UpdateStockFormContent />
    </Suspense>
  );
}