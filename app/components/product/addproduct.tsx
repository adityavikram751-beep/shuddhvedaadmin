"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Upload,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Package,
  Gift,
  Boxes,
  FileText,
  X,
  ArrowRight,
  Save,
  Check,
} from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Step State Management (Set to 2 so Step 1 is Completed, Step 2 is InProgress, Step 3 is Pending) ---
  const [currentStep, setCurrentStep] = useState(2);

  // --- Form States ---
  const [productName, setProductName] = useState("Raw Honey 250g");
  const [category, setCategory] = useState("Honey");
  const [sku, setSku] = useState("RH250");
  const [batchNo, setBatchNo] = useState("Raw Honey 250g");
  const [productType, setProductType] = useState<"Honey" | "Gift Box" | "Combo Pack">("Honey");
  const [shortDesc, setShortDesc] = useState(
    "Pure and natural raw honey collected from the finest flowers."
  );

  // --- Specifications ---
  const [weight, setWeight] = useState("250g");
  const [floralSource, setFloralSource] = useState("Multiflora");
  const [harvestRegion, setHarvestRegion] = useState("Sundarbans, West Bengal");
  const [harvestSeason, setHarvestSeason] = useState("Summer 2024");
  const [shelfLife, setShelfLife] = useState("24 Months");

  // --- Tags ---
  const [tags, setTags] = useState<string[]>(["Raw Honey"]);
  const [tagInput, setTagInput] = useState("");

  // --- Image Upload State ---
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // --- Toast Notification ---
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Restore Draft on Page Load
  useEffect(() => {
    const savedDraft = localStorage.getItem("product_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.productName) setProductName(parsed.productName);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.sku) setSku(parsed.sku);
        if (parsed.batchNo) setBatchNo(parsed.batchNo);
        if (parsed.productType) setProductType(parsed.productType);
        if (parsed.shortDesc) setShortDesc(parsed.shortDesc);
        if (parsed.weight) setWeight(parsed.weight);
        if (parsed.floralSource) setFloralSource(parsed.floralSource);
        if (parsed.harvestRegion) setHarvestRegion(parsed.harvestRegion);
        if (parsed.harvestSeason) setHarvestSeason(parsed.harvestSeason);
        if (parsed.shelfLife) setShelfLife(parsed.shelfLife);
        if (parsed.tags) setTags(parsed.tags);
        if (parsed.imagePreview) setImagePreview(parsed.imagePreview);
      } catch (e) {
        console.error("Draft error", e);
      }
    }
  }, []);

  // Save Draft Handler
  const handleSaveDraft = () => {
    const draftData = {
      productName,
      category,
      sku,
      batchNo,
      productType,
      shortDesc,
      weight,
      floralSource,
      harvestRegion,
      harvestSeason,
      shelfLife,
      tags,
      imagePreview,
      currentStep,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("product_draft", JSON.stringify(draftData));
    showToast("Product draft saved successfully!");
  };

  // Continue Handler -> Step Forward / Route Navigation
  const handleContinue = () => {
    handleSaveDraft();
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      showToast(`Moved to Step ${currentStep + 1}`);
      router.push(`/product/mediaproduct`);
    } else {
      showToast("Product published successfully!");
      router.push("/product/addproduct");
    }
  };

  // Image Upload Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        showToast("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("Image removed");
  };

  // Tags Handler
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Dynamic Checklist Logic
  const isBasicInfoDone = Boolean(productName && category);
  const isSkuDone = Boolean(sku && productType);
  const isDescDone = Boolean(shortDesc && shortDesc.trim().length > 10);
  const isSpecsDone = Boolean(weight && floralSource);

  // Stepper Steps Array
  const steps = [
    { id: 1, name: "Product Information" },
    { id: 2, name: "Pricing & Inventory" },
    { id: 3, name: "Media" },
    { id: 4, name: "Content" },
    { id: 5, name: "Review & Publish" },
  ];

  return (
    <div className="min-h-screen  text-slate-800 font-sans pb-12">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* TOP TITLE & PRIMARY ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Add New Product
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Add product details and set up your inventory.
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

        {/* STEP PROGRESS BAR WITH STEP 2 AS IN-PROGRESS & STEP 3 AS PENDING */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[750px] px-2">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center gap-3 ${!isCompleted && !isCurrent ? "opacity-50" : ""}`}>
                    
                    {/* Circle Icon Styling */}
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

        {/* MAIN TWO COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT FORM SECTION (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. BASIC DETAILS CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#d9730d] flex items-center justify-center">
                  <Package size={16} />
                </div>
                <h2 className="text-sm font-extrabold text-slate-800">Basic Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d9730d] focus:ring-1 focus:ring-[#d9730d]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#d9730d]"
                    >
                      <option value="Honey">Honey</option>
                      <option value="Gift Box">Gift Box</option>
                      <option value="Combo Pack">Combo Pack</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Product SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d9730d]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">SKU will be used to uniquely identify your product.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Batch no <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d9730d]"
                  />
                </div>
              </div>

              {/* Product Type Cards */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-2">
                  Product Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  
                  <div
                    onClick={() => setProductType("Honey")}
                    className={`cursor-pointer rounded-2xl border p-4 flex flex-col items-center justify-center text-center transition-all ${
                      productType === "Honey"
                        ? "border-[#d9730d] bg-amber-50/30"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100/60 text-[#d9730d] flex items-center justify-center mb-2">
                      <Package size={18} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${productType === "Honey" ? "border-[#d9730d] bg-[#d9730d]" : "border-slate-300"}`}>
                        {productType === "Honey" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      Honey
                    </div>
                  </div>

                  <div
                    onClick={() => setProductType("Gift Box")}
                    className={`cursor-pointer rounded-2xl border p-4 flex flex-col items-center justify-center text-center transition-all ${
                      productType === "Gift Box"
                        ? "border-[#d9730d] bg-amber-50/30"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-2">
                      <Gift size={18} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${productType === "Gift Box" ? "border-[#d9730d] bg-[#d9730d]" : "border-slate-300"}`}>
                        {productType === "Gift Box" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      Gift Box
                    </div>
                  </div>

                  <div
                    onClick={() => setProductType("Combo Pack")}
                    className={`cursor-pointer rounded-2xl border p-4 flex flex-col items-center justify-center text-center transition-all ${
                      productType === "Combo Pack"
                        ? "border-[#d9730d] bg-amber-50/30"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-2">
                      <Boxes size={18} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${productType === "Combo Pack" ? "border-[#d9730d] bg-[#d9730d]" : "border-slate-300"}`}>
                        {productType === "Combo Pack" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      Combo Pack
                    </div>
                  </div>

                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#d9730d]"
                />
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <span>This will be displayed as a short summary on the product page.</span>
                  <span>{shortDesc.length} / 150</span>
                </div>
              </div>
            </div>

            {/* 2. PRODUCT SPECIFICATIONS CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#d9730d] flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <h2 className="text-sm font-extrabold text-slate-800">Product Specifications</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Weight / Size <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#d9730d]"
                    >
                      <option value="250g">250g</option>
                      <option value="500g">500g</option>
                      <option value="1kg">1kg</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Floral Source</label>
                  <div className="relative">
                    <select
                      value={floralSource}
                      onChange={(e) => setFloralSource(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#d9730d]"
                    >
                      <option value="Multiflora">Multiflora</option>
                      <option value="Wild Forest">Wild Forest</option>
                      <option value="Mustard">Mustard</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Harvest Region</label>
                  <input
                    type="text"
                    value={harvestRegion}
                    onChange={(e) => setHarvestRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d9730d]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Harvest Season</label>
                  <input
                    type="text"
                    value={harvestSeason}
                    onChange={(e) => setHarvestSeason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d9730d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Shelf Life</label>
                <input
                  type="text"
                  value={shelfLife}
                  onChange={(e) => setShelfLife(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d9730d]"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Tags</label>
                <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white focus-within:border-[#d9730d]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[#a16207] text-xs font-bold"
                    >
                      {tag}
                      <X
                        size={12}
                        className="cursor-pointer hover:text-red-500"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add a tag..."
                    className="flex-1 text-xs font-medium text-slate-700 focus:outline-none px-1 py-1"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Add relevant tags to help manage your products.</p>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR PREVIEW SECTION (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* PRODUCT PREVIEW CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#d9730d]" />
                <h3 className="text-xs font-extrabold text-slate-800">Product Preview</h3>
              </div>

              {/* UPLOAD / PREVIEW BOX */}
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-52 group">
                  <img
                    src={imagePreview}
                    alt="Uploaded Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white text-slate-800 text-[11px] font-bold shadow-md hover:bg-slate-50"
                    >
                      Change
                    </button>
                    <button
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-bold shadow-md hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#f7f5f2] rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#d9730d] transition-colors group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 mb-3 shadow-sm group-hover:scale-105 transition-transform">
                    <Upload size={20} className="group-hover:text-[#d9730d]" />
                  </div>
                  <p className="text-xs font-bold text-slate-600">No image selected</p>
                  <span className="text-[11px] font-extrabold text-[#d9730d] hover:underline mt-1">
                    Upload Media
                  </span>
                </div>
              )}

              {/* Product Info Preview */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PRODUCT NAME</p>
                <p className="text-sm font-extrabold text-slate-800 leading-snug">
                  {productName || "Enter product name"}
                </p>

                <div className="pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PRICE</p>
                  <p className="text-xl font-black text-slate-900">₹0</p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                    Category: {category || "-"}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                    Type: {productType || "-"}
                  </span>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">STOCK</p>
                  <p className="text-xs font-medium text-slate-500">-</p>
                </div>
              </div>
            </div>

            {/* PUBLISHING CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-3 text-xs">
              <h3 className="font-extrabold text-slate-800 text-xs">Publishing</h3>
              
              <div className="flex items-center justify-between py-1">
                <span className="font-medium text-slate-500">Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-[#a16207] text-[10px] font-extrabold">
                  DRAFT
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="font-medium text-slate-500">Visibility</span>
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  <EyeOff size={13} className="text-slate-400" />
                  Hidden
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="font-medium text-slate-500">Date</span>
                <span className="font-bold text-slate-800">Immediately</span>
              </div>
            </div>

            {/* BEFORE YOU CONTINUE CHECKLIST */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-3">
              <h3 className="font-extrabold text-slate-800 text-xs">Before You Continue</h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  {isBasicInfoDone ? (
                    <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50 shrink-0" />
                  ) : (
                    <Circle size={16} className="text-slate-300 shrink-0" />
                  )}
                  <span className={`font-bold ${isBasicInfoDone ? "text-slate-700" : "text-slate-400"}`}>
                    Product Name &amp; Category
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isSkuDone ? (
                    <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50 shrink-0" />
                  ) : (
                    <Circle size={16} className="text-slate-300 shrink-0" />
                  )}
                  <span className={`font-bold ${isSkuDone ? "text-slate-700" : "text-slate-400"}`}>
                    Product SKU &amp; Type
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isDescDone ? (
                    <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50 shrink-0" />
                  ) : (
                    <Circle size={16} className="text-slate-300 shrink-0" />
                  )}
                  <span className={`font-medium ${isDescDone ? "text-slate-700 font-bold" : "text-slate-400"}`}>
                    Short Description
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isSpecsDone ? (
                    <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50 shrink-0" />
                  ) : (
                    <Circle size={16} className="text-slate-300 shrink-0" />
                  )}
                  <span className={`font-bold ${isSpecsDone ? "text-slate-700" : "text-slate-400"}`}>
                    Basic Specifications
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM BORDER CARD ACTION BAR */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
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