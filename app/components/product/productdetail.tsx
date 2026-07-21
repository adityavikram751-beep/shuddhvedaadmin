"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Download,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: "HONEY" | "GIFT BOX" | string;
  price: number;
  stockStatus: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK" | string;
  stockCount: number;
  status: "ACTIVE" | "DRAFT" | string;
  updatedDate: string;
  image: string;
}

const initialProducts: Product[] = [
  {
    id: "p1",
    name: "Raw Honey 250g",
    category: "HONEY",
    price: 299,
    stockStatus: "IN STOCK",
    stockCount: 18,
    status: "ACTIVE",
    updatedDate: "30 May 2024",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
  },
  {
    id: "p2",
    name: "Raw Honey 500g",
    category: "HONEY",
    price: 499,
    stockStatus: "IN STOCK",
    stockCount: 18,
    status: "ACTIVE",
    updatedDate: "30 May 2024",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
  },
  {
    id: "p3",
    name: "Forest Honey",
    category: "HONEY",
    price: 599,
    stockStatus: "LOW STOCK",
    stockCount: 8,
    status: "ACTIVE",
    updatedDate: "29 May 2024",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
  },
  {
    id: "p4",
    name: "Multiflora Honey",
    category: "HONEY",
    price: 549,
    stockStatus: "IN STOCK",
    stockCount: 18,
    status: "ACTIVE",
    updatedDate: "29 May 2024",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
  },
  {
    id: "p5",
    name: "Mustard Honey",
    category: "HONEY",
    price: 449,
    stockStatus: "LOW STOCK",
    stockCount: 6,
    status: "ACTIVE",
    updatedDate: "28 May 2024",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
  },
  {
    id: "p6",
    name: "Wild Honey",
    category: "HONEY",
    price: 699,
    stockStatus: "OUT OF STOCK",
    stockCount: 0,
    status: "DRAFT",
    updatedDate: "28 May 2024",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
  },
  {
    id: "p7",
    name: "Classic Gift Box",
    category: "GIFT BOX",
    price: 899,
    stockStatus: "IN STOCK",
    stockCount: 18,
    status: "ACTIVE",
    updatedDate: "27 May 2024",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&auto=format&fit=crop&q=60",
  },
  {
    id: "p8",
    name: "Premium Gift Box",
    category: "GIFT BOX",
    price: 1299,
    stockStatus: "IN STOCK",
    stockCount: 18,
    status: "ACTIVE",
    updatedDate: "27 May 2024",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&auto=format&fit=crop&q=60",
  },
];

const categoryOptions = ["All Categories", "HONEY", "GIFT BOX"];
const statusOptions = ["All Status", "ACTIVE", "DRAFT"];
const sortOptions = ["Sort by: Latest", "Sort by: Price (Low to High)", "Sort by: Price (High to Low)"];

// Mappings with Safe Types
const categoryStyles: Record<string, string> = {
  HONEY: "bg-[#fef9c3] text-[#a16207]",
  "GIFT BOX": "bg-[#f3e8ff] text-[#9333ea]",
};

const stockStyles: Record<string, string> = {
  "IN STOCK": "bg-[#e8f8ee] text-[#16a34a]",
  "LOW STOCK": "bg-[#fff3e6] text-[#d9730d]",
  "OUT OF STOCK": "bg-[#fde8e8] text-[#dc2626]",
};

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-[#eff6ff] text-[#2563eb]",
  DRAFT: "bg-slate-100 text-slate-500",
};

interface CustomDropdownProps {
  label?: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
}

function CustomDropdown({
  label,
  value,
  options,
  onSelect,
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-xs font-semibold text-slate-700 transition-colors shrink-0"
      >
        {label && <span className="text-slate-400 uppercase text-[10px]">{label}:</span>}
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

export default function ProductsTable() {
  const router = useRouter();
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("Sort by: Latest");
  const [currentPage, setCurrentPage] = useState(1);

  // Navigate to Add Product Page
  const handleAddProduct = () => {
    router.push("/product/addproduct");
  };

  // Delete Product Handler
  const handleDeleteProduct = (id: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== id));
  };

  // Edit Product Handler
  const handleEditProduct = (id: string) => {
    router.push(`/product/addproduct`);
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Category", "Price", "Stock Status", "Stock Count", "Status", "Updated Date"];
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${p.name}"`,
      p.category,
      p.price,
      p.stockStatus,
      p.stockCount,
      p.status,
      `"${p.updatedDate}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    let result = productsList.filter((p) => {
      const matchesSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === "All Categories" || p.category === categoryFilter;
      const matchesStatus = statusFilter === "All Status" || p.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    if (sortBy === "Sort by: Price (Low to High)") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Sort by: Price (High to Low)") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [productsList, search, categoryFilter, statusFilter, sortBy]);

  return (
    <div className="w- bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden font-sans">
      {/* Top Filter Bar */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white">
        {/* Search Input */}
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

        {/* Filters & Export / Add Product */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <CustomDropdown
            value={categoryFilter}
            options={categoryOptions}
            onSelect={(v) => {
              setCategoryFilter(v);
              setCurrentPage(1);
            }}
          />

          <CustomDropdown
            value={statusFilter}
            options={statusOptions}
            onSelect={(v) => {
              setStatusFilter(v);
              setCurrentPage(1);
            }}
          />

          <CustomDropdown value={sortBy} options={sortOptions} onSelect={setSortBy} />

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm shrink-0"
          >
            <Download size={14} className="text-slate-500" />
            Export
          </button>

          {/* Add Product Button */}
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <Plus size={16} className="stroke-[3]" />
            Add Product
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-[#f7f5f2] border-y border-slate-200/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-5">Image</th>
              <th className="py-3 px-5">Product Name</th>
              <th className="py-3 px-5">Category</th>
              <th className="py-3 px-5">Price</th>
              <th className="py-3 px-5">Stock</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Updated</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Image */}
                  <td className="py-3 px-5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200/80 bg-amber-50"
                    />
                  </td>

                  {/* Product Name */}
                  <td className="py-3 px-5 font-bold text-slate-800 text-sm">{product.name}</td>

                  {/* Category */}
                  <td className="py-3 px-5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                        categoryStyles[product.category] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-5 font-extrabold text-slate-900 text-sm">₹{product.price}</td>

                  {/* Stock Status & Count */}
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                          stockStyles[product.stockStatus] ?? "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {product.stockStatus}
                      </span>
                      <span className="font-semibold text-slate-400">{product.stockCount}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                        statusStyles[product.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  {/* Updated Date */}
                  <td className="py-3 px-5 font-medium text-slate-500">{product.updatedDate}</td>

                  {/* Actions - Direct Edit & Delete Icons Only */}
                  <td className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit Product"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      <div className="p-4 sm:p-5 bg-[#f7f5f2] border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <span className="font-medium">
          Showing 1 to {filteredProducts.length} of {filteredProducts.length} products
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          <button
            onClick={() => setCurrentPage(1)}
            className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all ${
              currentPage === 1 ? "bg-[#854d0e] text-white" : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            1
          </button>

          <button
            onClick={() => setCurrentPage(2)}
            className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all ${
              currentPage === 2 ? "bg-[#854d0e] text-white" : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            2
          </button>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}