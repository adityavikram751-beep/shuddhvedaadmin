"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Check,
  CheckCircle2,
  Trash2,
  Pencil,
  Plus,
  RefreshCw,
  Eye,
  X,
  ArrowRight,
  ArrowLeft,
  Save,
  Play,
  Star,
  Image as ImageIcon,
  Video,
  RotateCcw,
  Equal,
} from "lucide-react";

interface UploadedImage {
  id: string;
  url: string;
  isCover?: boolean;
}

export default function ProductMediaPage() {
  const router = useRouter();

  // File Inputs Refs
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const view360InputRef = useRef<HTMLInputElement | null>(null);

  // --- Step State ---
  const currentStep = 3; // Step 3: Media (InProgress)

  // Default Mock Images
  const defaultJarImg =
    "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80";

  const [images, setImages] = useState<UploadedImage[]>([
    { id: "1", url: defaultJarImg, isCover: true },
    { id: "2", url: defaultJarImg },
    { id: "3", url: defaultJarImg },
    { id: "4", url: defaultJarImg },
    { id: "5", url: defaultJarImg },
    { id: "6", url: defaultJarImg },
  ]);

  // Video State
  const [video, setVideo] = useState<{
    name: string;
    size: string;
    duration: string;
    type: string;
    url: string;
  } | null>({
    name: "Wild Honey Product Video.mp4",
    size: "12.4 MB",
    duration: "00:45",
    type: "MP4",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
  });

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // 360 View Images Count State
  const [view360Count, setView360Count] = useState(0);

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // --- Handlers ---
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 10) {
      showToast("Maximum 10 images allowed!");
      return;
    }

    const newImgs: UploadedImage[] = Array.from(files).map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      isCover: images.length === 0 && idx === 0,
    }));

    setImages((prev) => [...prev, ...newImgs]);
    showToast(`${files.length} Image(s) uploaded!`);
  };

  const handleDeleteImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
    showToast("Image removed");
  };

  const handleSetCover = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img.id === id,
      }))
    );
    showToast("Cover image updated!");
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        duration: "00:30",
        type: file.name.split(".").pop()?.toUpperCase() || "MP4",
        url: URL.createObjectURL(file),
      });
      showToast("Video uploaded successfully!");
    }
  };

  const handle360ImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setView360Count((prev) => Math.min(prev + files.length, 36));
      showToast(`${files.length} 360° images added!`);
    }
  };

  const handleSaveDraft = () => {
    showToast("Product media draft saved successfully!");
  };

  const handleContinue = () => {
    handleSaveDraft();
    showToast("Moving to Content Step...");
    router.push("/product/productcontent");
  };

  const steps = [
    { id: 1, name: "Product Information" },
    { id: 2, name: "Pricing & Inventory" },
    { id: 3, name: "Media" },
    { id: 4, name: "Content" },
    { id: 5, name: "Review & Publish" },
  ];

  const coverImage = images.find((i) => i.isCover)?.url || defaultJarImg;

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-12">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImagesUpload}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleVideoUpload}
        accept="video/*"
        className="hidden"
      />
      <input
        type="file"
        ref={view360InputRef}
        onChange={handle360ImagesUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Video Preview Modal */}
      {isVideoModalOpen && video && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-xl w-full space-y-3 relative shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2 px-2">
              <p className="text-xs font-bold text-slate-800">{video.name}</p>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <video src={video.url} controls autoPlay className="w-full rounded-2xl max-h-[350px] bg-black" />
          </div>
        </div>
      )}

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* TOP TITLE BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Product Media
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Upload high-quality images and videos that customers will see on the product page.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm"
            >
              <Save size={14} className="text-slate-500" />
              Save as Draft
            </button>
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[750px] px-2">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center gap-3 ${!isCompleted && !isCurrent ? "opacity-50" : ""}`}>
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full border-2 border-[#22c55e] bg-[#e8f8ee] text-[#22c55e] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        <Check size={16} className="stroke-[3]" />
                      </div>
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition-all ${
                          isCurrent
                            ? "bg-[#d9730d] text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {step.id}
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-bold text-slate-800">{step.name}</p>
                      <p
                        className={`text-[10px] font-semibold ${
                          isCompleted
                            ? "text-[#22c55e]"
                            : isCurrent
                            ? "text-amber-600"
                            : "text-slate-400"
                        }`}
                      >
                        {isCompleted ? "Completed" : isCurrent ? "InProgress" : "Pending"}
                      </p>
                    </div>
                  </div>

                  {idx < steps.length - 1 && (
                    <div
                      className={`h-[2px] w-12 shrink-0 ${
                        currentStep > step.id ? "bg-[#d9730d]" : "bg-slate-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* MAIN 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT CONTENT AREA (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. PRODUCT IMAGES CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800">Product Images</h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Upload up to 10 high-quality images. First image will be your product cover.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  {images.length} / 10 Images Uploaded
                </span>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onClick={() => imageInputRef.current?.click()}
                className="bg-[#faf8f5] rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#d9730d] transition-all group"
              >
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#d9730d] flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                  <Upload size={20} />
                </div>
                <p className="text-xs font-extrabold text-slate-800">Drag &amp; drop images here</p>
                <p className="text-[10px] text-slate-400 font-medium my-1">or</p>
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-xl border border-amber-300 bg-white text-[#d9730d] text-xs font-bold hover:bg-amber-50 transition-colors shadow-sm"
                >
                  Browse Files
                </button>
                <p className="text-[9px] text-slate-400 font-medium mt-4 uppercase tracking-wider">
                  JPG, PNG, WEBP UP TO 5MB EACH • RECOMMENDED: 2000 X 2000 PX
                </p>
              </div>

              {/* Image Thumbnails Strip */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div key={img.id} className="space-y-1.5">
                      <div
                        className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all ${
                          img.isCover
                            ? "border-[#d9730d] ring-2 ring-amber-100"
                            : "border-slate-200"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`Product thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Action Bar Below Thumbnail */}
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-2 py-1 text-slate-400 text-xs">
                        {img.isCover ? (
                          <span
                            onClick={() => handleSetCover(img.id)}
                            className="w-5 h-5 rounded-lg bg-[#d9730d] text-white flex items-center justify-center text-[10px] font-bold cursor-pointer"
                            title="Cover Image"
                          >
                            1
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetCover(img.id)}
                            className="p-0.5 hover:text-slate-700 text-slate-400"
                            title="Set as Cover Image"
                          >
                            <Equal size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => handleSetCover(img.id)}
                          className="p-0.5 hover:text-slate-800 text-slate-400"
                          title="Edit"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="p-0.5 hover:text-red-500 text-slate-400"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. PRODUCT VIDEO CARD (Fixed layout: Buttons placed DIRECTLY BELOW the progress line) */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-slate-800">Product Video</h2>
                    <span className="text-[11px] text-slate-400 font-medium">(Optional)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Upload a product video to showcase your product better.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  {video ? "1 / 1 Video Uploaded" : "0 / 1 Video Uploaded"}
                </span>
              </div>

              {video ? (
                <div className="bg-[#faf8f5] rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-start gap-4">
                  {/* Left: Thumbnail with Play Overlay */}
                  <div
                    onClick={() => setIsVideoModalOpen(true)}
                    className="relative w-36 h-24 rounded-2xl overflow-hidden border border-slate-200 shrink-0 group cursor-pointer"
                  >
                    <img
                      src={defaultJarImg}
                      alt="Video Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center group-hover:bg-slate-900/40 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-slate-900 shadow-md">
                        <Play size={14} className="fill-slate-900 ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Right: Details + Progress Line + Action Buttons Underneath */}
                  <div className="flex-1 space-y-2 w-full">
                    {/* Title & Checkmark */}
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-extrabold text-slate-800">{video.name}</p>
                      <CheckCircle2 size={15} className="text-emerald-500 fill-emerald-50" />
                    </div>

                    {/* Metadata */}
                    <p className="text-[11px] text-slate-400 font-semibold">
                      {video.size} &nbsp;•&nbsp; {video.duration} &nbsp;•&nbsp; {video.type}
                    </p>

                    {/* Yellow/Amber Progress Line */}
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-[#d9730d] h-full w-full rounded-full" />
                    </div>

                    {/* Action Buttons Directly Below Progress Line (Exact Match Image 2e7548) */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        onClick={() => videoInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm"
                      >
                        <RefreshCw size={13} />
                        Replace
                      </button>
                      <button
                        onClick={() => setIsVideoModalOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm"
                      >
                        <Eye size={13} />
                        Preview
                      </button>
                      <button
                        onClick={() => {
                          setVideo(null);
                          showToast("Video removed");
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-xs font-bold text-red-500 transition-colors"
                      >
                        <X size={13} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="bg-[#faf8f5] rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#d9730d] transition-all"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#d9730d] flex items-center justify-center mb-2">
                    <Video size={18} />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Upload Product Video</p>
                  <span className="text-[10px] text-slate-400 font-medium">MP4, WEBM up to 50MB</span>
                </div>
              )}
            </div>

            {/* 3. 360° PRODUCT VIEW CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-slate-800">360° Product View</h2>
                    <span className="text-[11px] text-slate-400 font-medium">(Optional)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Upload multiple images from different angles to create a 360° product experience.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  {view360Count} / 36 Images Uploaded
                </span>
              </div>

              <div className="bg-[#faf8f5] rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-3">
                <button
                  onClick={() => view360InputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-800 transition-colors shadow-sm"
                >
                  <Plus size={16} className="text-[#d9730d]" />
                  Add image
                </button>
                <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">
                  RECOMMENDED: 12-16 IMAGES FOR BEST EXPERIENCE
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR PREVIEW & STATUS (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* PRODUCT PREVIEW CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-800">Product Preview</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#e8f8ee] text-[#16a34a] text-[10px] font-extrabold tracking-wide">
                  IN STOCK
                </span>
              </div>

              {/* Main Cover Image */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3]">
                <img
                  src={coverImage}
                  alt="Product Live Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-6 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                </div>
              </div>

              {/* Product Info Summary */}
              <div className="space-y-2 pt-1">
                <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                  Raw Honey 250g
                </h4>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-[#a16207] text-[10px] font-bold">
                    Honey
                  </span>
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-xl font-black text-slate-900">₹499.00</span>
                  <span className="text-xs font-semibold text-slate-400 line-through">₹599.00</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-500 text-[10px] font-extrabold">
                    16.69% OFF
                  </span>
                </div>

                {/* Rating & Stock */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center text-amber-400">
                      <Star size={12} className="fill-amber-400" />
                      <Star size={12} className="fill-amber-400" />
                      <Star size={12} className="fill-amber-400" />
                      <Star size={12} className="fill-amber-400" />
                      <Star size={12} className="text-slate-200 fill-slate-200" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">(128)</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">18 Units Available</span>
                </div>
              </div>
            </div>

            {/* UPLOAD STATUS CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-3.5 text-xs">
              <h3 className="font-extrabold text-slate-800 text-xs">Upload Status</h3>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 font-medium">
                  <ImageIcon size={14} className="text-slate-400" />
                  Images Uploaded
                </span>
                <span className="font-extrabold text-slate-800">{images.length} / 10</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 font-medium">
                  <Video size={14} className="text-slate-400" />
                  Video Uploaded
                </span>
                <span className="font-extrabold text-slate-800">{video ? "1 / 1" : "0 / 1"}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 font-medium">
                  <RotateCcw size={14} className="text-slate-400" />
                  360° Images
                </span>
                <span className="font-extrabold text-slate-800">{view360Count} / 36</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="flex items-center gap-2 font-medium text-slate-600">
                  <Check size={14} className="text-slate-400" />
                  Cover Image
                </span>
                <span className="font-extrabold text-emerald-600">Selected</span>
              </div>
            </div>

            {/* TIPS FOR BEST RESULTS */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-3">
              <h3 className="font-extrabold text-slate-800 text-xs">Tips for Best Results</h3>

              <div className="space-y-2.5 text-[11px] text-slate-600 font-medium">
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Use high-resolution images (2000x2000 px)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>White or light background works best</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Show product from multiple angles</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Ensure good lighting and focus</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Keep file size under 5MB for faster loading</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM BORDERED ACTION CARD */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => router.push("/product/productcontent")}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm"
            >
              <Save size={14} className="text-slate-500" />
              Save as Draft
            </button>
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}