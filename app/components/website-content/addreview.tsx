"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2, CheckCircle2, Calendar, Video, MessageSquare } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

export default function AddReviewPage() {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [reviewType, setReviewType] = useState<"Video Review" | "Comment Review">("Video Review");
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [shortReview, setShortReview] = useState("");

  // Files & Previews
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 🎯 Success View State (10 seconds preview before redirect)
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [countdown, setCountdown] = useState(10);

  // ⏱️ 10 seconds countdown timer & redirect logic
  useEffect(() => {
    if (!submittedData) return;

    if (countdown <= 0) {
      router.push("/website-content/customer-review");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [submittedData, countdown, router]);

  const handlePhotoChange = (file?: File) => {
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (file?: File) => {
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (reviewType === "Video Review" && !videoFile) {
      setErrorMessage("Please upload a video file");
      return;
    }
    if (reviewType === "Comment Review" && !customerName.trim()) {
      setErrorMessage("Customer name is required");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      let endpoint = "";

      if (reviewType === "Video Review") {
        endpoint = `${API_BASE_URL}/api/feedback/video/upload`;
        if (videoFile) {
          formData.append("video", videoFile);
        }
      } else {
        endpoint = `${API_BASE_URL}/api/reviews/reviews`;
        formData.append("fullname", customerName.trim());
        formData.append("rating", String(rating));
        formData.append("review", shortReview.trim());
        formData.append("role", "user");
        if (photoFile) {
          formData.append("image", photoFile);
        }
      }

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.message || "Failed to submit review");
      }

      // 🎯 Capturing the exact data entered by user so it displays properly on the view screen
      const createdItem = json.data || {
        customerName: customerName.trim(),
        rating: Number(rating),
        shortReview: shortReview.trim(),
        status: "Published",
        photo: photoPreview,
        video: videoPreview,
        createdAt: new Date().toISOString(),
      };

      setSubmittedData({
        ...createdItem,
        customerName: customerName.trim() || createdItem.fullname || createdItem.customerName,
        shortReview: shortReview.trim() || createdItem.review || createdItem.shortReview,
        rating: Number(rating) || createdItem.rating || 5,
        photo: photoPreview || createdItem.image || createdItem.profile_url,
        video: videoPreview || createdItem.video_url,
      });
      setLoading(false);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      setLoading(false);
    }
  };

  // 🌟 VIEW REVIEW SCREEN (Showing the exact entered data)
  if (submittedData) {
    const formattedDate = new Date(submittedData.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const formattedTime = new Date(submittedData.createdAt || Date.now()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-8 text-slate-900 font-sans">
        <div className="mx-auto max-w-[1320px] space-y-6 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
          
          <div className="flex flex-col sm:flex-row items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-4 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-emerald-900">Review added successfully!</h3>
                <p className="text-xs text-emerald-700">Redirecting to review list in <span className="font-extrabold">{countdown}</span> seconds...</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/website-content/customer-review")}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Go Now
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">Website Management › Customer Reviews › <span className="text-slate-800 font-bold">View Review</span></p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">View Review</h1>
              <p className="text-xs text-slate-500 font-medium">Review details and preview as it will appear on the website.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-slate-100 pb-8">
            
            {/* Left Media Preview */}
            <div className="lg:col-span-7 w-full h-[340px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center relative">
              {reviewType === "Video Review" && submittedData.video ? (
                <video src={submittedData.video} controls className="w-full h-full object-cover" />
              ) : submittedData.photo ? (
                <img src={submittedData.photo} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-slate-400">No Media Uploaded</span>
              )}
            </div>

            {/* Right Meta details with correct data */}
            <div className="lg:col-span-5 space-y-4 bg-slate-50/60 p-6 rounded-3xl border border-slate-200/60">
              <div className="flex justify-between items-center py-2 border-b border-slate-200/60 text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-2"><Video size={15} /> Review Type</span>
                <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">{reviewType}</span>
              </div>

              {reviewType === "Comment Review" && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200/60 text-xs">
                    <span className="text-slate-500 font-medium">Customer Name</span>
                    <span className="font-bold text-slate-900">{submittedData.customerName || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200/60 text-xs">
                    <span className="text-slate-500 font-medium">Rating</span>
                    <span className="text-amber-400">{"★".repeat(submittedData.rating)}{"☆".repeat(5 - submittedData.rating)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200/60 text-xs">
                    <span className="text-slate-500 font-medium">Short Review</span>
                    <span className="font-medium text-slate-700 text-right max-w-[200px] truncate">{submittedData.shortReview || "-"}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center py-2 border-b border-slate-200/60 text-xs">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Published</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200/60 text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-2"><Calendar size={15} /> Created On</span>
                <span className="font-bold text-slate-700">{formattedDate}, {formattedTime}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 📝 ADD REVIEW FORM UI
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 text-slate-900 font-sans">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-6 space-y-6">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Add Review</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Add video or comment review that will be shown on the website.</p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/60 shadow-xs space-y-8">
          
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Review Type <span className="text-amber-600">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div
                onClick={() => setReviewType("Video Review")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                  reviewType === "Video Review" ? "border-amber-400 bg-[#FFFbeb]/60 shadow-xs" : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <input type="radio" name="reviewType" checked={reviewType === "Video Review"} onChange={() => setReviewType("Video Review")} className="accent-[#D97706]" />
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Video size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Video Review</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Customer video testimonial</p>
                </div>
              </div>

              <div
                onClick={() => setReviewType("Comment Review")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                  reviewType === "Comment Review" ? "border-amber-400 bg-[#FFFbeb]/60 shadow-xs" : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <input type="radio" name="reviewType" checked={reviewType === "Comment Review"} onChange={() => setReviewType("Comment Review")} className="accent-[#D97706]" />
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Comment Review</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Customer text review</p>
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {reviewType === "Comment Review" && (
              <>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Customer Name <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Customer Photo <span className="text-amber-600">*</span>
                  </label>
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-4 text-center cursor-pointer bg-slate-50/50 transition-all flex flex-col items-center justify-center h-[110px]"
                  >
                    {photoPreview ? (
                      <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
                        <img src={photoPreview} alt="Photo" className="h-full object-contain" />
                      </div>
                    ) : (
                      <>
                        <Upload size={20} className="text-slate-400 mb-1" />
                        <p className="text-xs font-extrabold text-slate-700">Upload Photo</p>
                        <p className="text-[9px] text-slate-400">JPG, PNG (Max. 2MB)</p>
                      </>
                    )}
                  </div>
                  <input ref={photoInputRef} type="file" accept="image/*" onChange={(e) => handlePhotoChange(e.target.files?.[0])} className="hidden" />
                </div>
              </>
            )}

            {reviewType === "Video Review" && (
              <div className="lg:col-span-3">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Upload Video <span className="text-amber-600">*</span>
                </label>
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 transition-all flex flex-col items-center justify-center h-[140px]"
                >
                  {videoFile ? (
                    <p className="text-xs font-bold text-emerald-600 truncate">{videoFile.name}</p>
                  ) : (
                    <>
                      <Upload size={24} className="text-slate-400 mb-2" />
                      <p className="text-xs font-extrabold text-slate-700">Upload Video File</p>
                      <p className="text-[10px] text-slate-400">MP4, MOV (Max. 50MB)</p>
                    </>
                  )}
                </div>
                <input ref={videoInputRef} type="file" accept="video/*" onChange={(e) => handleVideoChange(e.target.files?.[0])} className="hidden" />
              </div>
            )}

          </div>

          {reviewType === "Comment Review" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Rating <span className="text-amber-600">*</span>
                </label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 bg-white">
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm font-bold text-slate-800 focus:outline-none bg-transparent cursor-pointer"
                  >
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★☆ (4 Stars)</option>
                    <option value={3}>★★★☆☆ (3 Stars)</option>
                    <option value={2}>★★☆☆☆ (2 Stars)</option>
                    <option value={1}>★☆☆☆☆ (1 Star)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Short Review <span className="text-slate-400">(Optional)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">{shortReview.length}/150</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Enter short review (optional)"
                  value={shortReview}
                  onChange={(e) => setShortReview(e.target.value)}
                  maxLength={150}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-[#D97706] resize-none"
                />
              </div>
            </div>
          )}

        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
          <button
            type="button"
            onClick={() => router.push("/website-content/customer-review")}
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