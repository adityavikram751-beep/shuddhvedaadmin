"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Loader2,
  Package,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface CompleteProductDetails {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  category: string;
  batchNo: string;
  weight: string;
  warehouse: string;
  currentStock: number;
  addedQty: number;
  previousStock: number;
  stockStatus: string;
  updatedOn: string;
  updatedBy: string;
  image: string;
}

function StockUpdateCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read params from URL
  const productId = searchParams.get("productId") || searchParams.get("id") || "";
  const variantId = searchParams.get("variantId") || "";
  const urlAddedQty = Number(searchParams.get("addedQty") || 0);
  const urlPrevStock = searchParams.get("prevStock");
  const urlNewStock = searchParams.get("newStock");

  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [details, setDetails] = useState<CompleteProductDetails | null>(null);
  const [countdown, setCountdown] = useState(5);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ⏱️ AUTOMATIC REDIRECT TIMER (5 SECONDS) TO INVENTORY TABLE
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/inventory");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  // 🌐 FETCH UPDATED DATA FROM LIVE STOCK LIST API
  useEffect(() => {
    const fetchUpdatedProductDetails = async () => {
      setLoading(true);
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
          const matchedItem =
            rawItems.find(
              (item: any) => item.productId === productId || item._id === productId
            ) || rawItems[0];

          const matchedVariant =
            matchedItem.variants?.find(
              (v: any) => v.variantId === variantId || v._id === variantId
            ) ||
            matchedItem.variants?.[0] ||
            {};

          const currentStockNum =
            urlNewStock !== null
              ? Number(urlNewStock)
              : Number(matchedVariant.available_stock ?? matchedItem.total_stock ?? 0);

          const previousStockNum =
            urlPrevStock !== null
              ? Number(urlPrevStock)
              : Math.max(0, currentStockNum - urlAddedQty);

          let categoryName = "Honey";
          if (typeof matchedItem.category === "string") {
            categoryName = matchedItem.category;
          } else if (matchedItem.category && typeof matchedItem.category === "object") {
            categoryName = matchedItem.category.category_name || "Honey";
          }

          let imgUrl = matchedItem.image?.image_url || matchedItem.image_url || "";
          if (
            typeof imgUrl === "string" &&
            imgUrl &&
            !imgUrl.startsWith("http") &&
            !imgUrl.startsWith("data:")
          ) {
            imgUrl = `${API_BASE_URL}/${imgUrl.replace(/^\//, "")}`;
          }

          const now = new Date();
          const formattedDateTime = now.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          setDetails({
            productId: matchedItem.productId || matchedItem._id || "",
            variantId: matchedVariant.variantId || matchedVariant._id || "",
            name: matchedItem.product_name || "Pure Honey",
            sku: matchedVariant.sku || "N/A",
            category: categoryName,
            batchNo: matchedItem.batch_number || "N/A",
            weight: matchedVariant.weight
              ? `${matchedVariant.weight}${matchedVariant.unit || "g"}`
              : "500g",
            warehouse: "Main Warehouse",
            currentStock: currentStockNum,
            addedQty: urlAddedQty,
            previousStock: previousStockNum,
            stockStatus: currentStockNum > 0 ? "IN STOCK" : "OUT OF STOCK",
            updatedOn: formattedDateTime,
            updatedBy: "Admin User",
            image: typeof imgUrl === "string" ? imgUrl : "",
          });
        }
      } catch (err) {
        console.error("Error fetching complete page details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdatedProductDetails();
  }, [productId, variantId, urlAddedQty, urlPrevStock, urlNewStock]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-2">
        <Loader2 size={32} className="animate-spin text-[#16a34a]" />
        <p className="text-xs font-bold text-slate-600">
          Loading Complete Summary...
        </p>
      </div>
    );
  }

  // Fallback Data Structure
  const d: CompleteProductDetails = details || {
    productId: productId || "",
    variantId: variantId || "",
    name: "Mustard Honey",
    sku: "SHV-MST-500",
    category: "Mustard Honey",
    batchNo: "HONEY-MUSTARD-001",
    weight: "500g",
    warehouse: "Main Warehouse",
    currentStock: Number(urlNewStock || 20),
    addedQty: urlAddedQty || 10,
    previousStock: Number(urlPrevStock || 10),
    stockStatus: "IN STOCK",
    updatedOn: new Date().toLocaleString("en-GB"),
    updatedBy: "Admin User",
    image: "",
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
          <div className="w-14 h-14 rounded-full bg-[#22c55e] text-white flex items-center justify-center mx-auto shadow-md">
            <Check size={30} className="stroke-[3]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Stock Updated Successfully!
          </h1>
          <p className="text-xs font-semibold text-slate-400">
            The stock information for variant <span className="text-[#16a34a] font-bold">{d.weight}</span> has been updated successfully.
          </p>
          <p className="text-[11px] font-bold text-emerald-600 pt-1">
            Redirecting to inventory table in {countdown} seconds...
          </p>
        </div>

        {/* 2. PRODUCT DETAILS CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Product Thumbnail */}
          <div className="w-28 h-28 rounded-2xl bg-[#faf8f5] border border-slate-200/80 p-2 shrink-0 flex items-center justify-center overflow-hidden">
            {d.image ? (
              <img
                src={d.image}
                alt={d.name}
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 font-bold text-xs">
                <Package size={24} />
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="flex-1 space-y-4 w-full">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900">{d.name}</h2>
              <span className="px-2.5 py-0.5 rounded-md bg-[#e8f8ee] text-[#16a34a] text-[10px] font-extrabold tracking-wide uppercase">
                {d.stockStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  SKU
                </p>
                <p className="font-extrabold text-slate-800 mt-0.5">{d.sku}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  VARIANT / WEIGHT
                </p>
                <p className="font-extrabold text-[#d9730d] mt-0.5">{d.weight}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  CATEGORY
                </p>
                <p className="font-extrabold text-slate-800 mt-0.5">{d.category}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  UPDATED STOCK
                </p>
                <p className="font-black text-[#16a34a] text-sm mt-0.5">
                  {d.currentStock} Units
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  BATCH NO.
                </p>
                <p className="font-extrabold text-slate-800 mt-0.5">{d.batchNo}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  WAREHOUSE
                </p>
                <p className="font-extrabold text-slate-800 mt-0.5">{d.warehouse}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  UPDATED ON
                </p>
                <p className="font-extrabold text-slate-800 mt-0.5">{d.updatedOn}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  UPDATED BY
                </p>
                <p className="font-extrabold text-slate-800 mt-0.5">{d.updatedBy}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function StockUpdateCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#16a34a]" size={32} />
        </div>
      }
    >
      <StockUpdateCompleteContent />
    </Suspense>
  );
}