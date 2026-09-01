"use client";

import { useState, useEffect, useRef } from "react";
import {
  Gift,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
  Package,
  IndianRupee,
  Layers,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

export interface GiftBoxItem {
  _id: string;
  name: string;
  price: number;
  description: string;
  image?: string | { image_url?: string; url?: string };
  image_url?: string;
  jar_count: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function GiftPlanManagement() {
  const [giftBoxes, setGiftBoxes] = useState<GiftBoxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State for Adding New Gift Box
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccessMsg, setFormSuccessMsg] = useState<string | null>(null);
  const [formErrorMsg, setFormErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [jarCount, setJarCount] = useState<number | "">(4);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 🌐 GET API: Fetch All Gift Boxes
  const fetchGiftBoxes = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/gift-box`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && (json.data || Array.isArray(json) || json.giftBoxes)) {
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.giftBoxes)
          ? json.giftBoxes
          : Array.isArray(json)
          ? json
          : [];
        setGiftBoxes(list);
      } else {
        setErrorMsg(
          json.message || `Failed to fetch gift boxes (${res.status})`
        );
      }
    } catch (err: any) {
      console.error("Error fetching gift boxes:", err);
      setErrorMsg(err.message || "Failed to communicate with API server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchGiftBoxes();
  }, []);

  // Handle Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Reset Form
  const resetForm = () => {
    setName("");
    setPrice("");
    setDescription("");
    setJarCount(4);
    setSelectedFile(null);
    setImagePreview(null);
    setFormSuccessMsg(null);
    setFormErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 🚀 POST API: Submit New Gift Box (multipart/form-data)
  const handleCreateGiftBox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a gift box name");
      return;
    }
    if (!price || Number(price) <= 0) {
      alert("Please enter a valid price");
      return;
    }
    if (!selectedFile) {
      alert("Please select a gift box image file");
      return;
    }

    setSubmitting(true);
    setFormSuccessMsg(null);
    setFormErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", String(price));
      formData.append("description", description.trim());
      formData.append("image", selectedFile);
      formData.append("jar_count", String(jarCount || 4));

      const res = await fetch(`${API_BASE_URL}/api/admin/gift-box`, {
        method: "POST",
        credentials: "include",
        body: formData, // FormData automatically sets boundary headers
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && (json.success || json.data || json.message)) {
        setFormSuccessMsg("Gift Box Plan created successfully!");
        resetForm();
        setIsAddModalOpen(false);
        void fetchGiftBoxes();
      } else {
        setFormErrorMsg(
          json.message || json.error || `Error (${res.status}): Creation failed`
        );
      }
    } catch (err: any) {
      console.error("Error creating gift box:", err);
      setFormErrorMsg(err.message || "Failed to communicate with server");
    } finally {
      setSubmitting(false);
    }
  };

  // 🗑️ DELETE API: Remove Gift Box by ID
  const handleDeleteGiftBox = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/remove/gift-box/${deletingId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const json = await res.json().catch(() => ({}));

      if (res.ok && (json.success || res.status === 200)) {
        setGiftBoxes((prev) => prev.filter((item) => item._id !== deletingId));
        setDeletingId(null);
      } else {
        alert(json.message || `Failed to delete gift box (${res.status})`);
      }
    } catch (err: any) {
      console.error("Error deleting gift box:", err);
      alert(err.message || "Failed to delete gift box");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to resolve Image URL safely
  const getImageUrl = (item: GiftBoxItem): string => {
    if (typeof item.image === "string" && item.image.startsWith("http")) {
      return item.image;
    }
    if (typeof item.image === "object" && item.image !== null) {
      if (item.image.image_url) return item.image.image_url;
      if (item.image.url) return item.image.url;
    }
    if (item.image_url) return item.image_url;
    return "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=400&auto=format&fit=crop";
  };

  // Filter gift boxes by search term
  const filteredBoxes = giftBoxes.filter((box) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      box.name.toLowerCase().includes(term) ||
      (box.description && box.description.toLowerCase().includes(term)) ||
      String(box.price).includes(term) ||
      String(box.jar_count).includes(term)
    );
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* 👑 Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-[#FFFBF0] border border-[#F2D6A7] text-[#E69A00] rounded-xl shadow-2xs">
            <Gift size={22} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-[#2D2118]">
              Gift Box Plans
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Create and manage honey gift box packages & pricing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchGiftBoxes}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 shadow-2xs transition cursor-pointer shrink-0"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-[#E69A00]" : "text-gray-500"}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E69A00] hover:bg-[#D48D00] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Add Gift Plan</span>
          </button>
        </div>
      </div>

      {/* 📊 Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#E69A00] flex items-center justify-center font-bold">
            <Gift size={20} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Gift Boxes
            </p>
            <p className="text-xl font-bold text-[#2D2118]">
              {giftBoxes.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <IndianRupee size={20} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Avg. Box Price
            </p>
            <p className="text-xl font-bold text-[#2D2118]">
              ₹
              {giftBoxes.length > 0
                ? Math.round(
                    giftBoxes.reduce((acc, curr) => acc + (curr.price || 0), 0) /
                      giftBoxes.length
                  )
                : 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Package size={20} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Jar Capacity Range
            </p>
            <p className="text-xl font-bold text-[#2D2118]">
              {giftBoxes.length > 0
                ? `${Math.min(...giftBoxes.map((b) => b.jar_count || 1))} - ${Math.max(
                    ...giftBoxes.map((b) => b.jar_count || 1)
                  )} Jars`
                : "4 Jars"}
            </p>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
          <button
            onClick={fetchGiftBoxes}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
        <div className="relative w-full">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search Gift Box Name, Price, Jar Count, Description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
          />
        </div>
      </div>

      {/* 🎁 Gift Boxes Cards Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#E69A00]" size={32} />
            <p className="text-xs font-semibold text-gray-600">
              Loading Gift Box Plans...
            </p>
          </div>
        ) : filteredBoxes.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
            <Gift size={40} className="text-gray-300 stroke-1" />
            <p className="text-sm font-semibold text-gray-600">
              No Gift Boxes Found
            </p>
            <p className="text-xs text-gray-400">
              Click &quot;Add Gift Plan&quot; to create your first gift box.
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="mt-2 px-4 py-2 bg-[#E69A00] text-white text-xs font-bold rounded-xl hover:bg-[#D48D00] transition"
            >
              + Add Gift Box
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBoxes.map((box) => {
              const imgUrl = getImageUrl(box);

              return (
                <div
                  key={box._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
                >
                  {/* Card Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={box.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="bg-[#2D3A1B]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                        {box.jar_count || 4} Jars Box
                      </span>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-[#2D2118] group-hover:text-[#E69A00] transition-colors">
                          {box.name}
                        </h3>
                        <span className="text-base font-extrabold text-[#E69A00] shrink-0">
                          ₹{box.price}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {box.description || "No description provided."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setDeletingId(box._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition cursor-pointer border border-rose-200"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ➕ ADD GIFT BOX MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-8 flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#FAF6F0] p-4 border-b border-[#F2E8D9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-100 text-[#E69A00] rounded-xl border border-amber-200">
                  <Gift size={18} />
                </span>
                <h2 className="text-base font-bold text-[#2D2118]">
                  Add New Gift Plan Box
                </h2>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateGiftBox} className="p-5 space-y-4 text-xs">
              {formErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{formErrorMsg}</span>
                </div>
              )}

              {formSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                  <span>{formSuccessMsg}</span>
                </div>
              )}

              {/* Gift Box Name */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Gift Box Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honey Quad Box"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                />
              </div>

              {/* Price & Jar Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 350"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Jar Count <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 4"
                    value={jarCount}
                    onChange={(e) =>
                      setJarCount(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Premium 4 Jar Honey Gift Box with luxury packaging..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                />
              </div>

              {/* Image Upload Field */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Gift Box Image <span className="text-rose-500">*</span>
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-[#E69A00] bg-gray-50 hover:bg-[#FFFBF5] rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative w-full h-36 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                        Click to Change Image
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-[#E69A00] flex items-center justify-center">
                        <Upload size={18} />
                      </div>
                      <p className="text-xs font-bold text-gray-700">
                        Click to upload image file
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Supports JPG, PNG, WEBP (box2.jpg)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#E69A00] hover:bg-[#D48D00] text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Plus size={15} />
                  )}
                  {submitting ? "Uploading..." : "Submit Gift Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚠️ DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 size={22} />
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                Remove Gift Box Plan?
              </h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete this gift box? This action will remove it from the backend server.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteGiftBox}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete Gift Box"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
