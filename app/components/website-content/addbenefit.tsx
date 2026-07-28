"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2, CheckCircle2, Calendar, Clock, Check } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

export default function AddHealthContentForm() {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [category, setCategory] = useState<"Health Ideas with Honey" | "Honey Tips & Benefits">("Health Ideas with Honey");
  const [title, setTitle] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  
  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 🎯 Success View State (jab form successfully submit ho jaye)
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [countdown, setCountdown] = useState(5);

  // ⏱️ 5 seconds countdown timer & redirect logic
  useEffect(() => {
    if (!submittedData) return;

    if (countdown <= 0) {
      router.push("/website-content/health-benefit");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [submittedData, countdown, router]);

  const handleImageChange = (file?: File) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Submit Handler: POST /api/benefits/add
  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage("Title is required");
      return;
    }
    if (!imageFile) {
      setErrorMessage("Cover image is required");
      return;
    }
    if (!fullDescription.trim()) {
      setErrorMessage("Full description is required");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", fullDescription.trim());
      
      const backendCategory = category === "Health Ideas with Honey" ? "healthy" : "benefits";
      formData.append("category", backendCategory);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      formData.append("isActive", "true");
      formData.append("status", "Published");

      const res = await fetch(`${API_BASE_URL}/api/benefits/add`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.message || "Failed to add health content");
      }

      const createdItem = json.data || {
        title,
        description: fullDescription,
        category: backendCategory,
        image: imagePreview,
        createdAt: new Date().toISOString(),
      };

      setSubmittedData(createdItem);
      setLoading(false);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      setLoading(false);
    }
  };

  // 🌟 SUCCESS PREVIEW PAGE (Dikhane ke baad 5 seconds mein redirect karega)
  if (submittedData) {
    const formattedDate = new Date(submittedData.createdAt || Date.now()).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    const formattedTime = new Date(submittedData.createdAt || Date.now()).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-8 text-slate-900 font-sans">
        <div className="mx-auto max-w-[1200px] space-y-6 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
          
          <div className="flex flex-col sm:flex-row items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-4 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-emerald-900">Honey benefit added successfully!</h3>
                <p className="text-xs text-emerald-700">Redirecting to benefit list in <span className="font-extrabold">{countdown}</span> seconds...</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/website-content/health-benefit")}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Go Now
            </button>
          </div>

          <p className="text-xs font-semibold text-slate-400">
            Website Management <span className="mx-1">›</span> Health Content <span className="mx-1">›</span> <span className="text-slate-800 font-bold">View Added Content</span>
          </p>

          <div className="flex flex-col lg:flex-row gap-8 items-start border-b border-slate-100 pb-8">
            <div className="w-full lg:w-[420px] h-[280px] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              <img src={submittedData.image || imagePreview} alt={submittedData.title} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-4 flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                {category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {submittedData.title}
              </h1>

              <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5"><Calendar size={15} className="text-slate-400" /> {formattedDate}</span>
                <span className="flex items-center gap-1.5"><Clock size={15} className="text-slate-400" /> {formattedTime}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Published
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-extrabold text-slate-900">Full Description</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line">
              {fullDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Created By</p>
              <p className="font-bold text-slate-900 mt-0.5">Admin</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Created On</p>
              <p className="font-bold text-slate-900 mt-0.5">{formattedDate}, {formattedTime}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Last Updated</p>
              <p className="font-bold text-slate-900 mt-0.5">{formattedDate}, {formattedTime}</p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 📝 NORMAL FORM UI
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 text-slate-900 font-sans">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-6 space-y-6">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Add Health Content
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Create and publish health ideas with honey or honey tips & benefits.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-xs">
            
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Content Category <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#D97706] appearance-none cursor-pointer"
                >
                  <option value="Health Ideas with Honey">Health Ideas with Honey</option>
                  <option value="Honey Tips & Benefits">Honey Tips & Benefits</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Title <span className="text-amber-600">*</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">{title.length}/100</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Morning Honey Water"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#D97706]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Full Description <span className="text-amber-600">*</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">{fullDescription.length}/5000</span>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span>Paragraph ▼</span>
                  <div className="h-4 w-px bg-slate-200" />
                  <span>B I U</span>
                  <div className="h-4 w-px bg-slate-200" />
                  <span>≡ ≡ ≡</span>
                </div>
                <textarea
                  rows={10}
                  placeholder="Write the complete content here..."
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  maxLength={5000}
                  className="w-full p-4 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none resize-none"
                />
              </div>
            </div>

          </div>

          {/* Right Column (Cover Image Only) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Cover Image <span className="text-amber-600">*</span>
              </label>

              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 transition-all flex flex-col items-center justify-center min-h-[220px]"
              >
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="text-slate-400 mb-2" />
                    <p className="text-xs font-extrabold text-slate-700">Click to upload image</p>
                    <p className="text-[10px] text-slate-400 mt-1">JPG, PNG, WEBP (Max. 5MB)</p>
                  </>
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files?.[0])}
                className="hidden"
              />
            </div>

          </div>

        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
          <button
            type="button"
            onClick={() => router.push("/website-content//health-benefit")}
            className="px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs sm:text-sm font-extrabold transition-all shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Publish
          </button>
        </div>

      </div>
    </div>
  );
}