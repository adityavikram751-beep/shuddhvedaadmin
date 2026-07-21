"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Pencil,
  Info,
  Banknote,
  ImageIcon,
  FileText,
  Truck,
  Eye,
  Calendar,
  Lock,
  Save,
  Rocket,
  ArrowLeft,
  Play,
  Star,
  RotateCcw,
} from "lucide-react";

export default function ReviewAndPublishPage() {
  const router = useRouter();

  // Current Step 5 State
  const currentStep = 5;

  // Publishing Option State: 'now' | 'schedule'
  const [publishOption, setPublishOption] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState("2026-07-07T10:00");

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Action Handlers
  const handleSaveDraft = () => {
    showToast("Product draft saved successfully!");
  };

  const handlePublish = () => {
    if (publishOption === "now") {
      showToast("🚀 Product published successfully!");
    } else {
      showToast("📅 Product scheduled for release!");
    }
    setTimeout(() => {
      router.push("/product");
    }, 1500);
  };

  const steps = [
    { id: 1, name: "Product Info", route: "/product/addproduct?step=1" },
    { id: 2, name: "Pricing", route: "/product/addproduct?step=2" },
    { id: 3, name: "Media", route: "/product/mediaproduct" },
    { id: 4, name: "Content", route: "/product/productcontent" },
    { id: 5, name: "Review & Publish", route: "#" },
  ];

  const defaultJarImg =
    "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen  text-slate-800 font-sans pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Review &amp; Publish
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Review all the information before publishing your product.
          </p>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[750px] px-2">
            {steps.map((step, idx) => {
              const isCompleted = step.id < 5;

              return (
                <React.Fragment key={step.id}>
                  <div
                    onClick={() => router.push(step.route)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full border-2 border-[#22c55e] bg-[#e8f8ee] text-[#22c55e] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        <Check size={16} className="stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#854d0e] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        5
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-bold text-slate-800">{step.name}</p>
                      <p
                        className={`text-[10px] font-semibold ${
                          isCompleted ? "text-[#22c55e]" : "text-[#854d0e]"
                        }`}
                      >
                        {isCompleted ? "Completed" : "Current Step"}
                      </p>
                    </div>
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="h-[2px] w-12 bg-[#22c55e] shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* MAIN 12-COLUMNS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 8 COLUMNS SECTION */}
          <div className="lg:col-span-8 space-y-6">
            {/* ROW 1: BASIC INFORMATION & PRICING */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-[#854d0e]" />
                    <h2 className="text-xs font-extrabold text-slate-800">
                      Basic Information
                    </h2>
                  </div>
                  <button
                    onClick={() => router.push("/product/addproduct?step=1")}
                    className="flex items-center gap-1 text-xs font-bold text-[#854d0e] hover:underline"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                </div>

                <div className="space-y-3 text-xs pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Product Name</span>
                    <span className="font-extrabold text-slate-800">Raw Honey 250g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Category</span>
                    <span className="font-extrabold text-slate-800">Honey</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">SKU</span>
                    <span className="font-extrabold text-slate-800">RH250</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Type</span>
                    <span className="font-extrabold text-slate-800">Single Product</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-slate-400 font-medium block">
                      Short Description
                    </span>
                    <p className="text-slate-600 font-medium italic text-[11px] leading-relaxed">
                      &quot;Pure and natural raw honey collected from the finest forest flowers.&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory Card */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Banknote size={16} className="text-[#854d0e]" />
                    <h2 className="text-xs font-extrabold text-slate-800">
                      Pricing &amp; Inventory
                    </h2>
                  </div>
                  <button
                    onClick={() => router.push("/product/addproduct?step=2")}
                    className="flex items-center gap-1 text-xs font-bold text-[#854d0e] hover:underline"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                </div>

                <div className="space-y-3 text-xs pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Selling Price</span>
                    <span className="font-black text-slate-900 text-sm">₹499.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">MRP</span>
                    <span className="font-semibold text-slate-400 line-through">₹599.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Discount</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#e8f8ee] text-[#16a34a] font-extrabold text-[10px]">
                      ₹100.00 (16.69%)
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Current Stock</span>
                    <span className="font-extrabold text-slate-800">18 Units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Alert Level</span>
                    <span className="font-extrabold text-red-500">5 Units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Warehouse</span>
                    <span className="font-extrabold text-slate-800">Main Warehouse</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: MEDIA OVERVIEW CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-[#854d0e]" />
                  <h2 className="text-xs font-extrabold text-slate-800">Media Overview</h2>
                </div>
                <button
                  onClick={() => router.push("/product/mediaproduct")}
                  className="flex items-center gap-1 text-xs font-bold text-[#854d0e] hover:underline"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                {/* Product Images Strip */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 mb-2">
                    Product Images (6/10)
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <img
                      src={defaultJarImg}
                      alt="Cover Thumb"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#d9730d] shadow-sm"
                    />
                    <div className="w-14 h-14 rounded-2xl bg-[#faf8f5] border border-slate-200" />
                    <div className="w-14 h-14 rounded-2xl bg-[#faf8f5] border border-slate-200" />
                    <div className="w-14 h-14 rounded-2xl bg-[#fff3e6] border border-amber-200 flex items-center justify-center text-xs font-extrabold text-[#d9730d]">
                      +3 more
                    </div>
                  </div>
                </div>

                {/* Product Video */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 mb-2">Product Video</p>
                  <div className="relative w-full h-20 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center group cursor-pointer">
                    <img
                      src={defaultJarImg}
                      alt="Video"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-slate-900 shadow-md">
                        <Play size={14} className="fill-slate-900 ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1.5 left-2 text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md">
                      Wild Honey Product Video.mp4
                    </span>
                  </div>
                </div>
              </div>

              {/* 360 View Indicator */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-700">
                  <RotateCcw size={14} className="text-[#d9730d]" />
                  360° Interactive View Ready
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  36 images uploaded for spin
                </span>
              </div>
            </div>

            {/* ROW 3: DETAILED CONTENT & SHIPPING INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Detailed Content Card */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#854d0e]" />
                    <h2 className="text-xs font-extrabold text-slate-800">
                      Detailed Content
                    </h2>
                  </div>
                  <button
                    onClick={() => router.push("/product/productcontent")}
                    className="flex items-center gap-1 text-xs font-bold text-[#854d0e] hover:underline"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                </div>

                <div className="space-y-3 text-xs pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Description</span>
                    <span className="font-extrabold text-emerald-600">Added</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Highlights</span>
                    <span className="font-extrabold text-slate-800">5 Points</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Ingredients</span>
                    <span className="font-extrabold text-emerald-600">Added</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Usage Instructions</span>
                    <span className="font-extrabold text-emerald-600">Added</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">FAQs</span>
                    <span className="font-extrabold text-slate-800">3 Questions</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-slate-400 font-medium">SEO Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#4d7c0f] h-full w-[85%]" />
                      </div>
                      <span className="font-extrabold text-slate-800">85/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Info Card */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-[#854d0e]" />
                    <h2 className="text-xs font-extrabold text-slate-800">
                      Shipping Info
                    </h2>
                  </div>
                  <button
                    onClick={() => router.push("/product/addproduct?step=2")}
                    className="flex items-center gap-1 text-xs font-bold text-[#854d0e] hover:underline"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                </div>

                <div className="space-y-3 text-xs pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Weight</span>
                    <span className="font-extrabold text-slate-800">0.250 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Dimensions</span>
                    <span className="font-extrabold text-slate-800">10 x 7 x 7 cm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Shipping Class</span>
                    <span className="font-extrabold text-slate-800">Standard</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Track Shipping</span>
                    <span className="font-extrabold text-emerald-600">Yes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLUMNS SIDEBAR SECTION */}
          <div className="lg:col-span-4 space-y-6">
            {/* STOREFRONT PREVIEW CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Eye size={15} className="text-slate-400" />
                <h3 className="text-xs font-extrabold text-slate-800">
                  Storefront Preview
                </h3>
              </div>

              {/* Cover Card */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3]">
                <img
                  src={defaultJarImg}
                  alt="Storefront Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#16a34a] text-white text-[9px] font-extrabold tracking-wide shadow">
                  In Stock
                </span>
              </div>

              {/* Summary Price & Rating */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#854d0e]">
                  HONEY
                </span>
                <div className="flex justify-between items-baseline">
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Raw Honey 250g
                  </h4>
                  <div className="text-right">
                    <p className="text-base font-black text-slate-900">₹499.00</p>
                    <p className="text-[10px] text-slate-400 line-through">₹599.00</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                  <div className="flex items-center text-amber-400">
                    <Star size={11} className="fill-amber-400" />
                    <Star size={11} className="fill-amber-400" />
                    <Star size={11} className="fill-amber-400" />
                    <Star size={11} className="fill-amber-400" />
                    <Star size={11} className="fill-amber-400" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    (128 reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* PUBLISHING OPTIONS CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-slate-400" />
                <h3 className="text-xs font-extrabold text-slate-800">
                  Publishing Options
                </h3>
              </div>

              <div className="space-y-3">
                {/* Option 1: Publish Now */}
                <div
                  onClick={() => setPublishOption("now")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    publishOption === "now"
                      ? "border-[#854d0e] bg-[#fefce8]/60"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                        publishOption === "now"
                          ? "border-[#854d0e] bg-[#854d0e]"
                          : "border-slate-300"
                      }`}
                    >
                      {publishOption === "now" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        Publish Now
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                        Product will be live immediately after confirmation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Option 2: Schedule for Later */}
                <div
                  onClick={() => setPublishOption("schedule")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    publishOption === "schedule"
                      ? "border-[#854d0e] bg-[#fefce8]/60"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                        publishOption === "schedule"
                          ? "border-[#854d0e] bg-[#854d0e]"
                          : "border-slate-300"
                      }`}
                    >
                      {publishOption === "schedule" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        Schedule for Later
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                        Set a specific date and time for automated release.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date/Time Selector */}
                {publishOption === "schedule" && (
                  <div className="pt-2 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Selected Time
                    </p>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50/40 text-xs font-bold text-slate-800">
                      <Calendar size={14} className="text-[#854d0e]" />
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="bg-transparent focus:outline-none w-full cursor-pointer text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PRE-PUBLISH CHECKLIST CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-3.5">
              <h3 className="text-xs font-extrabold text-slate-800">
                Pre-Publish Checklist
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50 shrink-0" />
                  <span className="font-bold text-slate-700">Product information added</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50 shrink-0" />
                  <span className="font-bold text-slate-700">Pricing and inventory set</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50 shrink-0" />
                  <span className="font-bold text-slate-700">Product images uploaded</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50 shrink-0" />
                  <span className="font-bold text-slate-700">Product content completed</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50 shrink-0" />
                  <span className="font-bold text-slate-700">SEO settings optimized</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50 shrink-0" />
                  <span className="font-bold text-slate-700">Product is ready to publish</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR (Exact Matches Image 303765) */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => router.push("/product/productcontent")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {/* Center Auto-Save Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <Lock size={13} className="text-emerald-600" />
            System will auto-save progress
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors px-2"
            >
              Save as Draft
            </button>
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm"
            >
              Publish Product
              <Rocket size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}