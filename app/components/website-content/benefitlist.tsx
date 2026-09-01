"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Plus, Search, RefreshCw, Video, Film, Play } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface BenefitItem {
  id: string;
  video_url: string;
  thumbnail_url: string;
  duration?: number;
  format?: string;
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

function formatUpdated(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HealthContentList() {
  const router = useRouter();
  const [items, setItems] = useState<BenefitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch ALL benefit items in a single unified list
  const fetchBenefits = async () => {
    setLoading(true);

    try {
      let fetchedData: BenefitItem[] = [];
      const slugs = ["honey", "healthy", "benefits", "all"];

      for (const slug of slugs) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/benefits/all-benefits/${slug}`, {
            method: "GET",
            credentials: "include",
          });
          const json = await res.json().catch(() => ({}));

          if (res.ok) {
            const rawList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
            const mapped = rawList.map((item: unknown) => {
              const raw = asRecord(item);
              const id = asString(raw._id) || asString(raw.id) || asString(raw.benefitId);
              const videoUrl = asString(raw.video_url) || asString(raw.url) || asString(raw.video);
              const thumbUrl = asString(raw.thumbnail_url) || asString(raw.thumbnail) || asString(raw.image);

              return {
                id,
                video_url: videoUrl,
                thumbnail_url: thumbUrl,
                duration: typeof raw.duration === "number" ? raw.duration : 0,
                format: asString(raw.format) || "mp4",
                title: asString(raw.title) || "Honey Benefit Video",
                description: asString(raw.description) || "",
                status: "Published",
                updated: asString(raw.createdAt) || asString(raw.updatedAt),
              };
            });

            for (const m of mapped) {
              if (m.id && !fetchedData.some((existing) => existing.id === m.id)) {
                fetchedData.push(m);
              }
            }
          }
        } catch (err) {
          console.error(`Failed for slug ${slug}:`, err);
        }
      }

      setItems(fetchedData);
    } catch (error) {
      console.error("Error fetching benefits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBenefits();
  }, []);

  // Handle Delete: DELETE /api/benefits/remove/${benefitId}
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this benefit video?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/benefits/remove/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Video className="text-[#D97706]" /> Health Benefit Videos
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Manage Cloudinary health benefit videos for ShuddhVeda website.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchBenefits}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-amber-500" : ""} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => router.push("/website-content/health-benefit/addbenefit")}
            className="h-11 px-5 rounded-xl bg-[#2D3A1B] hover:bg-[#1E2712] text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} /> Add Benefit Video
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="px-4 py-2 bg-amber-50 text-[#D97706] rounded-xl text-xs font-black uppercase border border-amber-200/60">
            All Videos ({filteredItems.length})
          </span>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search videos by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#D97706] transition"
          />
        </div>
      </div>

      {/* BIG VIDEO CARDS GRID DISPLAY ("Bada Card UI") */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full bg-white p-16 rounded-3xl border border-slate-100 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#D97706]" size={32} />
            <p className="text-sm font-extrabold text-slate-700">Loading benefit videos from Cloudinary...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/70 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Large Video Player Header */}
                <div className="relative bg-black h-60 sm:h-64 w-full overflow-hidden">
                  {item.video_url ? (
                    <video
                      controls
                      src={item.video_url}
                      poster={item.thumbnail_url}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-amber-50/40 gap-2">
                      <Film size={44} className="text-[#D97706]" />
                      <span className="text-xs font-bold text-slate-500">No Video Source</span>
                    </div>
                  )}

                  {/* Duration Badge Pill */}
                  {item.duration && item.duration > 0 ? (
                    <span className="absolute bottom-3 right-3 bg-black/80 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-md shadow-sm border border-white/20">
                      {item.duration.toFixed(1)}s • {item.format?.toUpperCase() || "MP4"}
                    </span>
                  ) : null}
                </div>

                {/* Card Main Content */}
                <div className="p-5 space-y-2.5">
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Published
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatUpdated(item.updated)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Remove Benefit Video"
                >
                  {deletingId === item.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-16 rounded-3xl border border-slate-100 text-center text-slate-400 space-y-3">
            <Film size={44} className="mx-auto text-amber-500/50" />
            <h3 className="text-base font-extrabold text-slate-700">No Benefit Videos Found</h3>
            <p className="text-xs text-slate-400">Click "+ Add Benefit Video" to upload your first health video!</p>
          </div>
        )}
      </div>
    </div>
  );
}