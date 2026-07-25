"use client";

import { useState, useEffect, useMemo } from "react";
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
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface ProductVariant {
  _id?: string;
  price?: number;
  mrp?: number;
  stock?: number;
  available_stock?: number;
}

interface ProductImage {
  _id?: string;
  image_url?: string;
  is_primary?: boolean;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stockStatus: string;
  stockCount: number;
  status: string;
  updatedDate: string;
  image: string;
}

const statusOptions = ["All Status", "ACTIVE", "DRAFT"];
const sortOptions = [
  "Sort by: Latest",
  "Sort by: Price (Low to High)",
  "Sort by: Price (High to Low)",
];

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
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-xs font-semibold text-slate-700 transition-colors shrink-0 cursor-pointer"
      >
        {label && (
          <span className="text-slate-400 uppercase text-[10px]">{label}:</span>
        )}
        <span>{value}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
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
                  opt === value
                    ? "text-[#d9730d] font-bold"
                    : "text-slate-600 font-medium"
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

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("Sort by: Latest");
  const [currentPage, setCurrentPage] = useState(1);

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Category Options Filter
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    productsList.forEach((p) => {
      if (p.category) set.add(p.category.toUpperCase());
    });
    return ["All Categories", ...Array.from(set)];
  }, [productsList]);

  // 🌐 1. FETCH ALL PRODUCTS FROM API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const data = await res.json();
      const rawProducts = Array.isArray(data)
        ? data
        : data.data || data.products || data.items || [];

      if (!Array.isArray(rawProducts)) {
        setProductsList([]);
        return;
      }

      // Format API Data to Component Schema
      const formatted: Product[] = rawProducts.map((p: any) => {
        const variants: ProductVariant[] = p.variantDocumentId || p.variants || [];
        const primaryVariant = variants[0];

        const images: ProductImage[] = p.imageDocumentId || p.images || [];
        const primaryImg =
          images.find((img) => img.is_primary)?.image_url ||
          images[0]?.image_url ||
          p.image?.image_url ||
          "/placeholder.png";

        const stock =
          primaryVariant?.available_stock ??
          primaryVariant?.stock ??
          p.available_stock ??
          0;

        let stockStatus = "IN STOCK";
        if (stock === 0) stockStatus = "OUT OF STOCK";
        else if (stock < 10) stockStatus = "LOW STOCK";

        const catName =
          p.categoryId?.category_name ||
          p.categoryId?.name ||
          p.category_name ||
          p.product_type ||
          "HONEY";

        return {
          id: p._id || p.id,
          name: p.product_name || p.name || "Untitled Product",
          category: String(catName).toUpperCase(),
          price: primaryVariant?.price || p.price || 0,
          stockStatus: stockStatus,
          stockCount: stock,
          status: p.is_active === false ? "DRAFT" : "ACTIVE",
          updatedDate: p.updatedAt
            ? new Date(p.updatedAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Today",
          image: primaryImg,
        };
      });

      setProductsList(formatted);
    } catch (err: any) {
      console.error("Error loading products:", err);
      showToast(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🌐 2. DELETE PRODUCT VIA API
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/remove/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete product");
      }

      setProductsList((prev) => prev.filter((p) => p.id !== id));
      showToast("Product deleted successfully!");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Could not delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddProduct = () => {
    router.push("/product/addproduct");
  };

  // 🎯 EDIT PRODUCT REDIRECT (Query parameter passed with ID)
  const handleEditProduct = (id: string) => {
    router.push(`/product/addproduct?id=${id}`);
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Category",
      "Price",
      "Stock Status",
      "Stock Count",
      "Status",
      "Updated Date",
    ];
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

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = useMemo(() => {
    let result = productsList.filter((p) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All Categories" ||
        p.category.toLowerCase().includes(categoryFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "All Status" || p.status === statusFilter;

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
    <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
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

          <CustomDropdown
            value={sortBy}
            options={sortOptions}
            onSelect={setSortBy}
          />

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm shrink-0 cursor-pointer"
          >
            <Download size={14} className="text-slate-500" />
            Export
          </button>

          <button
            type="button"
            onClick={handleAddProduct}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
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
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <Loader2 size={24} className="animate-spin mx-auto text-[#d9730d] mb-2" />
                  <p className="font-semibold">Loading products from server...</p>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200/80 bg-amber-50"
                    />
                  </td>

                  <td className="py-3 px-5 font-bold text-slate-800 text-sm">{product.name}</td>

                  <td className="py-3 px-5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                        categoryStyles[product.category] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {product.category}
                    </span>
                  </td>

                  <td className="py-3 px-5 font-extrabold text-slate-900 text-sm">₹{product.price}</td>

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

                  <td className="py-3 px-5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                        statusStyles[product.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  <td className="py-3 px-5 font-medium text-slate-500">{product.updatedDate}</td>

                  <td className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditProduct(product.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === product.id}
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete Product"
                      >
                        {deletingId === product.id ? (
                          <Loader2 size={16} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={16} />
                        )}
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
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              currentPage === 1
                ? "bg-[#854d0e] text-white"
                : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            1
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all cursor-pointer"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}