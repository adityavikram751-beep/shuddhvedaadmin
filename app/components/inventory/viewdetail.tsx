"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Download,
  Pencil,
  CheckCircle2,
  ChevronRight,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface ActivityItem {
  id: string;
  change: string; // e.g. "+17" or "-5"
  type: "added" | "deducted";
  title: string;
  subtitle: string;
  dateTime: string;
  modifiedBy: string;
}

interface ProductDetailData {
  id: string;
  variantId: string;
  name: string;
  sku: string;
  category: string;
  batchNo: string;
  weight: string;
  productType: string;
  warehouse: string;
  availableStock: number;
  reservedStock: number;
  damagedStock: number;
  reorderLevel: number;
  stockStatus: string;
  lastUpdatedDate: string;
  lastUpdatedTime: string;
  updatedBy: string;
  image: string;
}

function InventoryDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id") || searchParams.get("productId");
  const variantId = searchParams.get("variantId");

  // Loading & Data States
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 🌐 1. FETCH RECENT STOCK ACTIVITIES FROM LIVE API (EXACT MATCHED FOR YOUR JSON)
  const fetchStockHistory = async (targetProductId: string) => {
    if (!targetProductId) return;
    setActivitiesLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/stock-history/${targetProductId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const data = await res.json();
      console.log("Stock History API Response:", data);

      const rawHistory = data.data || [];

      if (Array.isArray(rawHistory)) {
        const formatted: ActivityItem[] = rawHistory.map(
          (act: any, idx: number) => {
            // Exact Keys Mapping based on your response:
            const prevStk = Number(act.previous_stock ?? 0);
            const updatedStk = Number(act.updated_stock ?? 0);

            // Calculate Difference (e.g., 20 - 3 = +17)
            const diff = updatedStk - prevStk;
            const isAdd = diff >= 0;
            const changeStr = isAdd ? `+${diff}` : `${diff}`;

            // Date Formatting from "updated_at"
            const rawDate = act.updated_at || act.createdAt || act.timestamp;
            const dateObj = rawDate ? new Date(rawDate) : new Date();
            const formattedDateTime = dateObj.toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });

            const weightStr = act.weight ? ` (${act.weight})` : "";
            const titleStr = isAdd ? "Stock Added" : "Stock Deducted";
            const subTitleStr = `Variant${weightStr}: ${prevStk} → ${updatedStk} Units`;

            return {
              id: act._id || act.variantId || `act-${idx}`,
              change: changeStr,
              type: isAdd ? "added" : "deducted",
              title: titleStr,
              subtitle: subTitleStr,
              dateTime: formattedDateTime,
              modifiedBy: "Admin User",
            };
          }
        );

        setActivities(formatted);
      }
    } catch (err) {
      console.error("Error fetching stock history:", err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // 🌐 2. FETCH PRODUCT DETAIL & FIND SPECIFIC VARIANT FROM API
  useEffect(() => {
    const fetchStockDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/stock-list`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        const data = await res.json();
        const rawItems = data.data || [];

        if (Array.isArray(rawItems) && rawItems.length > 0) {
          // Match product by ID
          const matchedItem =
            rawItems.find(
              (item: any) =>
                item.productId === productId || item._id === productId
            ) || rawItems[0];

          const pId = matchedItem.productId || matchedItem._id || "";

          // Fetch History for this Product
          if (pId) {
            fetchStockHistory(pId);
          }

          // Match Specific Variant or default to first variant
          const selectedVariant =
            matchedItem.variants?.find(
              (v: any) => v.variantId === variantId || v._id === variantId
            ) ||
            matchedItem.variants?.[0] ||
            {};

          const stock = Number(
            selectedVariant.available_stock ?? matchedItem.total_stock ?? 0
          );
          const reserved = Number(
            selectedVariant.reserved_stock ?? matchedItem.reserved_stock ?? 0
          );

          // Status determination
          let status = "IN STOCK";
          const rawStatus = (
            selectedVariant.stock_status ||
            matchedItem.overall_status ||
            ""
          ).toLowerCase();

          if (stock === 0 || rawStatus.includes("out")) {
            status = "OUT OF STOCK";
          } else if (rawStatus.includes("low")) {
            status = "LOW STOCK";
          } else {
            status = "IN STOCK";
          }

          // Category formatting
          let categoryName = "Honey";
          if (typeof matchedItem.category === "string") {
            categoryName = matchedItem.category;
          } else if (
            matchedItem.category &&
            typeof matchedItem.category === "object"
          ) {
            categoryName =
              matchedItem.category.category_name ||
              matchedItem.category.name ||
              "Honey";
          }

          // Image URL Safe Extraction
          let imgUrl = matchedItem.image?.image_url || matchedItem.image_url || "";
          if (
            typeof imgUrl === "string" &&
            imgUrl &&
            !imgUrl.startsWith("http") &&
            !imgUrl.startsWith("data:")
          ) {
            imgUrl = `${API_BASE_URL}/${imgUrl.replace(/^\//, "")}`;
          }

          // Date formatting
          const dateObj = matchedItem.last_updated
            ? new Date(matchedItem.last_updated)
            : new Date();
          const formattedDate = dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const formattedTime = dateObj.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          const variantWeightLabel = selectedVariant.weight
            ? `${selectedVariant.weight}${selectedVariant.unit || "g"}`
            : "500g";

          setProduct({
            id: pId,
            variantId: selectedVariant.variantId || selectedVariant._id || "",
            name: matchedItem.product_name || "Mustard Honey",
            sku: selectedVariant.sku || "N/A",
            category: categoryName,
            batchNo: matchedItem.batch_number || "N/A",
            weight: variantWeightLabel,
            productType: "Single Product",
            warehouse: "Main Warehouse",
            availableStock: stock,
            reservedStock: reserved,
            damagedStock: 0,
            reorderLevel: selectedVariant.low_stock_alert || 5,
            stockStatus: status,
            lastUpdatedDate: formattedDate,
            lastUpdatedTime: formattedTime,
            updatedBy: "Admin User",
            image: typeof imgUrl === "string" ? imgUrl : "",
          });
        }
      } catch (err) {
        console.error("Error fetching detail:", err);
        showToast("Failed to load inventory details");
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetail();
  }, [productId, variantId]);

  // Export CSV Handler
  const handleExport = () => {
    if (!product) return;
    const csvData = `Field,Value\nProduct Name,${product.name}\nVariant,${product.weight}\nSKU,${product.sku}\nCategory,${product.category}\nAvailable Stock,${product.availableStock} Units`;
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_detail_${product.sku}.csv`;
    a.click();
    showToast("Inventory Details exported!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-2">
        <Loader2 size={32} className="animate-spin text-[#d9730d]" />
        <p className="text-xs font-bold text-slate-600">
          Loading Variant Inventory Details...
        </p>
      </div>
    );
  }

  const p: ProductDetailData = product || {
    id: productId || "",
    variantId: variantId || "",
    name: "Mustard Honey",
    sku: "SHV-MST-500",
    category: "Mustard Honey",
    batchNo: "HONEY-MUSTARD-001",
    weight: "500g",
    productType: "Single Product",
    warehouse: "Main Warehouse",
    availableStock: 18,
    reservedStock: 0,
    damagedStock: 0,
    reorderLevel: 5,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "27 Jul 2026",
    lastUpdatedTime: "11:47 AM",
    updatedBy: "Admin User",
    image: "",
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-12">
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
              <span
                className="hover:text-slate-600 cursor-pointer"
                onClick={() => router.push("/inventory")}
              >
                Inventory
              </span>
              <ChevronRight size={12} />
              <span className="text-slate-800 font-bold">Inventory Details</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              Inventory DETAIL
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Manage stock levels and inventory for this variant.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <Download size={14} className="text-slate-500" />
              Export
            </button>
          </div>
        </div>

        {/* 1. PRODUCT INFO & CURRENT STOCK OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* PRODUCT DETAILS CARD (LEFT - 8 COLS) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-xs flex flex-col sm:flex-row gap-6 items-start">
            {/* Product Image */}
            <div className="w-36 h-36 rounded-2xl bg-[#faf8f5] border border-slate-200 p-2 shrink-0 flex items-center justify-center overflow-hidden">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 font-bold text-xs text-center p-2">
                  {p.name}
                </div>
              )}
            </div>

            {/* Fields Grid */}
            <div className="flex-1 space-y-5 w-full">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-black text-slate-900">{p.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#e8f8ee] text-[#16a34a] text-[10px] font-extrabold tracking-wide uppercase">
                  • {p.stockStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">
                    SKU
                  </p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                    {p.sku}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">
                    CATEGORY
                  </p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                    {p.category}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">
                    VARIANT / WEIGHT
                  </p>
                  <p className="font-extrabold text-[#d9730d] text-sm mt-0.5">
                    {p.weight}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">
                    PRODUCT TYPE
                  </p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                    {p.productType}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">
                    WAREHOUSE
                  </p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                    {p.warehouse}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CURRENT STOCK CARD (RIGHT - 4 COLS) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400">Current Stock</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-slate-900">
                  {p.availableStock}
                </span>
                <span className="text-sm font-bold text-slate-500">Units</span>
              </div>
              <div className="mt-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#e8f8ee] text-[#16a34a] text-[10px] font-extrabold tracking-wide uppercase">
                  • {p.stockStatus}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Last Updated</span>
                <span className="font-extrabold text-slate-800">
                  {p.lastUpdatedDate}, {p.lastUpdatedTime}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Updated By</span>
                <span className="font-extrabold text-slate-800">
                  {p.updatedBy}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. RECENT STOCK ACTIVITY SECTION */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900">
            Recent Stock Activity
          </h2>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
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
                  {activitiesLoading ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500">
                        <Loader2
                          size={20}
                          className="animate-spin mx-auto text-[#d9730d] mb-1"
                        />
                        <span>Loading activity history...</span>
                      </td>
                    </tr>
                  ) : activities.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-8 text-center text-slate-400 font-medium"
                      >
                        No recent stock activities found for this product.
                      </td>
                    </tr>
                  ) : (
                    activities.map((act) => (
                      <tr
                        key={act.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
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

                        <td className="py-4 px-6 text-slate-600 font-semibold">
                          {act.dateTime}
                        </td>

                        <td className="py-4 px-6 text-right text-slate-500 font-bold">
                          {act.modifiedBy}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM ACTION BAR (CANCEL / UPDATE STOCK) */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} className="text-slate-500" />
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/inventory/addupdate?productId=${p.id}&variantId=${p.variantId}`
              )
            }
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Pencil size={14} />
            Update Stock
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#d9730d]" size={32} />
        </div>
      }
    >
      <InventoryDetailContent />
    </Suspense>
  );
}