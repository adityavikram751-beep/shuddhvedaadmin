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
  Video,
  Loader2,
  Send,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

// ---------- Types ----------
interface Category {
  _id: string;
  name: string;
}

interface VariantInput {
  _id?: string;
  weight: string;
  unit: "g" | "kg";
  mrp: string;
  sellingPrice: string;
  discountType: "percentage" | "fixed";
  tax: string;
  stock: string;
  lowStockAlert: string;
  sku: string;
  barcode: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  allowBackorders: boolean;
}

interface GalleryItem {
  id?: string;
  preview: string;
  file?: File;
}

// ---------- Main Component ----------
function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ---------- Step State ----------
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // ---------- Step 1: Basic Info ----------
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("SudhVeda Honey");
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
  const [thumbnailImageId, setThumbnailImageId] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [removedGalleryImageIds, setRemovedGalleryImageIds] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoName, setVideoName] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);

  // ---------- Step 3: Variants ----------
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const emptyVariant: VariantInput = {
    weight: "",
    unit: "g",
    mrp: "",
    sellingPrice: "",
    discountType: "percentage",
    tax: "GST 5%",
    stock: "",
    lowStockAlert: "",
    sku: "",
    barcode: "",
    stockStatus: "in_stock",
    allowBackorders: false,
  };
  const [newVariant, setNewVariant] = useState<VariantInput>({
    ...emptyVariant,
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [variantLoading, setVariantLoading] = useState(false);

  // ---------- Product ID ----------
  const [productId, setProductId] = useState<string | null>(null);

  // ---------- UI Helpers ----------
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const getId = (item: any) => item?._id || item?.id || item?.imageId || item?.videoId || null;

  const normalizeAssetUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
    return `${API_BASE_URL}/${url.replace(/^\//, "")}`;
  };

  const pickImageUrl = (image: any) =>
    normalizeAssetUrl(image?.image_url || image?.url || image?.path || image?.location || "");

  const pickVideoUrl = (video: any) =>
    normalizeAssetUrl(video?.video_url || video?.url || video?.path || video?.location || "");

  const extractList = (data: any, keys: string[]) => {
    if (Array.isArray(data)) return data;
    for (const key of keys) {
      const value = data?.[key] || data?.data?.[key];
      if (Array.isArray(value)) return value;
    }
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  // ---------- Fetch Categories ----------
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/category/all-category`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        const rawList = Array.isArray(data)
          ? data
          : data.data || data.categories || data.items || [];
        const list: Category[] = rawList
          .map((cat: any) => ({
            _id: cat._id || cat.id || "",
            name: cat.name || cat.category_name || cat.title || cat.categoryName || "",
          }))
          .filter((cat: Category) => cat._id && cat.name);
        setCategories(list);
        if (list.length > 0 && !editId) setCategoryId(list[0]._id);
      } catch (err) {
        console.error(err);
        showToast("Could not load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [editId]);

  // ---------- Fetch Product Details for Edit ----------
  useEffect(() => {
    if (!editId) return;

    setIsEditMode(true);
    setProductId(editId);

    const fetchProduct = async () => {
      setFetchingDetails(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${editId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        const p = data.data || data.product || data;

        // --- Step 1 fields ---
        setProductName(p.product_name || p.name || "");
        setBrand(p.brand || "SudhVeda Honey");
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

        // --- Images ---
        const images = extractList(p, ["imageDocumentId", "images", "image"]);
        if (images.length > 0) {
          const primary = images.find((img: any) => img?.is_primary || img?.type === "thumbnail") || images[0];
          const primaryUrl = pickImageUrl(primary);
          setThumbnailImageId(getId(primary));
          if (primaryUrl) setThumbnailPreview(primaryUrl);

          const gallery = images
            .filter((img: any) => getId(img) !== getId(primary))
            .map((img: any) => ({
              id: getId(img) || undefined,
              preview: pickImageUrl(img),
            }))
            .filter((img: GalleryItem) => Boolean(img.preview));
          setGalleryItems(gallery);
          setGalleryPreviews(gallery.map((img: GalleryItem) => img.preview));
        }

        // --- Video ---
        let didApplyVideo = false;
        const applyVideo = (vid: any) => {
          const url = pickVideoUrl(vid);
          if (!url) return;
          setVideoPreview(url);
          setVideoName(vid?.name || vid?.filename || vid?.originalname || "Existing Product Video");
          setVideoId(getId(vid));
          didApplyVideo = true;
        };

        if (!didApplyVideo && p.videoDocumentId) {
          const vid = Array.isArray(p.videoDocumentId) ? p.videoDocumentId[0] : p.videoDocumentId;
          applyVideo(vid);
        }

        // --- Variants ---
        if (p.variantDocumentId && Array.isArray(p.variantDocumentId)) {
          const loaded: VariantInput[] = p.variantDocumentId.map((v: any) => ({
            _id: v._id,
            weight: String(v.weight || ""),
            unit: v.unit === "kg" ? "kg" : "g",
            mrp: String(v.mrp || ""),
            sellingPrice: String(v.sellingPrice || v.price || v.variant_price || ""),
            discountType: v.discount_type === "fixed" ? "fixed" : "percentage",
            tax: v.tax || "GST 5%",
            stock: String(v.available_stock || v.stock || "0"),
            lowStockAlert: String(v.low_stock_alert || ""),
            sku: v.sku || "",
            barcode: v.barcode || "",
            stockStatus: v.stock_status || "in_stock",
            allowBackorders: Boolean(v.allow_backorders),
          }));
          setVariants(loaded);
        }

        showToast("Product loaded for editing");
      } catch (err: any) {
        console.error(err);
        showToast("Failed to load product data");
      } finally {
        setFetchingDetails(false);
      }
    };

    fetchProduct();
  }, [editId]);

  // ---------- Step Validations ----------
  const validateStep1 = () => {
    if (!productName.trim()) { showToast("Product Name is required"); return false; }
    if (!categoryId) { showToast("Please select a category"); return false; }
    if (!description.trim()) { showToast("Description is required"); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!thumbnail && !thumbnailPreview && galleryPreviews.length === 0) {
      showToast("Please upload at least one product image");
      return false;
    }
    return true;
  };

  // ---------- STEP 1: Create or Update Product (FIXED) ----------
  const handleSaveProduct = async () => {
    if (!validateStep1()) return;

    if (isEditMode && productId) {
      showToast("Product loaded. Update media and variants.");
      setCurrentStep(2);
      return;
    }

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

      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server error: ${res.status}`);
      }

      const data = await res.json();
      // ✅ Extract product ID safely
      const savedId = data.data?._id || data._id || data.product?._id || data.productId || productId;
      if (!savedId) {
        throw new Error("Product created but no ID returned");
      }

      // ✅ Verify product actually exists (prevents 404 later)
      const verifyRes = await fetch(`${API_BASE_URL}/api/products/${savedId}`, {
        credentials: "include",
      });
      if (!verifyRes.ok) {
        throw new Error(`Product ID ${savedId} not found. Creation may have failed.`);
      }

      setProductId(savedId);
      showToast(isEditMode ? "Product updated" : "Product created");
      setCurrentStep(2);
    } catch (err: any) {
      console.error("Save error:", err);
      showToast(err.message || "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  // ---------- STEP 2: Upload Media ----------
  const handleUploadMedia = async () => {
    if (!validateStep2()) return;
    if (!productId) {
      showToast("Product ID missing. Please go back and save product first.");
      return;
    }

    setLoading(true);
    try {
      const uploadImage = async (file: File, type: "thumbnail" | "gallery", imageId?: string | null) => {
        const formData = new FormData();
        formData.append("images", file);

        const isUpdate = Boolean(isEditMode && imageId);
        const res = await fetch(
          isUpdate
            ? `${API_BASE_URL}/api/products/${productId}/images/${imageId}`
            : `${API_BASE_URL}/api/products/${productId}/images`,
          {
            method: isUpdate ? "PUT" : "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Product image upload failed: ${res.status} - ${err}`);
        }

        return res.json().catch(() => ({}));
      };

      // 1. Upload or update the first product image (if new file selected)
      if (thumbnail) {
        const data = await uploadImage(thumbnail, "thumbnail", thumbnailImageId);
        const savedImage = data.data || data.image || data;
        const nextId = getId(savedImage);
        if (nextId) setThumbnailImageId(nextId);
        setThumbnail(null);
      }

      // 2. Upload new gallery images. In edit mode, replace removed slots first.
      const newGalleryItems = galleryItems.filter((item) => item.file);
      const fallbackGalleryFiles = galleryItems.length ? [] : galleryImages;
      const galleryFiles = newGalleryItems.length
        ? newGalleryItems.map((item) => item.file as File)
        : fallbackGalleryFiles;

      const replaceQueue = [...removedGalleryImageIds];
      for (const file of galleryFiles) {
        const replaceImageId = replaceQueue.shift();
        await uploadImage(file, "gallery", replaceImageId);
      }
      setRemovedGalleryImageIds([]);
      setGalleryImages([]);
      setGalleryItems((prev) => prev.map((item) => ({ id: item.id, preview: item.preview })));

      // 3. Replace video by deleting the old one first, then uploading the new file.
      if (videoFile) {
        if (videoId) {
          const deleteRes = await fetch(`${API_BASE_URL}/api/videos/${productId}/${videoId}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!deleteRes.ok && deleteRes.status !== 404) {
            const err = await deleteRes.text();
            throw new Error(`Old video deletion failed: ${deleteRes.status} - ${err}`);
          }
        }

        const formData = new FormData();
        formData.append("video", videoFile);

        const res = await fetch(`${API_BASE_URL}/api/videos/upload/${productId}`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Video upload failed: ${res.status} - ${err}`);
        }
        const data = await res.json();
        const savedVideo = data.data || data.video || data;
        const nextVideoId = getId(savedVideo);
        if (nextVideoId) setVideoId(nextVideoId);
        const nextVideoUrl = pickVideoUrl(savedVideo);
        if (nextVideoUrl) setVideoPreview(nextVideoUrl);
        setVideoFile(null);
      }

      showToast("Media uploaded successfully");
      setCurrentStep(3);
    } catch (err: any) {
      showToast(err.message || "Media upload error");
    } finally {
      setLoading(false);
    }
  };

  // ---------- STEP 3: Variant Management ----------
  const addVariant = async () => {
    if (!productId) {
      showToast("Product ID missing. Please save product first.");
      return;
    }
    if (editingIndex !== null) {
      if (!newVariant.mrp || !newVariant.sellingPrice || !newVariant.stock || !newVariant.lowStockAlert) {
        showToast("Please fill MRP, price, stock and low stock alert");
        return;
      }
    } else if (!newVariant.weight || !newVariant.mrp || !newVariant.sellingPrice || !newVariant.stock || !newVariant.sku) {
      showToast("Please fill all variant fields");
      return;
    }

    setVariantLoading(true);
    try {
      const stockStatus = newVariant.stockStatus || (
        Number(newVariant.stock) <= Number(newVariant.lowStockAlert || 0)
          ? "low_stock"
          : "in_stock"
      );
      const payload = {
        weight: Number(newVariant.weight),
        unit: newVariant.unit,
        mrp: Number(newVariant.mrp),
        price: Number(newVariant.sellingPrice),
        sellingPrice: Number(newVariant.sellingPrice),
        discount_type: newVariant.discountType,
        tax: newVariant.tax,
        available_stock: Number(newVariant.stock),
        stock: Number(newVariant.stock),
        low_stock_alert: Number(newVariant.lowStockAlert || 0),
        sku: newVariant.sku,
        barcode: newVariant.barcode,
        stock_status: stockStatus,
        allow_backorders: newVariant.allowBackorders,
      };

      if (editingIndex !== null) {
        const variantId = variants[editingIndex]._id;
        if (!variantId) throw new Error("Variant ID missing for update");
        const updatePayload = {
          mrp: Number(newVariant.mrp),
          price: Number(newVariant.sellingPrice),
          available_stock: Number(newVariant.stock),
          low_stock_alert: Number(newVariant.lowStockAlert || 0),
        };
        const res = await fetch(`${API_BASE_URL}/api/products/${productId}/variants/${variantId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });
        if (!res.ok) throw new Error("Variant update failed");
        const updated = [...variants];
        updated[editingIndex] = { ...newVariant, _id: variantId };
        setVariants(updated);
        setEditingIndex(null);
        showToast("Variant updated");
      } else {
        const res = await fetch(`${API_BASE_URL}/api/products/${productId}/variants`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variants: [payload] }),
        });
        if (!res.ok) {
          const fallbackRes = await fetch(`${API_BASE_URL}/api/products/${productId}/variants`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!fallbackRes.ok) throw new Error("Variant add failed");
          const data = await fallbackRes.json();
          const savedVariant = data.data || data.variant || data;
          const newVar = { ...newVariant, _id: savedVariant?._id };
          setVariants([...variants, newVar]);
          showToast("Variant added");
          setNewVariant({ ...emptyVariant });
          return;
        }
        const data = await res.json();
        const savedVariant = Array.isArray(data.data)
          ? data.data[0]
          : Array.isArray(data.variants)
            ? data.variants[0]
            : data.data || data.variant || data;
        const newVar = { ...newVariant, _id: savedVariant?._id };
        setVariants([...variants, newVar]);
        showToast("Variant added");
      }
      setNewVariant({ ...emptyVariant });
    } catch (err: any) {
      showToast(err.message || "Error saving variant");
    } finally {
      setVariantLoading(false);
    }
  };

  const deleteVariant = async (index: number) => {
    const variant = variants[index];
    if (!variant._id) {
      setVariants(variants.filter((_, i) => i !== index));
      return;
    }
    if (!confirm(`Delete variant "${variant.weight}g"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${productId}/variants/${variant._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      setVariants(variants.filter((_, i) => i !== index));
      showToast("Variant deleted");
    } catch (err: any) {
      showToast(err.message || "Error deleting variant");
    }
  };

  const editVariant = (index: number) => {
    setNewVariant(variants[index]);
    setEditingIndex(index);
  };

  const deleteVideo = async () => {
    if (videoFile && (!productId || !videoId)) {
      setVideoFile(null);
      setVideoPreview(null);
      setVideoName("");
      showToast("Selected video removed");
      return;
    }
    if (!productId || !videoId) {
      showToast("No video to delete");
      return;
    }
    if (!confirm("Delete this product video?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/videos/${productId}/${videoId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Video deletion failed");
      setVideoPreview(null);
      setVideoName("");
      setVideoId(null);
      setVideoFile(null);
      showToast("Video deleted");
    } catch (err: any) {
      showToast(err.message || "Error deleting video");
    }
  };

  const handlePublish = () => {
    showToast("Product published successfully!");
    router.push("/product");
  };

  // ---------- Render ----------
  if (fetchingDetails) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center gap-2">
        <Loader2 size={32} className="animate-spin text-[#D97706]" />
        <p className="text-xs font-bold text-slate-600">Loading Product Data...</p>
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
            {isEditMode ? "Edit Product" : "Create Product"}
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            {isEditMode ? `Editing ID: ${productId}` : "Add a new product with complete details"}
          </p>
        </div>

        {/* ---------- STEP 1 ---------- */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-bold text-[#0F172A]">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">
                    PRODUCT NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">
                    BRAND <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">
                    CATEGORY <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-[#D97706]"
                    >
                      <option value="">Select Category</option>
                      {categoriesLoading && <option value="" disabled>Loading categories...</option>}
                      {!categoriesLoading && categories.length === 0 && (
                        <option value="" disabled>No categories found</option>
                      )}
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">
                    PRODUCT TYPE <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value as any)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-[#D97706]"
                    >
                      <option value="honey">Honey</option>
                      <option value="giftbox">Gift Box</option>
                      <option value="combopack">Combo Pack</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">FLORAL SOURCE</label>
                <input
                  type="text"
                  value={floralSource}
                  onChange={(e) => setFloralSource(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#D97706]"
                  placeholder="e.g. Mustard Flower"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">
                  DESCRIPTION <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#D97706]"
                  placeholder="Enter product description"
                />
              </div>
            </div>

            {/* Honey Details */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-bold text-[#0F172A]">Honey Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">INGREDIENTS</label>
                  <textarea
                    rows={3}
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter ingredients"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">KEY BENEFITS</label>
                  <textarea
                    rows={3}
                    value={keyBenefits}
                    onChange={(e) => setKeyBenefits(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter key benefits"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">MANUFACTURER INFO</label>
                  <input
                    type="text"
                    value={manufacturerInfo}
                    onChange={(e) => setManufacturerInfo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter manufacturer info"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">SHELF LIFE</label>
                  <input
                    type="text"
                    value={shelfLife}
                    onChange={(e) => setShelfLife(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#D97706]"
                    placeholder="e.g. 24 months"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">STORAGE INSTRUCTIONS</label>
                  <textarea
                    rows={2}
                    value={storageInstructions}
                    onChange={(e) => setStorageInstructions(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter storage instructions"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">COUNTRY OF ORIGIN</label>
                  <select
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="India">India</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">FSSAI LICENSE</label>
                  <input
                    type="text"
                    value={fssaiLicense}
                    onChange={(e) => setFssaiLicense(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter license number"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#475569] uppercase mb-1.5">BATCH NUMBER</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#D97706]"
                    placeholder="Enter batch number"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => router.push("/product")}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold shadow-sm disabled:opacity-70"
              >
                {loading ? "Saving..." : "Save & Next"} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 2 ---------- */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumb" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🍯</span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">{productName || "Product"}</h3>
                <p className="text-[11px] text-slate-500">ID: {productId || "N/A"}</p>
              </div>
            </div>

            {/* Product Image */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
              <h2 className="text-xs font-bold text-[#0F172A]">Product Image</h2>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#FCD34D] bg-[#FFFBEB]/30 rounded-2xl p-8 text-center cursor-pointer hover:bg-[#FFFBEB]/60 transition-colors"
              >
                {thumbnailPreview ? (
                  <div className="relative inline-block">
                    <img src={thumbnailPreview} alt="Thumb" className="max-h-36 rounded-xl shadow-sm" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setThumbnail(null); setThumbnailPreview(null); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={28} className="mx-auto text-[#D97706]" />
                    <p className="text-xs font-semibold text-slate-700">Upload Product Image</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setThumbnail(file);
                  setThumbnailPreview(URL.createObjectURL(file));
                }
              }} className="hidden" />
            </div>

            {/* Gallery */}
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
                      onClick={() => {
                        const removedItem = galleryItems[idx];
                        if (removedItem?.id) {
                          setRemovedGalleryImageIds((prev) => [...prev, removedItem.id as string]);
                        }
                        setGalleryItems((prev) => prev.filter((_, i) => i !== idx));
                        setGalleryPreviews(galleryPreviews.filter((_, i) => i !== idx));
                        setGalleryImages((prev) => removedItem?.file ? prev.filter((file) => file !== removedItem.file) : prev);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <input type="file" ref={galleryInputRef} accept="image/*" multiple onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  const valid = Array.from(files);
                  const newItems = valid.map((file) => ({
                    preview: URL.createObjectURL(file),
                    file,
                  }));
                  setGalleryImages(prev => [...prev, ...valid]);
                  setGalleryItems(prev => [...prev, ...newItems]);
                  setGalleryPreviews(prev => [...prev, ...newItems.map((item) => item.preview)]);
                }
              }} className="hidden" />
            </div>

            {/* Video */}
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
                      <div className="flex gap-2">
                        <button
                          onClick={deleteVideo}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-red-200 bg-red-50 text-[10px] font-bold text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={10} /> Delete Video
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <input type="file" ref={videoInputRef} accept="video/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setVideoFile(file);
                  setVideoName(file.name);
                  setVideoPreview(URL.createObjectURL(file));
                }
              }} className="hidden" />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={handleUploadMedia}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold shadow-sm disabled:opacity-70"
              >
                {loading ? "Uploading..." : "Save & Next"} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 3 ---------- */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0F172A]">Product Variants</h2>
                <button
                  type="button"
                  onClick={() => { setEditingIndex(null); setNewVariant({ ...emptyVariant }); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309]"
                >
                  <Plus size={14} /> Add Variant
                </button>
              </div>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="py-3 px-4">WEIGHT</th>
                      <th className="py-3 px-4">MRP (₹)</th>
                      <th className="py-3 px-4">SELLING PRICE</th>
                      <th className="py-3 px-4">STOCK</th>
                      <th className="py-3 px-4">LOW ALERT</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">BARCODE</th>
                      <th className="py-3 px-4">TAX</th>
                      <th className="py-3 px-4">BACKORDER</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{v.weight}{v.unit}</td>
                        <td className="py-3.5 px-4">₹{v.mrp}</td>
                        <td className="py-3.5 px-4">₹{v.sellingPrice}</td>
                        <td className="py-3.5 px-4">{v.stock}</td>
                        <td className="py-3.5 px-4">{v.lowStockAlert || 0}</td>
                        <td className="py-3.5 px-4">{v.sku}</td>
                        <td className="py-3.5 px-4">{v.barcode || "-"}</td>
                        <td className="py-3.5 px-4">{v.tax}</td>
                        <td className="py-3.5 px-4">{v.allowBackorders ? "Yes" : "No"}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${v.stockStatus === "in_stock" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : v.stockStatus === "low_stock" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                            {v.stockStatus.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => editVariant(idx)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteVariant(idx)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {variants.length === 0 && (
                      <tr>
                        <td colSpan={11} className="py-4 text-center text-slate-400">No variants added yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[#0F172A]">
                {editingIndex !== null ? "Edit Variant" : "Add New Variant"}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {editingIndex === null && (
                  <>
                    <input
                      type="text"
                      placeholder="Weight"
                      value={newVariant.weight}
                      onChange={(e) => setNewVariant({ ...newVariant, weight: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D97706]"
                    />
                    <select
                      value={newVariant.unit}
                      onChange={(e) => setNewVariant({ ...newVariant, unit: e.target.value as VariantInput["unit"] })}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#D97706]"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                    </select>
                  </>
                )}
                <label className="space-y-1">
                  <span className="block text-[10px] font-bold text-[#475569] uppercase">MRP</span>
                  <input
                    type="number"
                    placeholder="MRP (₹)"
                    value={newVariant.mrp}
                    onChange={(e) => setNewVariant({ ...newVariant, mrp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D97706]"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-[10px] font-bold text-[#475569] uppercase">Price</span>
                  <input
                    type="number"
                    placeholder="Selling Price (₹)"
                    value={newVariant.sellingPrice}
                    onChange={(e) => setNewVariant({ ...newVariant, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D97706]"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-[10px] font-bold text-[#475569] uppercase">Available Stock</span>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={newVariant.stock}
                    onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D97706]"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-[10px] font-bold text-[#475569] uppercase">Low Stock Alert</span>
                  <input
                    type="number"
                    placeholder="Low Stock Alert"
                    value={newVariant.lowStockAlert}
                    onChange={(e) => setNewVariant({ ...newVariant, lowStockAlert: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D97706]"
                  />
                </label>
                {editingIndex === null && (
                  <>
                    <select
                      value={newVariant.discountType}
                      onChange={(e) => setNewVariant({ ...newVariant, discountType: e.target.value as VariantInput["discountType"] })}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#D97706]"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tax"
                      value={newVariant.tax}
                      onChange={(e) => setNewVariant({ ...newVariant, tax: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D97706]"
                    />
                    <input
                      type="text"
                      placeholder="SKU"
                      value={newVariant.sku}
                      onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D97706]"
                    />
                    <input
                      type="text"
                      placeholder="Barcode"
                      value={newVariant.barcode}
                      onChange={(e) => setNewVariant({ ...newVariant, barcode: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D97706]"
                    />
                    <select
                      value={newVariant.stockStatus}
                      onChange={(e) => setNewVariant({ ...newVariant, stockStatus: e.target.value as VariantInput["stockStatus"] })}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#D97706]"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={newVariant.allowBackorders}
                        onChange={(e) => setNewVariant({ ...newVariant, allowBackorders: e.target.checked })}
                        className="h-3.5 w-3.5 accent-[#D97706]"
                      />
                      Backorders
                    </label>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={addVariant}
                  disabled={variantLoading}
                  className="px-5 py-2 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] disabled:opacity-70"
                >
                  {variantLoading ? "Saving..." : editingIndex !== null ? "Update Variant" : "Save Variant"}
                </button>
                {editingIndex !== null && (
                  <button
                    type="button"
                    onClick={() => { setEditingIndex(null); setNewVariant({ ...emptyVariant }); }}
                    className="px-5 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold shadow-sm"
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

// ---------- Export with Suspense ----------
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
