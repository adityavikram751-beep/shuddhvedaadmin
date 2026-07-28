"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Plus, Search, Filter } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface BenefitItem {
  id: string;
  image: string;
  category: string;
  title: string;
  description: string;
  status: string;
  updated: string;
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

function formatUpdated(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + ", " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function HealthContentList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"All" | "Health Ideas with Honey" | "Honey Tips & Benefits">("All");
  const [items, setItems] = useState<BenefitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // 🌐 Fetch benefits based on category tab ("health" & "benefits")
  const fetchBenefits = async (categoryTab: string) => {
    setLoading(true);
    setMessage("");

    try {
      let fetchedData: BenefitItem[] = [];

      if (categoryTab === "All") {
        // Fetch both "health" and "benefits" categories for the "All" tab
        const slugs = ["healthy", "benefits"];
        for (const slug of slugs) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/benefits/all-benefits/${slug}`, {
              method: "GET",
              credentials: "include",
            });
            const json = await res.json().catch(() => ({}));

            if (res.ok) {
              const rawList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
              const mapped = rawList.map((raw: ApiRecord) => {
                const id = asString(raw._id) || asString(raw.id) || asString(raw.benefitId);
                const imgUrl = asString(raw.image) || asString(raw.image_url) || "";
                
                return {
                  id,
                  image: normalizeImageUrl(imgUrl),
                  category: slug === "healthy" ? "Health Ideas with Honey" : "Honey Tips & Benefits",
                  title: asString(raw.title) || "Untitled",
                  description: asString(raw.description) || "",
                  status: "Published",
                  updated: asString(raw.createdAt) || asString(raw.updatedAt),
                };
              });
              fetchedData = [...fetchedData, ...mapped];
            }
          } catch (err) {
            console.error(`Failed for slug ${slug}:`, err);
          }
        }
      } else {
        // Specific tab selection
        const slug = categoryTab === "Health Ideas with Honey" ? "healthy" : "benefits";
        const res = await fetch(`${API_BASE_URL}/api/benefits/all-benefits/${slug}`, {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(asString(json.message) || "Failed to fetch health content");
        }

        const rawList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        fetchedData = rawList.map((raw: ApiRecord) => {
          const id = asString(raw._id) || asString(raw.id) || asString(raw.benefitId);
          const imgUrl = asString(raw.image) || asString(raw.image_url) || "";
          
          return {
            id,
            image: normalizeImageUrl(imgUrl),
            category: categoryTab,
            title: asString(raw.title) || "Untitled",
            description: asString(raw.description) || "",
            status: "Published",
            updated: asString(raw.createdAt) || asString(raw.updatedAt),
          };
        });
      }

      setItems(fetchedData);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBenefits(activeTab);
  }, [activeTab]);

  // 🗑️ Delete Action using API: DELETE /api/benefits/remove/{benefitId}
  const handleDelete = async (benefitId: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    setDeletingId(benefitId);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/benefits/remove/${benefitId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(asString(data.message) || "Failed to delete item");
      }

      setItems((prev: BenefitItem[]) => prev.filter((item: BenefitItem) => item.id !== benefitId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete operation failed");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter items by search query
  const filteredItems = items.filter((item: BenefitItem) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 text-slate-900 font-sans">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-6 space-y-6">
        
        {/* TOP HEADER & BREADCRUMB */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1">
              Website Management <span className="mx-1">›</span> <span className="text-slate-800 font-bold">Health Content</span>
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Health Content
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Manage health articles and honey tips displayed on the website.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/website-content/health-benefit/addbenefit")}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs sm:text-sm font-extrabold transition-all shadow-sm cursor-pointer"
          >
            <Plus size={18} className="stroke-[3]" />
            Add Content
          </button>
        </div>

        {/* ERROR BANNER */}
        {message && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {message}
          </div>
        )}

        {/* TABS & SEARCH CONTROLS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs">
          {/* Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["All", "Health Ideas with Honey", "Honey Tips & Benefits"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#FFFbeb] text-[#D97706] border border-amber-200 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <Filter size={14} className="text-slate-500" />
              Filter
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200/60 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Cover Image</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Updated</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <Loader2 size={24} className="animate-spin mx-auto text-[#D97706] mb-2" />
                      <span>Loading health contents...</span>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      No content found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isPublished = item.status.toLowerCase() === "published";
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Cover Image */}
                        <td className="py-4 px-6">
                          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-slate-400">No Img</span>
                            )}
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td className="py-4 px-6">
                          <span className={`inline-block px-3 py-1 rounded-lg text-[11px] font-bold ${
                            item.category.toLowerCase().includes("tip") || item.category.toLowerCase().includes("benefit")
                              ? "bg-blue-50 text-blue-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}>
                            {item.category}
                          </span>
                        </td>

                        {/* Title & Description */}
                        <td className="py-4 px-6 max-w-xs">
                          <p className="font-extrabold text-slate-900 text-sm">{item.title}</p>
                          <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">{item.description}</p>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold ${
                            isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {item.status}
                          </span>
                        </td>

                        {/* Updated Date */}
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {formatUpdated(item.updated)}
                        </td>

                        {/* Actions (Only Delete Icon as requested) */}
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="p-2 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                            title="Delete Content"
                          >
                            {deletingId === item.id ? (
                              <Loader2 size={15} className="animate-spin text-red-500" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="py-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Showing 1 to {filteredItems.length} entries</span>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">Previous</button>
              <button className="px-3 py-1.5 rounded-lg bg-[#D97706] text-white font-bold">1</button>
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}