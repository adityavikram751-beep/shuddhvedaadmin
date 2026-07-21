"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ChevronDown,
  Download,
  Plus,
  Filter,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  batchNo: string;
  availableStock: number;
  reservedStock: number;
  stockStatus: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK";
  lastUpdatedDate: string;
  lastUpdatedTime: string;
  image: string;
  warehouse: string;
}

// 24 Full Mock Products Data for 4 Working Pages (6 per page)
const allInventoryItems: InventoryItem[] = [
  // --- PAGE 1 (Items 1 to 6) ---
  {
    id: "inv1",
    name: "Raw Honey 250g",
    sku: "RH250",
    category: "Honey",
    batchNo: "BATCH2507",
    availableStock: 42,
    reservedStock: 6,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "07 Jul 2026",
    lastUpdatedTime: "10:30 AM",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv2",
    name: "Raw Honey 500g",
    sku: "RH500",
    category: "Honey",
    batchNo: "BATCH2586",
    availableStock: 28,
    reservedStock: 8,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "07 Jul 2026",
    lastUpdatedTime: "09:45 AM",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv3",
    name: "Forest Honey 500g",
    sku: "FH500",
    category: "Honey",
    batchNo: "BATCH2586",
    availableStock: 8,
    reservedStock: 2,
    stockStatus: "LOW STOCK",
    lastUpdatedDate: "06 Jul 2026",
    lastUpdatedTime: "04:20 PM",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
    warehouse: "Secondary Warehouse",
  },
  {
    id: "inv4",
    name: "Mustard Honey 500g",
    sku: "MH500",
    category: "Honey",
    batchNo: "BATCH2586",
    availableStock: 0,
    reservedStock: 0,
    stockStatus: "OUT OF STOCK",
    lastUpdatedDate: "05 Jul 2026",
    lastUpdatedTime: "11:15 AM",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv5",
    name: "Premium Gift Box",
    sku: "PGBOX",
    category: "Gift Box",
    batchNo: "BATCH2585",
    availableStock: 15,
    reservedStock: 3,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "05 Jul 2026",
    lastUpdatedTime: "10:00 AM",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv6",
    name: "Classic Gift Box",
    sku: "CGBOX",
    category: "Gift Box",
    batchNo: "BATCH2585",
    availableStock: 2,
    reservedStock: 1,
    stockStatus: "LOW STOCK",
    lastUpdatedDate: "04 Jul 2026",
    lastUpdatedTime: "06:30 PM",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&auto=format&fit=crop&q=60",
    warehouse: "Secondary Warehouse",
  },

  // --- PAGE 2 (Items 7 to 12) ---
  {
    id: "inv7",
    name: "Wildflower Honey 1kg",
    sku: "WF1000",
    category: "Honey",
    batchNo: "BATCH2590",
    availableStock: 35,
    reservedStock: 5,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "03 Jul 2026",
    lastUpdatedTime: "02:15 PM",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv8",
    name: "Acacia Honey 250g",
    sku: "AC250",
    category: "Honey",
    batchNo: "BATCH2591",
    availableStock: 19,
    reservedStock: 4,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "03 Jul 2026",
    lastUpdatedTime: "11:00 AM",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv9",
    name: "Organic Clover Honey",
    sku: "CL500",
    category: "Honey",
    batchNo: "BATCH2592",
    availableStock: 4,
    reservedStock: 1,
    stockStatus: "LOW STOCK",
    lastUpdatedDate: "02 Jul 2026",
    lastUpdatedTime: "05:40 PM",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
    warehouse: "Secondary Warehouse",
  },
  {
    id: "inv10",
    name: "Eucalyptus Honey 500g",
    sku: "EU500",
    category: "Honey",
    batchNo: "BATCH2593",
    availableStock: 50,
    reservedStock: 10,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "02 Jul 2026",
    lastUpdatedTime: "09:20 AM",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv11",
    name: "Festive Honey Combo",
    sku: "FESTCMB",
    category: "Gift Box",
    batchNo: "BATCH2594",
    availableStock: 22,
    reservedStock: 2,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "01 Jul 2026",
    lastUpdatedTime: "03:10 PM",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv12",
    name: "Manuka Blend 250g",
    sku: "MK250",
    category: "Honey",
    batchNo: "BATCH2595",
    availableStock: 0,
    reservedStock: 0,
    stockStatus: "OUT OF STOCK",
    lastUpdatedDate: "01 Jul 2026",
    lastUpdatedTime: "01:00 PM",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
    warehouse: "Secondary Warehouse",
  },

  // --- PAGE 3 (Items 13 to 18) ---
  {
    id: "inv13",
    name: "Sidr Pure Honey 500g",
    sku: "SDR500",
    category: "Honey",
    batchNo: "BATCH2596",
    availableStock: 12,
    reservedStock: 2,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "30 Jun 2026",
    lastUpdatedTime: "10:15 AM",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv14",
    name: "Ginger Infused Honey",
    sku: "GNG250",
    category: "Honey",
    batchNo: "BATCH2597",
    availableStock: 30,
    reservedStock: 4,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "29 Jun 2026",
    lastUpdatedTime: "04:50 PM",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv15",
    name: "Tulsi Infused Honey",
    sku: "TLS250",
    category: "Honey",
    batchNo: "BATCH2598",
    availableStock: 5,
    reservedStock: 1,
    stockStatus: "LOW STOCK",
    lastUpdatedDate: "28 Jun 2026",
    lastUpdatedTime: "12:30 PM",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
    warehouse: "Secondary Warehouse",
  },
  {
    id: "inv16",
    name: "Cinnamon Honey 250g",
    sku: "CNN250",
    category: "Honey",
    batchNo: "BATCH2599",
    availableStock: 16,
    reservedStock: 3,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "27 Jun 2026",
    lastUpdatedTime: "02:22 PM",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv17",
    name: "Royal Honey Gift Set",
    sku: "RYLSET",
    category: "Gift Box",
    batchNo: "BATCH2600",
    availableStock: 8,
    reservedStock: 2,
    stockStatus: "LOW STOCK",
    lastUpdatedDate: "26 Jun 2026",
    lastUpdatedTime: "06:10 PM",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&auto=format&fit=crop&q=60",
    warehouse: "Secondary Warehouse",
  },
  {
    id: "inv18",
    name: "Multi-Flora Honey 1kg",
    sku: "MF1000",
    category: "Honey",
    batchNo: "BATCH2601",
    availableStock: 25,
    reservedStock: 5,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "25 Jun 2026",
    lastUpdatedTime: "11:45 AM",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },

  // --- PAGE 4 (Items 19 to 24) ---
  {
    id: "inv19",
    name: "Pure Honey Mini Trio",
    sku: "MINI3",
    category: "Gift Box",
    batchNo: "BATCH2602",
    availableStock: 14,
    reservedStock: 2,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "24 Jun 2026",
    lastUpdatedTime: "01:20 PM",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv20",
    name: "Saffron Honey 250g",
    sku: "SFR250",
    category: "Honey",
    batchNo: "BATCH2603",
    availableStock: 3,
    reservedStock: 1,
    stockStatus: "LOW STOCK",
    lastUpdatedDate: "23 Jun 2026",
    lastUpdatedTime: "05:00 PM",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
    warehouse: "Secondary Warehouse",
  },
  {
    id: "inv21",
    name: "Jamun Honey 500g",
    sku: "JMN500",
    category: "Honey",
    batchNo: "BATCH2604",
    availableStock: 27,
    reservedStock: 4,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "22 Jun 2026",
    lastUpdatedTime: "10:10 AM",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv22",
    name: "Kashmir White Honey",
    sku: "KSH500",
    category: "Honey",
    batchNo: "BATCH2605",
    availableStock: 18,
    reservedStock: 3,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "21 Jun 2026",
    lastUpdatedTime: "03:45 PM",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv23",
    name: "Litchi Honey 500g",
    sku: "LTC500",
    category: "Honey",
    batchNo: "BATCH2606",
    availableStock: 33,
    reservedStock: 6,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "20 Jun 2026",
    lastUpdatedTime: "09:30 AM",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
  {
    id: "inv24",
    name: "Himalayan Honey 1kg",
    sku: "HML1000",
    category: "Honey",
    batchNo: "BATCH2607",
    availableStock: 11,
    reservedStock: 2,
    stockStatus: "IN STOCK",
    lastUpdatedDate: "19 Jun 2026",
    lastUpdatedTime: "02:15 PM",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
    warehouse: "Main Warehouse",
  },
];

const categoryOptions = ["All Categories", "Honey", "Gift Box"];
const warehouseOptions = ["All Warehouse", "Main Warehouse", "Secondary Warehouse"];
const statusOptions = ["All Status", "IN STOCK", "LOW STOCK", "OUT OF STOCK"];

// Single-line badge styling exact match
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
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-xs font-semibold text-slate-700 transition-colors shrink-0"
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
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-xs text-left hover:bg-slate-50 transition-colors ${
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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [warehouseFilter, setWarehouseFilter] = useState("All Warehouse");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Header Summary Counters
  const totalProducts = allInventoryItems.length; // 24
  const inStockCount = allInventoryItems.filter((i) => i.stockStatus === "IN STOCK").length;
  const lowStockCount = allInventoryItems.filter((i) => i.stockStatus === "LOW STOCK").length;
  const outOfStockCount = allInventoryItems.filter((i) => i.stockStatus === "OUT OF STOCK").length;

  // Handlers for Navigation Page Route Change
  const handleAddStock = () => {
    router.push("/inventory/addupdate");
  };

  const handleEditItem = (id: string) => {
    router.push(`/inventory/viewdetail`);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategoryFilter("All Categories");
    setWarehouseFilter("All Warehouse");
    setStatusFilter("All Status");
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = [
      "SKU",
      "Product Name",
      "Category",
      "Batch No",
      "Available Stock",
      "Reserved Stock",
      "Status",
      "Warehouse",
      "Last Updated",
    ];

    const rows = filteredInventory.map((item) => [
      item.sku,
      `"${item.name}"`,
      item.category,
      item.batchNo,
      item.availableStock,
      item.reservedStock,
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
    return allInventoryItems.filter((item) => {
      const matchesSearch =
        search.trim() === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.batchNo.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All Categories" || item.category === categoryFilter;

      const matchesWarehouse =
        warehouseFilter === "All Warehouse" || item.warehouse === warehouseFilter;

      const matchesStatus =
        statusFilter === "All Status" || item.stockStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus;
    });
  }, [search, categoryFilter, warehouseFilter, statusFilter]);

  // Dynamic Pagination Calculations
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1;

  const currentPaginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInventory, currentPage]);

  const startRecord = filteredInventory.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, filteredInventory.length);

  return (
    <div className="w-full min-h-screen p-4 sm:p-8 space-y-6 font-sans text-slate-800">
      
      {/* 1. TOP TITLE BAR & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Inventory List
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Manage stock levels and inventory for all products.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-sm"
          >
            <Download size={14} className="text-slate-500" />
            Export
          </button>

          <button
            onClick={handleAddStock}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={16} className="stroke-[3]" />
            Add Stock / Update
          </button>
        </div>
      </div>

      {/* 2. STATS SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Package size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL PRODUCTS
            </p>
            <p className="text-2xl font-black text-slate-900">{totalProducts}</p>
            <p className="text-[10px] font-semibold text-slate-400">All Products</p>
          </div>
        </div>

        {/* In Stock */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              IN STOCK
            </p>
            <p className="text-2xl font-black text-slate-900">{inStockCount}</p>
            <p className="text-[10px] font-semibold text-slate-400">Products</p>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#d9730d] flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              LOW STOCK
            </p>
            <p className="text-2xl font-black text-slate-900">{lowStockCount}</p>
            <p className="text-[10px] font-semibold text-slate-400">Products</p>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              OUT OF STOCK
            </p>
            <p className="text-2xl font-black text-slate-900">{outOfStockCount}</p>
            <p className="text-[10px] font-semibold text-slate-400">Products</p>
          </div>
        </div>
      </div>

      {/* 3. MAIN TABLE CARD WITH FILTERS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Top Filters Row */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white border-b border-slate-100">
          
          {/* Search Field */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d9730d]/30 focus:border-[#d9730d]"
            />
          </div>

          {/* Filter Dropdowns & Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <CustomDropdown
              value={categoryFilter}
              options={categoryOptions}
              onSelect={(val) => {
                setCategoryFilter(val);
                setCurrentPage(1);
              }}
            />

            <CustomDropdown
              value={warehouseFilter}
              options={warehouseOptions}
              onSelect={(val) => {
                setWarehouseFilter(val);
                setCurrentPage(1);
              }}
            />

            <CustomDropdown
              value={statusFilter}
              options={statusOptions}
              onSelect={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            />

            <button
              onClick={() => {}}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Filter size={13} className="text-slate-400" />
              Filter
            </button>

            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs font-bold text-[#d9730d] hover:underline px-2"
            >
              <RotateCcw size={13} />
              Clear
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#f7f5f2] border-b border-slate-200/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">PRODUCT</th>
                <th className="py-3.5 px-5">SKU</th>
                <th className="py-3.5 px-5">CATEGORY</th>
                <th className="py-3.5 px-5">BATCH NO.</th>
                <th className="py-3.5 px-5">AVAILABLE STOCK</th>
                <th className="py-3.5 px-5">RESERVED STOCK</th>
                <th className="py-3.5 px-5">STOCK STATUS</th>
                <th className="py-3.5 px-5">LAST UPDATED</th>
                <th className="py-3.5 px-5 text-center">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {currentPaginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    No inventory records match your criteria.
                  </td>
                </tr>
              ) : (
                currentPaginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Product Image & Name */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 bg-amber-50 shrink-0"
                        />
                        <span className="font-extrabold text-slate-800 text-xs max-w-[120px] leading-snug">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-5 font-bold text-slate-500">{item.sku}</td>

                    {/* Category */}
                    <td className="py-3.5 px-5 font-semibold text-slate-600">{item.category}</td>

                    {/* Batch No */}
                    <td className="py-3.5 px-5 font-semibold text-slate-500 uppercase">{item.batchNo}</td>

                    {/* Available Stock */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`font-black text-sm ${
                          item.availableStock === 0
                            ? "text-red-500"
                            : item.availableStock < 10
                            ? "text-[#d9730d]"
                            : "text-emerald-600"
                        }`}
                      >
                        {item.availableStock}
                      </span>
                    </td>

                    {/* Reserved Stock */}
                    <td className="py-3.5 px-5 font-semibold text-slate-600">{item.reservedStock}</td>

                    {/* Stock Status Badge (Exact single-line fix: whitespace-nowrap inline-block) */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap inline-block ${
                          stockStyles[item.stockStatus] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.stockStatus}
                      </span>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{item.lastUpdatedDate}</span>
                        <span className="text-[10px] font-medium text-slate-400">{item.lastUpdatedTime}</span>
                      </div>
                    </td>

                    {/* Action Button: Opens Edit/View Page */}
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => handleEditItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#d9730d] hover:bg-amber-50 transition-colors"
                        title="View / Edit Inventory"
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

        {/* DYNAMIC FOOTER PAGINATION BAR */}
        <div className="p-4 sm:p-5 bg-[#f7f5f2] border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span className="font-medium">
            Showing <strong className="text-slate-800">{startRecord} to {endRecord}</strong> of{" "}
            {filteredInventory.length} products
          </span>

          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Dynamic Page Numbers Buttons (1, 2, 3, 4, etc.) */}
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? "border-2 border-[#d9730d] bg-white text-[#d9730d] shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Page Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}