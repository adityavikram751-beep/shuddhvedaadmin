"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface ComingProduct {
  id: string;
  image: string;
  productName: string;
  category: string;
  status: string;
  updated: string;
  description: string;
}

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" ? (value as ApiRecord) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function normalizeImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
  return `${API_BASE_URL}/${url.replace(/^\//, "")}`;
}

// 🎯 FIXED: Support single banner object or nested data.banner structures
function pickList(data: unknown): ApiRecord[] {
  if (Array.isArray(data)) return data.map(asRecord);

  const root = asRecord(data);
  const nested = asRecord(root.data);

  // Check if data.banner exists as a single object
  if (nested.banner && typeof nested.banner === "object") {
    return [asRecord(nested.banner)];
  }

  // Check if root.banner exists
  if (root.banner && typeof root.banner === "object") {
    return [asRecord(root.banner)];
  }

  const keys = ["data", "banners", "upcoming", "items", "results"];

  for (const key of keys) {
    const rootValue = root[key];
    if (Array.isArray(rootValue)) return rootValue.map(asRecord);

    const nestedValue = nested[key];
    if (Array.isArray(nestedValue)) return nestedValue.map(asRecord);
  }

  // Fallback: if root itself looks like a banner object with an ID
  if (root._id || root.id || root.product_name) {
    return [root];
  }

  return [];
}

function formatUpdated(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapBanner(raw: ApiRecord): ComingProduct {
  const id = asString(raw._id) || asString(raw.id) || asString(raw.bannerId);
  const categoryRecord = asRecord(raw.category);
  const imageRecord = asRecord(raw.image);
  
  // 🎯 FIXED: Added banner_image and product_description mapping keys
  const image =
    asString(raw.banner_image) ||
    asString(raw.image) ||
    asString(raw.image_url) ||
    asString(raw.imageUrl) ||
    asString(raw.productImage) ||
    asString(imageRecord.url) ||
    asString(imageRecord.path) ||
    asString(imageRecord.location);

  const statusVal = raw.isActive ?? raw.isVisible;
  const statusStr = statusVal === false || statusVal === "false" ? "Hidden" : "Active";

  return {
    id,
    image: normalizeImageUrl(image),
    productName:
      asString(raw.product_name) ||
      asString(raw.productName) ||
      asString(raw.productTitle) ||
      asString(raw.title) ||
      "Untitled Product",
    category:
      asString(raw.categoryName) ||
      asString(raw.category_name) ||
      asString(categoryRecord.name) ||
      asString(categoryRecord.category_name) ||
      asString(raw.tag) ||
      "Honey",
    status: statusStr,
    updated: formatUpdated(
      asString(raw.updatedAt) || asString(raw.updated_at) || asString(raw.createdAt) || asString(raw.launch_date)
    ),
    description:
      asString(raw.product_description) ||
      asString(raw.shortDescription) ||
      asString(raw.short_description) ||
      asString(raw.description) ||
      asString(raw.subtitle),
  };
}

export default function ComingProductList() {
  const router = useRouter();
  const [products, setProducts] = useState<ComingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const activeCount = useMemo(
    () => products.filter((product) => product.status.toLowerCase() !== "hidden").length,
    [products]
  );

  const fetchBanners = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/upcoming/all-banners`, {
        credentials: "include", // 👈 Credentials included as requested
      });
      const data: unknown = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(asString(asRecord(data).message) || "Failed to load coming products");
      }

      setProducts(pickList(data).map(mapBanner).filter((product) => product.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load coming products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBanners();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coming product?")) return;

    setDeletingId(id);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/upcoming/remove/${id}`, {
        method: "DELETE",
        credentials: "include", // 👈 Credentials included
      });
      const data: unknown = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(asString(asRecord(data).message) || "Delete failed");
      }

      setProducts((current) => current.filter((product) => product.id !== id));
      setMessage("Coming product deleted");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 text-slate-900">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Coming Soon Products
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Manage products that are coming soon and will be launched later
            </p>
          </div>

          <button
            onClick={() => router.push("/website-content/coming-product/add")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D97706] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#B45309]"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {message && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Updated</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="mx-auto mb-2 animate-spin text-[#D97706]" size={24} />
                      Loading coming products...
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.productName}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-slate-100" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            router.push(`/website-content/coming-product/add?id=${product.id}`)
                          }
                          className="block text-left"
                        >
                          <span className="block text-base font-black text-slate-900 hover:text-[#D97706]">
                            {product.productName}
                          </span>
                          <span className="mt-1 block max-w-md text-sm font-medium text-slate-500">
                            {product.description}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500">{product.updated}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition-colors hover:bg-red-100 disabled:opacity-60"
                          aria-label="Delete coming product"
                        >
                          {deletingId === product.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center font-semibold text-slate-400">
                      No coming products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-6 py-4 text-sm font-semibold text-slate-500">
            Showing {products.length ? 1 : 0} to {products.length} of {products.length} Products
            {activeCount !== products.length ? ` (${activeCount} active)` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}