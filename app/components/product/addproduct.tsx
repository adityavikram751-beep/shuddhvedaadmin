"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Upload,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Maximize2,
  RefreshCw,
  Send,
  Video,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface Category {
  _id: string;
  name: string;
}

interface VariantInput {
  _id?: string;
  weight: string;
  mrp: string;
  sellingPrice: string;
  stock: string;
  sku: string;
  status: "Active" | "Inactive";
}

const DEFAULT_CATEGORIES: Category[] = [
  { _id: "cat_wild_forest", name: "Wild Forest Honey" },
  { _id: "cat_mustard", name: "Mustard Honey" },
  { _id: "cat_multiflora", name: "Multiflora Honey" },
  { _id: "cat_raw_organic", name: "Raw Organic Honey" },
];

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id"); // Extract ?id= from URL

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ---------- Step State ----------
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // ---------- Step 1: Basic Info ----------
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("Shuddh Veda Honey");
  const [categoryId, setCategoryId] = useState("");
  const [productType, setProductType] = useState<"honey" | "giftbox" | "combopack">("honey");
  const [floralSource, setFloralSource] = useState("");
  const [description, setDescription] = useState("");
  const [keyBenefits, setKeyBenefits] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [manufacturerInfo, setManufacturerInfo] = useState("");
  const [shelfLife, setShelfLife] = useState("");
  const [storageInstructions, setStorageInstructions] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("India");
  const [fssaiLicense, setFssaiLicense] = useState("");
  const [batchNumber, setBatchNumber] = useState("");

  // ---------- Step 2: Media ----------
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoName, setVideoName] = useState("");

  // ---------- Step 3: Variants ----------
  const [variants, setVariants] = useState<VariantInput[]>([
    { weight: "250", mrp: "399", sellingPrice: "349", stock: "150", sku: "PMH-250", status: "Active" },
    { weight: "500", mrp: "699", sellingPrice: "649", stock: "90", sku: "PMH-500", status: "Active" },
  ]);
  const [newVariant, setNewVariant] = useState<VariantInput>({
    weight: "",
    mrp: "",
    sellingPrice: "",
    stock: "",
    sku: "",
    status: "Active",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // ---------- Product ID State ----------
  const [productId, setProductId] = useState<string | null>(null);

  // ---------- UI Helpers ----------
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 🌐 1. FETCH CATEGORIES
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
        const res = await fetch(`${API_BASE_URL}/api/category/all-category`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const data = await res.json();
          const list = data.data || data.categories || data || [];
          if (Array.isArray(list) && list.length > 0) {
            const formatted = list.map((item: any) => ({
              _id: item._id || item.id,
              name: item.category_name || item.name || item.title || "Category",
            }));
            setCategories(formatted);
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 🌐 2. FETCH EXISTING PRODUCT DETAILS IF EDIT MODE (`?id=...`)
  useEffect(() => {
    if (!editId) return;

    setIsEditMode(true);
    setProductId(editId);

    const fetchProductForEdit = async () => {
      setFetchingDetails(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${editId}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to load product details");

        const data = await res.json();
        const p = data.data || data.product || data;

        // Auto-fill Step 1 Form Fields
        setProductName(p.product_name || p.name || "");
        setBrand(p.brand || "Shuddh Veda Honey");
        setCategoryId(p.categoryId?._id || p.categoryId || "");
        setProductType(p.product_type || "honey");
        setFloralSource(p.floral_source || "");
        setDescription(p.description || "");
        setKeyBenefits(p.key_benefits || "");
        setIngredients(p.ingredients || "");
        setManufacturerInfo(p.manufacturer_information || "");
        setShelfLife(p.shelf_life || "");
        setStorageInstructions(p.storage_instructions || "");
        setCountryOfOrigin(p.country_of_origin || "India");
        setFssaiLicense(p.fssai_license_number || "");
        setBatchNumber(p.batch_number || "");

        // Auto-fill Images
        if (p.imageDocumentId && Array.isArray(p.imageDocumentId)) {
          const primaryImg = p.imageDocumentId.find((img: any) => img.is_primary);
          if (primaryImg) setThumbnailPreview(primaryImg.image_url);

          const gallery = p.imageDocumentId
            .filter((img: any) => !img.is_primary)
            .map((img: any) => img.image_url);
          setGalleryPreviews(gallery);
        }

        // Auto-fill Video
        if (p.videoDocumentId) {
          const vid = Array.isArray(p.videoDocumentId) ? p.videoDocumentId[0] : p.videoDocumentId;
          if (vid?.video_url) {
            setVideoPreview(vid.video_url);
            setVideoName("Uploaded Product Video");
          }
        }

        // Auto-fill Variants
        if (p.variantDocumentId && Array.isArray(p.variantDocumentId)) {
          const loadedVariants: VariantInput[] = p.variantDocumentId.map((v: any) => ({
            _id: v._id,
            weight: String(v.weight || ""),
            mrp: String(v.mrp || ""),
            sellingPrice: String(v.price || v.sellingPrice || ""),
            stock: String(v.available_stock || v.stock || "0"),
            sku: v.sku || "",
            status: v.stock_status === "out_of_stock" ? "Inactive" : "Active",
          }));
          setVariants(loadedVariants);
        }

        showToast("Product details loaded!");
      } catch (err: any) {
        console.error("Error fetching product for edit:", err);
        showToast("Failed to populate product data");
      } finally {
        setFetchingDetails(false);
      }
    };

    fetchProductForEdit();
  }, [editId]);

  // Step Validation
  const validateStep1 = () => {
    if (!productName.trim()) { showToast("Product Name is required"); return false; }
    if (!categoryId && categories.length > 0) { showToast("Please select a category"); return false; }
    if (!description.trim()) {
      showToast("Description is required");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!thumbnail && !thumbnailPreview) {
      showToast("Please upload a thumbnail image");
      return false;
    }
    return true;
  };

  // 🎯 STEP 1: CREATE OR UPDATE PRODUCT
  const handleCreateOrUpdateProduct = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    try {
      const payload = {
        product_name: productName,
        brand,
        product_type: productType,
        floral_source: floralSource,
        description,
        key_benefits: keyBenefits,
        ingredients,
        manufacturer_information: manufacturerInfo,
        shelf_life: shelfLife,
        storage_instructions: storageInstructions,
        country_of_origin: countryOfOrigin,
        fssai_license_number: fssaiLicense,
        batch_number: batchNumber,
        categoryId,
      };

      const url = isEditMode && productId
        ? `${API_BASE_URL}/api/products/${productId}`
        : `${API_BASE_URL}/api/products`;

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save product details");
      }

      const data = await res.json();
      const savedId = data.data?._id || data._id || productId || "PRD-00021";
      setProductId(savedId);

      showToast(isEditMode ? "Product updated successfully!" : "Product created successfully!");
      setCurrentStep(2);
    } catch (err: any) {
      console.error(err);
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: UPLOAD MEDIA
  const handleUploadMedia = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      showToast("Media step completed!");
      setCurrentStep(3);
    } catch (err: any) {
      showToast(err.message || "Error saving media");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: PUBLISH
  const handlePublishVariants = async () => {
    setLoading(true);
    try {
      showToast("All changes saved & published!");
      router.push("/product");
    } catch (err: any) {
      showToast("Error publishing variants");
    } finally {
      setLoading(false);
    }
  };

  // Variant Handlers
  const addVariant = () => {
    if (!newVariant.weight || !newVariant.mrp || !newVariant.sellingPrice || !newVariant.stock || !newVariant.sku) {
      showToast("Please fill all variant fields");
      return;
    }
    if (editingIndex !== null) {
      const updated = [...variants];
      updated[editingIndex] = { ...newVariant };
      setVariants(updated);
      setEditingIndex(null);
    } else {
      setVariants([...variants, { ...newVariant }]);
    }
    setNewVariant({ weight: "", mrp: "", sellingPrice: "", stock: "", sku: "", status: "Active" });
  };

  const editVariant = (index: number) => {
    setNewVariant(variants[index]);
    setEditingIndex(index);
  };

  const deleteVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Media Handlers
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files);
      setGalleryImages((prev) => [...prev, ...validFiles]);
      setGalleryPreviews((prev) => [
        ...prev,
        ...validFiles.map((f) => URL.createObjectURL(f)),
      ]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoName(file.name);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setVideoName("");
  };

  if (fetchingDetails) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center gap-2">
        <Loader2 size={32} className="animate-spin text-[#D97706]" />
        <p className="text-xs font-bold text-slate-600">Loading Product Data for Edit...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#1E293B] font-sans pb-20">

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-8 space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            {isEditMode ? "Edit Product Details" : "Create Product"}
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            {isEditMode
              ? `Editing Product ID: ${productId}`
              : "Add a new honey product with complete details"}
          </p>
        </div>

        {/* STEP 1: BASIC INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-6">
            
            {/* Card 1: Basic Information */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A]">Basic Information</h2>
                <p className="text-[11px] text-[#64748B]">Fill or edit the basic details of your product</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                    PRODUCT NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                    BRAND <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                    CATEGORY <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-[#D97706] cursor-pointer"
                    >
                      <option value="" className="bg-white text-slate-900 font-medium">
                        {categoriesLoading ? "Loading Categories..." : "Select Category"}
                      </option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id} className="bg-white text-slate-900 font-medium">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                    PRODUCT TYPE <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value as any)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-[#D97706] cursor-pointer"
                    >
                      <option value="honey" className="bg-white text-slate-900 font-medium">Honey</option>
                      <option value="giftbox" className="bg-white text-slate-900 font-medium">Gift Box</option>
                      <option value="combopack" className="bg-white text-slate-900 font-medium">Combo Pack</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                  FLORAL SOURCE
                </label>
                <input
                  type="text"
                  value={floralSource}
                  onChange={(e) => setFloralSource(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#D97706]"
                  placeholder="Enter floral source"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                  DESCRIPTION <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#D97706]"
                  placeholder="Enter product description"
                />
              </div>
            </div>

            {/* Card 2: Honey Details */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A]">Honey Details</h2>
                <p className="text-[11px] text-[#64748B]">Provide detailed specs about the product</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                    INGREDIENTS <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter ingredients"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                    KEY BENEFITS <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={keyBenefits}
                    onChange={(e) => setKeyBenefits(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter key benefits"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                    MANUFACTURER INFORMATION
                  </label>
                  <input
                    type="text"
                    value={manufacturerInfo}
                    onChange={(e) => setManufacturerInfo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter manufacturer info"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                    SHELF LIFE
                  </label>
                  <input
                    type="text"
                    value={shelfLife}
                    onChange={(e) => setShelfLife(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#D97706]"
                    placeholder="e.g. 24 months"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                    STORAGE INSTRUCTIONS
                  </label>
                  <textarea
                    rows={2}
                    value={storageInstructions}
                    onChange={(e) => setStorageInstructions(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter storage instructions"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                    COUNTRY OF ORIGIN
                  </label>
                  <div className="relative">
                    <select
                      value={countryOfOrigin}
                      onChange={(e) => setCountryOfOrigin(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-[#D97706] cursor-pointer"
                    >
                      <option value="India" className="bg-white text-slate-900 font-medium">India</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                    FSSAI LICENSE NUMBER
                  </label>
                  <input
                    type="text"
                    value={fssaiLicense}
                    onChange={(e) => setFssaiLicense(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter FSSAI License"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#475569] tracking-wider uppercase mb-1.5">
                    BATCH NUMBER
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter Batch Number"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => router.push("/product")}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateOrUpdateProduct}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
              >
                {loading ? "Saving..." : "Save & Next"} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MEDIA IMAGE */}
        {currentStep === 2 && (
          <div className="space-y-6">

            {/* Product Summary Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumb" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🍯</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[#0F172A] truncate">
                  {productName || "Product Name"}
                </h3>
                <div className="text-[11px] text-slate-500 space-y-0.5 mt-0.5">
                  <p>Product ID: <span className="font-semibold text-slate-700">{productId || "PRD-00021"}</span></p>
                  <p>Brand: <span className="font-semibold text-slate-700">{brand}</span></p>
                </div>
              </div>
            </div>

            {/* Product Thumbnail Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
              <h2 className="text-xs font-bold text-[#0F172A]">Product Thumbnail</h2>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#FCD34D] bg-[#FFFBEB]/30 rounded-2xl p-8 text-center cursor-pointer hover:bg-[#FFFBEB]/60 transition-colors"
              >
                {thumbnailPreview ? (
                  <div className="relative inline-block">
                    <img src={thumbnailPreview} alt="Thumbnail Preview" className="max-h-36 rounded-xl shadow-sm" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setThumbnail(null); setThumbnailPreview(null); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={28} className="mx-auto text-[#D97706]" />
                    <p className="text-xs font-semibold text-slate-700">Upload Thumbnail Image</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleThumbnailChange} className="hidden" />
            </div>

            {/* Gallery Images Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
              <h2 className="text-xs font-bold text-[#0F172A]">Gallery Images</h2>
              <div className="flex flex-wrap gap-4">
                <div
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-32 h-24 rounded-2xl border-2 border-dashed border-[#FCD34D] bg-[#FFFBEB]/30 flex flex-col items-center justify-center cursor-pointer hover:bg-[#FFFBEB]/60 transition-colors"
                >
                  <Plus size={18} className="text-[#D97706] mb-1" />
                  <span className="text-[11px] font-bold text-[#D97706]">Add Image</span>
                </div>

                {galleryPreviews.map((src, idx) => (
                  <div key={idx} className="relative w-36 h-24 rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <input type="file" ref={galleryInputRef} accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
            </div>

            {/* Product Video Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
              <h2 className="text-xs font-bold text-[#0F172A]">Product Video</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-[#FCD34D] bg-[#FFFBEB]/30 rounded-2xl p-6 text-center cursor-pointer hover:bg-[#FFFBEB]/60 flex flex-col items-center justify-center min-h-[120px]"
                >
                  <Video size={18} className="text-[#D97706] mb-1" />
                  <p className="text-xs font-bold text-slate-700">Upload Product Video</p>
                </div>

                {videoPreview && (
                  <div className="border border-slate-200 rounded-2xl p-3 flex gap-3 items-center bg-slate-50/50">
                    <video src={videoPreview} className="w-28 h-20 bg-slate-900 rounded-xl object-cover" />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{videoName}</p>
                      <button
                        onClick={removeVideo}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-red-200 bg-red-50 text-[10px] font-bold text-red-600 hover:bg-red-100 cursor-pointer"
                      >
                        <Trash2 size={10} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <input type="file" ref={videoInputRef} accept="video/*" onChange={handleVideoChange} className="hidden" />
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={handleUploadMedia}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
              >
                Save & Next <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ADD PRODUCT VARIANTS */}
        {currentStep === 3 && (
          <div className="space-y-6">

            {/* Product Variants Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0F172A]">Product Variants</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    setNewVariant({ weight: "", mrp: "", sellingPrice: "", stock: "", sku: "", status: "Active" });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] cursor-pointer"
                >
                  <Plus size={14} /> Add Variant
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="py-3 px-4">WEIGHT</th>
                      <th className="py-3 px-4">MRP (₹)</th>
                      <th className="py-3 px-4">SELLING PRICE (₹)</th>
                      <th className="py-3 px-4">STOCK</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{v.weight}g</td>
                        <td className="py-3.5 px-4 text-slate-600">{v.mrp}</td>
                        <td className="py-3.5 px-4 text-slate-600">{v.sellingPrice}</td>
                        <td className="py-3.5 px-4 text-slate-600">{v.stock}</td>
                        <td className="py-3.5 px-4 text-slate-600">{v.sku}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            v.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-500"
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => editVariant(idx)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteVariant(idx)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add New Variant Form Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[#0F172A]">
                {editingIndex !== null ? "Edit Variant" : "Add New Variant"}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <input
                  type="text"
                  placeholder="Weight (g)"
                  value={newVariant.weight}
                  onChange={(e) => setNewVariant({ ...newVariant, weight: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D97706]"
                />
                <input
                  type="number"
                  placeholder="MRP (₹)"
                  value={newVariant.mrp}
                  onChange={(e) => setNewVariant({ ...newVariant, mrp: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D97706]"
                />
                <input
                  type="number"
                  placeholder="Selling Price (₹)"
                  value={newVariant.sellingPrice}
                  onChange={(e) => setNewVariant({ ...newVariant, sellingPrice: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D97706]"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D97706]"
                />
                <input
                  type="text"
                  placeholder="SKU"
                  value={newVariant.sku}
                  onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D97706]"
                />
                <select
                  value={newVariant.status}
                  onChange={(e) => setNewVariant({ ...newVariant, status: e.target.value as any })}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#D97706]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={addVariant}
                  className="px-5 py-2 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] cursor-pointer"
                >
                  Save Variant
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={handlePublishVariants}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
              >
                Publish Product <Send size={14} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D97706]" size={32} />
      </div>
    }>
      <AddProductForm />
    </Suspense>
  );
}