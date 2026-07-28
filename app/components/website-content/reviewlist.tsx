"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface ReviewItem {
  id: string;
  thumbnail: string;
  type: "Video Review" | "Comment Review";
  customerName: string;
  rating: number;
  status: string;
  updatedAt: string;
  category: "video" | "comment";
}

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" ? (value as ApiRecord) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value) || 5;
}

function formatDate(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + ", " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function CustomerReviews() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"All" | "Video Review" | "Comment Review">("All");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchQuery] = useState("");
  
  // 📄 Pagination States (Max 8 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [videoRes, commentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/feedback/all-feedback/videos`, { method: "GET", credentials: "include" }),
        fetch(`${API_BASE_URL}/api/reviews/all`, { method: "GET", credentials: "include" })
      ]);

      const videoJson = await videoRes.json().catch(() => ({}));
      const commentJson = await commentRes.json().catch(() => ({}));

      // 🎥 Mapping Video Feedback
      const rawVideos = Array.isArray(videoJson.data) ? videoJson.data : (Array.isArray(videoJson.videos) ? videoJson.videos : []);
      const formattedVideos: ReviewItem[] = rawVideos.map((item: unknown) => {
        const raw = asRecord(item);
        return {
          id: asString(raw.id) || asString(raw._id),
          thumbnail: asString(raw.thumbnail_url) || asString(raw.thumbnailUrl) || "",
          type: "Video Review",
          customerName: "Verified Customer",
          rating: 5,
          status: "Published",
          updatedAt: formatDate(asString(raw.createdAt)),
          category: "video",
        };
      });

      // 💬 Mapping Comment Reviews (Thumbnail mapped to image/profile_url)
      const rawComments = Array.isArray(commentJson.data) ? commentJson.data : (Array.isArray(commentJson.reviews) ? commentJson.reviews : []);
      const formattedComments: ReviewItem[] = rawComments.map((item: unknown) => {
        const raw = asRecord(item);
        const imageUrl = asString(raw.image) || asString(raw.profile_url) || asString(raw.profile) || "";
        return {
          id: asString(raw._id) || asString(raw.reviewId),
          thumbnail: imageUrl,
          type: "Comment Review",
          customerName: asString(raw.fullname) || asString(raw.customerName) || "Customer",
          rating: asNumber(raw.rating) || 5,
          status: "Published",
          updatedAt: formatDate(asString(raw.updatedAt) || asString(raw.createdAt)),
          category: "comment",
        };
      });

      setReviews([...formattedVideos, ...formattedComments]);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAllData();
  }, []);

  const handleDelete = async (id: string, type: "Video Review" | "Comment Review") => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      if (type === "Video Review") {
        await fetch(`${API_BASE_URL}/api/feedback/remove-feedback/${id}`, { method: "DELETE", credentials: "include" });
      } else {
        await fetch(`${API_BASE_URL}/api/reviews/reviews/${id}`, { method: "DELETE", credentials: "include" });
      }
      setReviews((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  // Filter items by Tab & Search
  const filteredReviews = reviews.filter((item) => {
    const matchesTab =
      activeTab === "All" ? true :
      activeTab === "Video Review" ? item.type === "Video Review" :
      item.type === "Comment Review";

    const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // 📄 Pagination Logic (8 items per page)
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-[1320px] mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Happy Customer Reviews</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Manage video and comment reviews shown on the website.</p>
          </div>
          <button
            onClick={() => router.push("/website-content/customer-review/addreview")}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-extrabold px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer text-xs sm:text-sm"
          >
            <Plus size={18} className="stroke-[3]" /> Add Review
          </button>
        </div>

        {/* Tabs & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            {(["All", "Video Review", "Comment Review"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#FFFbeb] text-[#D97706] border border-amber-200 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {tab === "Video Review" && "🎥 "}
                {tab === "Comment Review" && "💬 "}
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search review by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200/60 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Thumbnail</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Customer Name</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Updated</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">Loading reviews...</td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">No reviews found.</td>
                  </tr>
                ) : (
                  currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        {item.category === "video" ? (
                          <div className="relative w-16 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={item.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[8px] font-bold text-slate-800">▶</div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                            {item.thumbnail ? (
                              <img src={item.thumbnail} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-slate-400 text-xs">💬</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                          item.type === "Video Review" ? "bg-purple-50 text-purple-600" : "bg-amber-50 text-amber-700"
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-900 text-sm">{item.customerName}</td>
                      
                      {/* ⭐ Rating with Stars & Exact Number (e.g. ★★★★☆ (4/5)) */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 tracking-wider">
                            {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                          </span>
                          <span className="text-[11px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.rating}/5
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Published
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{item.updatedAt}</td>
                      
                      {/* ACTION COLUMN: Sirf Delete Icon */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDelete(item.id, item.type)}
                          className="p-2 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Delete Review"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer (Max 8 items per page) */}
          <div className="py-4 px-6 border-t border-slate-100 flex justify-between items-center text-xs font-medium text-slate-500">
            <span>
              Showing {filteredReviews.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredReviews.length)} of {filteredReviews.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3.5 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#D97706] text-white"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}