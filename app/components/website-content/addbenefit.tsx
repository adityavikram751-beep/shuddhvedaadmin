"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2, CheckCircle2, Calendar, Clock, Check, FileVideo, Video, Play } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

export default function AddHealthContentForm() {
  const router = useRouter();
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  
  // ONLY Video File state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Success View State
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [countdown, setCountdown] = useState(5);

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

  const handleVideoChange = (file?: File) => {
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  // Submit Handler: POST /api/benefits/add (ONLY VIDEO)
  const handleSubmit = async () => {
    if (!videoFile) {
      setErrorMessage("Benefit video file is required");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("category", "honey");
      if (title.trim()) {
        formData.append("title", title.trim());
      }
      if (fullDescription.trim()) {
        formData.append("description", fullDescription.trim());
      }

      const res = await fetch(`${API_BASE_URL}/api/benefits/add`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.message || "Failed to upload health benefit video");
      }

      const createdItem = json.data || {
        title: title || "Honey Health Benefit Video",
        description: fullDescription,
        video_url: videoPreview,
        createdAt: new Date().toISOString(),
      };

      setSubmittedData(createdItem);
      setLoading(false);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      setLoading(false);
    }
  };

  // SUCCESS PREVIEW PAGE
  if (submittedData) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <Check size={28} className="stroke-[3]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-emerald-950">Health Benefit Video Uploaded!</h2>
            <p className="text-xs font-semibold text-emerald-700 mt-1">
              Redirecting to Video Benefits list in <span className="font-bold text-emerald-900">{countdown}s</span>...
            </p>
          </div>
        </div>

        {/* Video Card Preview */}
        <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm space-y-4 p-6">
          {(submittedData.video_url || videoPreview) && (
            <div className="w-full h-64 rounded-2xl overflow-hidden bg-black">
              <video controls src={submittedData.video_url || videoPreview} poster={submittedData.thumbnail_url} className="w-full h-full object-contain" />
            </div>
          )}
          <h1 className="text-xl font-extrabold text-slate-900">{submittedData.title || title}</h1>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">{submittedData.description || fullDescription}</p>

          <button
            onClick={() => router.push("/website-content/health-benefit")}
            className="w-full py-3 rounded-xl bg-[#2D3A1B] text-white font-extrabold text-xs cursor-pointer"
          >
            View All Video Benefits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Video className="text-[#D97706]" /> Add Health Benefit Video
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Upload MP4 / WEBM benefit video to <span className="font-mono text-[#D97706]">POST /api/benefits/add</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/website-content/health-benefit")}
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
        >
          Back to List
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold">
          {errorMessage}
        </div>
      )}

      {/* VIDEO UPLOAD FORM CARD (ONLY VIDEO) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-xs space-y-6">
        
        {/* Video Upload Box */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <FileVideo size={16} className="text-[#D97706]" /> Benefit Video File *
          </label>
          <div
            onClick={() => videoInputRef.current?.click()}
            className="border-2 border-dashed border-amber-200 hover:border-[#D97706] rounded-2xl p-6 text-center cursor-pointer bg-amber-50/20 transition-all flex flex-col items-center justify-center min-h-[220px]"
          >
            {videoPreview ? (
              <div className="relative w-full max-w-lg h-56 rounded-2xl overflow-hidden bg-black shadow-md">
                <video controls src={videoPreview} className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoFile(null);
                    setVideoPreview("");
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                  title="Remove Video"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <Upload size={36} className="text-[#D97706] mx-auto" />
                <p className="text-sm font-extrabold text-slate-800">Click to choose benefit video file</p>
                <p className="text-xs text-slate-400">MP4, WEBM, MOV video files supported (Cloudinary Video)</p>
              </div>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleVideoChange(e.target.files?.[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Video Title (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Daily Organic Honey Health Benefits..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#D97706] transition-colors"
          />
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Video Description (Optional)
          </label>
          <textarea
            rows={4}
            placeholder="Write details or summary about this video benefit..."
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            maxLength={5000}
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-[#D97706] resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/website-content/health-benefit")}
            className="px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-[#2D3A1B] hover:bg-[#1E2712] text-white text-xs sm:text-sm font-extrabold transition-all shadow-md cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Uploading Video...
              </>
            ) : (
              <>
                <Upload size={16} /> Upload Video
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}