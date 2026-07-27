"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ChevronDown,
  Download,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface InventoryItem {
  id: string;            // Row Unique Key
  productId: string;     // Product ID
  variantId: string;     // Variant ID
  name: string;          // Product Name
  sku: string;
  category: string;
  batchNo: string;
  availableStock: number;
  stockStatus: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK";
  lastUpdatedDate: string;
  lastUpdatedTime: string;
  image: string;
  warehouse: string;
  variantWeight: string; // Display string for Variant Weight
}

const statusOptions = ["All Status", "IN STOCK", "LOW STOCK", "OUT OF STOCK"];

// Badge styling
const stockStyles: Record<string, string> = {
  "IN STOCK": "bg-[#e8f8ee] text-[#16a34a]",
  "LOW STOCK": "bg-[#fff3e6] text-[#d9730d]",
  "OUT OF STOCK": "bg-[#fde8e8] text-[#dc2626]",
};

function CustomDropdown({
  value,
  options,
  onSelect,
}: {
  value: string;
  options: string[];
  onSelect: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-xs font-semibold text-slate-700 transition-colors shrink-0 cursor-pointer"
      >
        <span>{value}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-xs text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                  opt === value ? "text-[#d9730d] font-bold" : "text-slate-600 font-medium"
                }`}
              >
                {opt}
                {opt === value && <Check size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function InventoryListPage() {
  const router = useRouter();

  // State Management
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Shows 8 variant rows per page

  // 🌐 FETCH LIVE STOCK LIST & FLAT MAP ALL VARIANTS INTO SEPARATE ROWS
  const fetchStockList = async () => {
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

      if (!Array.isArray(rawItems)) {
        setInventoryList([]);
        return;
      }

      // Flat-map: Loop through each product AND each of its variants
      const formattedVariants: InventoryItem[] = [];

      rawItems.forEach((product: any) => {
        const pId = product.productId || product._id || Math.random().toString();
        const pName = product.product_name || "Untitled Product";
        const categoryName =
          typeof product.category === "string"
            ? product.category
            : product.category?.category_name || "Mustard Honey";

        let imgUrl = product.image?.image_url || product.image_url || "";
        if (typeof imgUrl === "string" && imgUrl && !imgUrl.startsWith("http") && !imgUrl.startsWith("data:")) {
          imgUrl = `${API_BASE_URL}/${imgUrl.replace(/^\//, "")}`;
        }

        const dateObj = product.last_updated ? new Date(product.last_updated) : new Date();
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

        const variantsArr = Array.isArray(product.variants) && product.variants.length > 0
          ? product.variants
          : [{}];

        variantsArr.forEach((variant: any, vIndex: number) => {
          const vId = variant.variantId || variant._id || `v-${vIndex}`;
          const stock = Number(variant.available_stock ?? product.total_stock ?? 0);

          // Status Handler for Variant
          let statusStr: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK" = "IN STOCK";
          const rawStatus = (variant.stock_status || product.overall_status || "").toLowerCase();

          if (stock === 0 || rawStatus.includes("out")) {
            statusStr = "OUT OF STOCK";
          } else if (rawStatus.includes("low")) {
            statusStr = "LOW STOCK";
          } else {
            statusStr = "IN STOCK";
          }

          const weightLabel = variant.weight
            ? `${variant.weight}${variant.unit || "g"}`
            : "";

          formattedVariants.push({
            id: `${pId}-${vId}`,
            productId: pId,
            variantId: vId,
            name: pName,
            sku: variant.sku || "N/A",
            category: categoryName,
            batchNo: product.batch_number || "N/A",
            availableStock: stock,
            stockStatus: statusStr,
            lastUpdatedDate: formattedDate,
            lastUpdatedTime: formattedTime,
            image: typeof imgUrl === "string" ? imgUrl : "",
            warehouse: "Main Warehouse",
            variantWeight: weightLabel,
          });
        });
      });

      setInventoryList(formattedVariants);
    } catch (err) {
      console.error("Error fetching stock list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockList();
  }, []);

  // Live Stats across all variant entries
  const totalProducts = inventoryList.length;
  const inStockCount = inventoryList.filter((i) => i.stockStatus === "IN STOCK").length;
  const lowStockCount = inventoryList.filter((i) => i.stockStatus === "LOW STOCK").length;
  const outOfStockCount = inventoryList.filter((i) => i.stockStatus === "OUT OF STOCK").length;

  // View Details Navigation
  const handleViewDetail = (productId: string, variantId: string) => {
    router.push(`/inventory/viewdetail?id=${productId}&variantId=${variantId}`);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = [
      "SKU",
      "Product Name",
      "Variant",
      "Category",
      "Batch No",
      "Available Stock",
      "Status",
      "Warehouse",
      "Last Updated",
    ];

    const rows = filteredInventory.map((item) => [
      item.sku,
      `"${item.name}"`,
      item.variantWeight,
      item.category,
      item.batchNo,
      item.availableStock,
      item.stockStatus,
      item.warehouse,
      `"${item.lastUpdatedDate} ${item.lastUpdatedTime}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_list_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Logic
  const filteredInventory = useMemo(() => {
    return inventoryList.filter((item) => {
      const matchesSearch =
        search.trim() === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.batchNo.toLowerCase().includes(search.toLowerCase()) ||
        item.variantWeight.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All Status" || item.stockStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventoryList, search, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1;

  const currentPaginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInventory, currentPage]);

  const startRecord = filteredInventory.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, filteredInventory.length);

  return (
    <div className="w-full min-h-screen p-4 sm:p-8 space-y-6 font-sans text-slate-800">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Inventory List
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Manage stock levels and inventory for all product variants.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-xs cursor-pointer"
          >
            <Download size={14} className="text-slate-500" />
            Export
          </button>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Package size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL VARIANTS
            </p>
            <p className="text-2xl font-black text-slate-900">
              {loading ? <Loader2 size={20} className="animate-spin text-slate-400" /> : totalProducts}
            </p>
            <p className="text-[10px] font-semibold text-slate-400">All Items</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              IN STOCK
            </p>
            <p className="text-2xl font-black text-slate-900">
              {loading ? <Loader2 size={20} className="animate-spin text-slate-400" /> : inStockCount}
            </p>
            <p className="text-[10px] font-semibold text-slate-400">Variants</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#d9730d] flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              LOW STOCK
            </p>
            <p className="text-2xl font-black text-slate-900">
              {loading ? <Loader2 size={20} className="animate-spin text-slate-400" /> : lowStockCount}
            </p>
            <p className="text-[10px] font-semibold text-slate-400">Variants</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              OUT OF STOCK
            </p>
            <p className="text-2xl font-black text-slate-900">
              {loading ? <Loader2 size={20} className="animate-spin text-slate-400" /> : outOfStockCount}
            </p>
            <p className="text-[10px] font-semibold text-slate-400">Variants</p>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white border-b border-slate-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search products or SKU..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d9730d]/30 focus:border-[#d9730d]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status Dropdown */}
            <CustomDropdown
              value={statusFilter}
              options={statusOptions}
              onSelect={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            />

            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs font-bold text-[#d9730d] hover:underline px-2 cursor-pointer"
            >
              <RotateCcw size={13} />
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#f7f5f2] border-b border-slate-200/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">PRODUCT & VARIANT</th>
                <th className="py-3.5 px-5">SKU</th>
                <th className="py-3.5 px-5">CATEGORY</th>
                <th className="py-3.5 px-5">BATCH NO.</th>
                <th className="py-3.5 px-5">AVAILABLE STOCK</th>
                <th className="py-3.5 px-5">STOCK STATUS</th>
                <th className="py-3.5 px-5">LAST UPDATED</th>
                <th className="py-3.5 px-5 text-center">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#d9730d] mb-2" />
                    <p className="font-semibold">Loading stock list from server...</p>
                  </td>
                </tr>
              ) : currentPaginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No inventory records match your criteria.
                  </td>
                </tr>
              ) : (
                currentPaginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Product Name, Image & Variant Badge */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 bg-amber-50 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-slate-200/80 flex items-center justify-center text-amber-700 shrink-0">
                            <Package size={18} />
                          </div>
                        )}
                        <div>
                          <p className="font-extrabold text-slate-800 text-xs leading-snug">
                            {item.name}
                          </p>
                          {item.variantWeight && (
                            <span className="inline-block px-2 py-0.5 mt-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                              Variant: {item.variantWeight}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 font-bold text-slate-500">{item.sku}</td>

                    <td className="py-3.5 px-5 font-semibold text-slate-600">{item.category}</td>

                    <td className="py-3.5 px-5 font-semibold text-slate-500 uppercase">{item.batchNo}</td>

                    {/* Variant Specific Available Stock */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`font-black text-sm ${
                          item.availableStock === 0
                            ? "text-red-500"
                            : item.stockStatus === "LOW STOCK"
                            ? "text-[#d9730d]"
                            : "text-emerald-600"
                        }`}
                      >
                        {item.availableStock} Units
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap inline-block ${
                          stockStyles[item.stockStatus] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.stockStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{item.lastUpdatedDate}</span>
                        <span className="text-[10px] font-medium text-slate-400">{item.lastUpdatedTime}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => handleViewDetail(item.productId, item.variantId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#d9730d] hover:bg-amber-50 transition-colors cursor-pointer"
                        title="View / Update Variant Stock"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 sm:p-5 bg-[#f7f5f2] border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span className="font-medium">
            Showing <strong className="text-slate-800">{startRecord} to {endRecord}</strong> of{" "}
            {filteredInventory.length} variants
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                type="button"
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? "border-2 border-[#d9730d] bg-white text-[#d9730d] shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}