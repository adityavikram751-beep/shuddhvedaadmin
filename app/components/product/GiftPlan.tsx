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
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Check,
  Tag,
  ShieldCheck,
  Info,
  FileText,
  Sliders,
  Edit3,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

export interface CatalogProduct {
  _id: string;
  id?: string;
  product_name: string;
  brand?: string;
  variantDocumentId?: Array<{
    _id: string;
    id?: string;
    weight?: number | string;
    unit?: string;
    price?: number;
    mrp?: number;
  }>;
}

export interface SetPackProductSelection {
  productId: string;
  selectedWeight: string;
}

export interface SetPack {
  _id?: string;
  id?: string;
  pack_name: string;
  pack_size: number | string;
  mrp: number | string;
  selling_price: number | string;
  discount_percent?: number | string;
  image?: string | { image_url?: string; url?: string };
  image_url?: string;
  products?: SetPackProductSelection[];
}

export interface ComboProduct {
  _id?: string;
  id?: string;
  combo_name: string;
  slug: string;
  brand?: string;
  description?: string;
  key_benefits?: string;
  manufacturer_information?: string;
  shelf_life?: string;
  storage_instructions?: string;
  country_of_origin?: string;
  fssai_license_number?: string;
  is_active?: boolean;
  images?: Array<string | { image_url?: string; url?: string }>;
  image?: string | { image_url?: string; url?: string };
  image_url?: string;
  set_packs?: SetPack[];
  setPacks?: SetPack[];
  createdAt?: string;
  updatedAt?: string;
}

export default function GiftPlanManagement() {
  const [comboProducts, setComboProducts] = useState<ComboProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State for Multi-Step Creation / Editing
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingComboId, setEditingComboId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [stepStatusMsg, setStepStatusMsg] = useState<string | null>(null);
  const [formSuccessMsg, setFormSuccessMsg] = useState<string | null>(null);
  const [formErrorMsg, setFormErrorMsg] = useState<string | null>(null);

  // --- Step 1 Fields: Combo Product Info ---
  const [comboName, setComboName] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [keyBenefits, setKeyBenefits] = useState("");
  const [manufacturerInfo, setManufacturerInfo] = useState("");
  const [shelfLife, setShelfLife] = useState("");
  const [storageInstructions, setStorageInstructions] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [fssaiLicense, setFssaiLicense] = useState("");
  const [isActive, setIsActive] = useState(true);

  // --- Step 2 Fields: Main Combo Image ---
  const [comboImageFile, setComboImageFile] = useState<File | null>(null);
  const [comboImagePreview, setComboImagePreview] = useState<string | null>(null);

  // --- Step 3 Fields: Set Pack ---
  const [packName, setPackName] = useState("");
  const [packSize, setPackSize] = useState<number | "">("");
  const [mrp, setMrp] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [discountPercent, setDiscountPercent] = useState<string | number>("");
  const [setPackImageFile, setSetPackImageFile] = useState<File | null>(null);
  const [setPackImagePreview, setSetPackImagePreview] = useState<string | null>(null);

  // Step 2 & 3 Existing Data State for Editing
  const [editingComboImages, setEditingComboImages] = useState<any[]>([]);
  const [editingSetPacks, setEditingSetPacks] = useState<SetPack[]>([]);

  // Catalog Products list fetched from GET /api/products
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [fetchingCatalogProducts, setFetchingCatalogProducts] = useState(false);
  const [selectedSetPackProducts, setSelectedSetPackProducts] = useState<
    SetPackProductSelection[]
  >([]);

  // Delete Set Pack State
  const [deletingTarget, setDeletingTarget] = useState<{
    comboProductId: string;
    setPackId: string;
    packName: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputComboRef = useRef<HTMLInputElement | null>(null);
  const fileInputPackRef = useRef<HTMLInputElement | null>(null);

  // Auto update slug when comboName changes if slug is untouched
  const handleComboNameChange = (val: string) => {
    setComboName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  // Auto calculate discount percentage
  useEffect(() => {
    if (mrp && sellingPrice && Number(mrp) > 0) {
      const disc = Math.round(
        ((Number(mrp) - Number(sellingPrice)) / Number(mrp)) * 100
      );
      setDiscountPercent(disc > 0 ? disc : 0);
    }
  }, [mrp, sellingPrice]);

  // 🌐 GET Single Combo Product Details API
  const fetchComboProductDetails = async (
    comboProductId: string
  ): Promise<ComboProduct | null> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/combo/products/details/${comboProductId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json.data || json.product || json.comboProduct || json.combo)) {
        return json.data || json.product || json.comboProduct || json.combo;
      }
    } catch (err) {
      console.error(`Error fetching combo product details for ${comboProductId}:`, err);
    }
    return null;
  };

  // 🌐 GET API: Fetch All Combo Products (Enriched with details for full setPacks _ids)
  const fetchComboProducts = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/combo/products/all/combo-products`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const list: ComboProduct[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.products)
          ? json.products
          : Array.isArray(json.comboProducts)
          ? json.comboProducts
          : Array.isArray(json.combos)
          ? json.combos
          : Array.isArray(json)
          ? json
          : [];

        // Enrich each combo product with full setPacks details (populates setPacks _id)
        const enrichedList = await Promise.all(
          list.map(async (combo) => {
            const comboId = combo._id || combo.id;
            if (!comboId) return combo;
            const det = await fetchComboProductDetails(comboId);
            return det || combo;
          })
        );

        setComboProducts(enrichedList);
      } else {
        setErrorMsg(
          json.message || `Failed to fetch combo products (${res.status})`
        );
      }
    } catch (err: any) {
      console.error("Error fetching combo products:", err);
      setErrorMsg(err.message || "Failed to communicate with API server");
    } finally {
      setLoading(false);
    }
  };

  // 🌐 GET API: Fetch Catalog Products for Set Pack Selection
  const fetchCatalogProducts = async () => {
    setFetchingCatalogProducts(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(json.data)) {
        setCatalogProducts(json.data);
      }
    } catch (err) {
      console.error("Error fetching catalog products:", err);
    } finally {
      setFetchingCatalogProducts(false);
    }
  };

  useEffect(() => {
    void fetchComboProducts();
    void fetchCatalogProducts();
  }, []);

  // Reset Full Creation Form
  const resetForm = () => {
    setEditingComboId(null);
    setCurrentStep(1);
    setComboName("");
    setSlug("");
    setBrand("");
    setDescription("");
    setKeyBenefits("");
    setManufacturerInfo("");
    setShelfLife("");
    setStorageInstructions("");
    setCountryOfOrigin("");
    setFssaiLicense("");
    setIsActive(true);

    setEditingComboImages([]);
    setEditingSetPacks([]);
    setComboImageFile(null);
    setComboImagePreview(null);

    setPackName("");
    setPackSize("");
    setMrp("");
    setSellingPrice("");
    setDiscountPercent("");
    setSetPackImageFile(null);
    setSetPackImagePreview(null);

    setFormSuccessMsg(null);
    setFormErrorMsg(null);
    setStepStatusMsg(null);

    if (fileInputComboRef.current) fileInputComboRef.current.value = "";
    if (fileInputPackRef.current) fileInputPackRef.current.value = "";
  };

  // Open Multi-Step Modal in EDIT Mode with clean inputs
  const openEditModal = async (combo: ComboProduct, initialStep: 1 | 2 | 3 = 1) => {
    const comboId = combo._id || combo.id || null;
    setEditingComboId(comboId);
    setCurrentStep(initialStep);

    let targetCombo = combo;
    if (comboId) {
      const fetched = await fetchComboProductDetails(comboId);
      if (fetched) targetCombo = fetched;
    }

    setComboName(targetCombo.combo_name || "");
    setSlug(targetCombo.slug || "");
    setBrand(targetCombo.brand || "");
    setDescription(targetCombo.description || "");
    setKeyBenefits(targetCombo.key_benefits || "");
    setManufacturerInfo(targetCombo.manufacturer_information || "");
    setShelfLife(targetCombo.shelf_life || "");
    setStorageInstructions(targetCombo.storage_instructions || "");
    setCountryOfOrigin(targetCombo.country_of_origin || "");
    setFssaiLicense(targetCombo.fssai_license_number || "");
    setIsActive(targetCombo.is_active !== false);

    setEditingComboImages(targetCombo.images || []);
    setEditingSetPacks(getSetPacks(targetCombo));
    setComboImageFile(null);
    const mainImg =
      targetCombo.images && targetCombo.images.length > 0
        ? targetCombo.images[0]
        : targetCombo.image || targetCombo.image_url;
    setComboImagePreview(getImageUrl(mainImg));

    // Reset set pack fields so they stay empty on Edit as requested
    resetSetPackForm();

    setFormErrorMsg(null);
    setFormSuccessMsg(null);
    setStepStatusMsg(null);
    setIsAddModalOpen(true);
  };

  // Reset Standalone Set Pack Form
  const resetSetPackForm = () => {
    setPackName("");
    setPackSize("");
    setMrp("");
    setSellingPrice("");
    setDiscountPercent("");
    setSetPackImageFile(null);
    setSetPackImagePreview(null);
    setSelectedSetPackProducts([]);
    if (fileInputPackRef.current) fileInputPackRef.current.value = "";
  };

  // 🚀 SUBMIT FULL MULTI-STEP COMBO CREATION / EDITING FLOW (Steps 1 -> 2 -> 3)
  const handleFullComboSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comboName.trim()) {
      alert("Please enter a Combo Product name");
      return;
    }

    setSubmitting(true);
    setFormErrorMsg(null);
    setFormSuccessMsg(null);

    let targetComboId: string | null = null;

    try {
      const step1Payload = {
        combo_name: comboName.trim(),
        slug: slug.trim(),
        brand: brand.trim(),
        description: description.trim(),
        key_benefits: keyBenefits.trim(),
        manufacturer_information: manufacturerInfo.trim(),
        shelf_life: shelfLife.trim(),
        storage_instructions: storageInstructions.trim(),
        country_of_origin: countryOfOrigin.trim(),
        fssai_license_number: fssaiLicense.trim(),
        is_active: isActive,
      };

      if (editingComboId) {
        // --- EDIT MODE: PATCH /api/combo/products/update/combo-product/info/{comboProductId} ---
        targetComboId = editingComboId;
        setStepStatusMsg("Step 1/3: Updating Combo Product info (PATCH)...");

        let res1 = await fetch(
          `${API_BASE_URL}/api/combo/products/update/combo-product/info/${editingComboId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
            body: JSON.stringify(step1Payload),
          }
        );

        if (!res1.ok) {
          // Fallback to PUT if PATCH endpoint is different
          res1 = await fetch(
            `${API_BASE_URL}/api/combo/products/update/${editingComboId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              credentials: "include",
              body: JSON.stringify(step1Payload),
            }
          );
        }
      } else {
        // --- CREATE MODE: POST /api/combo/products/create ---
        setStepStatusMsg("Step 1/3: Creating Combo Product details (POST)...");

        const res1 = await fetch(`${API_BASE_URL}/api/combo/products/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify(step1Payload),
        });

        const json1 = await res1.json().catch(() => ({}));
        if (!res1.ok && !json1._id && !json1.data?._id && !json1.comboProductId) {
          throw new Error(
            json1.message ||
              json1.error ||
              `Step 1 Failed (${res1.status}): Create Combo Product`
          );
        }

        targetComboId =
          json1.comboProductId ||
          json1.data?.comboProductId ||
          json1._id ||
          json1.id ||
          json1.data?._id ||
          json1.data?.id ||
          json1.product?._id ||
          json1.product?.id;
      }

      if (!targetComboId) {
        throw new Error(
          "Step 1 succeeded but no Combo Product ID was returned from API."
        );
      }

      // -------------------------------------------------------------
      // STEP 2: Main Image Upload / Update
      // Edit: PUT /api/combo/products/update/comboProduct-image/{comboProductId}
      // Create: POST /api/combo/products/image-uploads/{comboProductId}
      // -------------------------------------------------------------
      if (comboImageFile) {
        setStepStatusMsg("Step 2/3: Uploading main combo image...");
        const imgFormData = new FormData();
        imgFormData.append("image", comboImageFile);

        const imgUrl = editingComboId
          ? `${API_BASE_URL}/api/combo/products/update/comboProduct-image/${targetComboId}`
          : `${API_BASE_URL}/api/combo/products/image-uploads/${targetComboId}`;

        const imgMethod = editingComboId ? "PUT" : "POST";

        const res2 = await fetch(imgUrl, {
          method: imgMethod,
          credentials: "include",
          body: imgFormData,
        });

        const json2 = await res2.json().catch(() => ({}));
        if (!res2.ok) {
          console.warn("Step 2 Image upload warning:", json2);
        }
      }

      // -------------------------------------------------------------
      // STEP 3: Set Pack Configuration
      // POST /api/combo/products/add/set-pack/{comboProductId}
      // -------------------------------------------------------------
      if (setPackImageFile || packName.trim()) {
        setStepStatusMsg("Step 3/3: Saving Set Pack pricing configuration...");
        const packFormData = new FormData();
        packFormData.append("pack_name", packName.trim() || "Set of 2");
        packFormData.append("pack_size", String(packSize || selectedSetPackProducts.length || 2));
        packFormData.append("mrp", String(mrp || 0));
        packFormData.append("selling_price", String(sellingPrice || 0));
        if (discountPercent !== "") {
          packFormData.append("discount_percent", String(discountPercent));
        }
        if (setPackImageFile) {
          packFormData.append("image", setPackImageFile);
        }

        const validProducts = selectedSetPackProducts.filter(
          (p) => p.productId && p.selectedWeight
        );
        if (validProducts.length > 0) {
          packFormData.append("products", JSON.stringify(validProducts));
        }

        const res3 = await fetch(
          `${API_BASE_URL}/api/combo/products/add/set-pack/${targetComboId}`,
          {
            method: "POST",
            credentials: "include",
            body: packFormData,
          }
        );

        const json3 = await res3.json().catch(() => ({}));
        if (!res3.ok && !json3.success) {
          console.warn("Step 3 Set pack warning:", json3);
        }
      }

      setFormSuccessMsg(
        editingComboId
          ? "Combo Gift Plan updated successfully!"
          : "Combo Gift Plan created successfully!"
      );
      setIsAddModalOpen(false);
      resetForm();
      void fetchComboProducts();
    } catch (err: any) {
      console.error("Error submitting combo plan:", err);
      setFormErrorMsg(err.message || "Failed to save combo gift plan");
    } finally {
      setSubmitting(false);
      setStepStatusMsg(null);
    }
  };

  // 🗑️ DELETE API: Remove Combo Product Image
  const handleDeleteComboImage = async (
    comboProductId: string,
    imageId: string
  ) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/combo/products/remove/combo-product/${comboProductId}/image/${imageId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const json = await res.json().catch(() => ({}));
      if (res.ok || json.success) {
        const updated = await fetchComboProductDetails(comboProductId);
        if (updated) {
          setEditingComboImages(updated.images || []);
          const mainImg =
            updated.images && updated.images.length > 0
              ? updated.images[0]
              : updated.image || updated.image_url;
          setComboImagePreview(getImageUrl(mainImg));
        }
        void fetchComboProducts();
      } else {
        alert(json.message || `Failed to delete image (${res.status})`);
      }
    } catch (err: any) {
      console.error("Error deleting image:", err);
      alert(err.message || "Failed to delete image");
    }
  };

  // 🗑️ DELETE API: Remove Set Pack from Combo
  const handleDeleteSetPack = async () => {
    if (!deletingTarget) return;
    let { comboProductId, setPackId } = deletingTarget;
    setIsDeleting(true);

    try {
      // If setPackId is missing or numeric fallback, fetch details to resolve real Mongo _id
      if (!setPackId || /^\d+$/.test(setPackId)) {
        const details = await fetchComboProductDetails(comboProductId);
        if (details) {
          const setPacks = getSetPacks(details);
          const matchedPack = setPacks.find(
            (p) =>
              (p as any).pack_name === deletingTarget.packName ||
              (p._id && !/^\d+$/.test(p._id))
          );
          if (matchedPack && matchedPack._id) {
            setPackId = matchedPack._id;
          }
        }
      }

      const res = await fetch(
        `${API_BASE_URL}/api/combo/products/remove/setpack/${comboProductId}/${setPackId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const json = await res.json().catch(() => ({}));
      if (res.ok || json.success) {
        setDeletingTarget(null);
        if (comboProductId) {
          const updated = await fetchComboProductDetails(comboProductId);
          if (updated) {
            setEditingSetPacks(getSetPacks(updated));
          }
        }
        void fetchComboProducts();
      } else {
        alert(json.message || `Failed to delete set pack (${res.status})`);
      }
    } catch (err: any) {
      console.error("Error deleting set pack:", err);
      alert(err.message || "Failed to delete set pack");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to safely render image URLs
  const getImageUrl = (img?: any): string => {
    if (!img)
      return "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=400&auto=format&fit=crop";
    if (typeof img === "string") {
      if (img.startsWith("http") || img.startsWith("data:")) return img;
      return `${API_BASE_URL}/${img.replace(/^\//, "")}`;
    }
    if (typeof img === "object" && img !== null) {
      const url = img.image_url || img.url || img.path;
      if (url) {
        if (url.startsWith("http") || url.startsWith("data:")) return url;
        return `${API_BASE_URL}/${url.replace(/^\//, "")}`;
      }
    }
    return "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=400&auto=format&fit=crop";
  };

  // Helper to get all set packs from a combo object safely
  const getSetPacks = (combo: ComboProduct): SetPack[] => {
    if (Array.isArray(combo.set_packs)) return combo.set_packs;
    if (Array.isArray(combo.setPacks)) return combo.setPacks;
    return [];
  };

  // Filter combo products by search term
  const filteredCombos = comboProducts.filter((combo) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const nameMatch = combo.combo_name?.toLowerCase().includes(term);
    const descMatch = combo.description?.toLowerCase().includes(term);
    const brandMatch = combo.brand?.toLowerCase().includes(term);
    const setPacksList = getSetPacks(combo);
    const packMatch = setPacksList.some((p) =>
      p.pack_name?.toLowerCase().includes(term)
    );
    return nameMatch || descMatch || brandMatch || packMatch;
  });

  // Calculate metrics
  const totalSetPacksCount = comboProducts.reduce(
    (acc, combo) => acc + getSetPacks(combo).length,
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 👑 Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-[#FFFBF0] border border-[#F2D6A7] text-[#E69A00] rounded-xl shadow-2xs">
            <Gift size={22} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-[#2D2118]">
              Gift Box & Combo Plans
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage combo products, set pack pricing & image uploads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchComboProducts}
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
            <span>Create Combo Gift Plan</span>
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
              Total Combo Products
            </p>
            <p className="text-xl font-bold text-[#2D2118]">
              {comboProducts.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Set Packs
            </p>
            <p className="text-xl font-bold text-[#2D2118]">
              {totalSetPacksCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Active Status
            </p>
            <p className="text-xl font-bold text-emerald-600">
              {comboProducts.filter((c) => c.is_active !== false).length} Active
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
            onClick={fetchComboProducts}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg transition cursor-pointer"
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
            placeholder="Search Combo Name, Set Pack, Brand, Description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
          />
        </div>
      </div>

      {/* 🎁 Combo Products List */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#E69A00]" size={32} />
            <p className="text-xs font-semibold text-gray-600">
              Loading Combo Products & Gift Plans...
            </p>
          </div>
        ) : filteredCombos.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
            <Gift size={40} className="text-gray-300 stroke-1" />
            <p className="text-sm font-semibold text-gray-600">
              No Combo Products Found
            </p>
            <p className="text-xs text-gray-400">
              Click &quot;Create Combo Gift Plan&quot; to build your first set pack combo.
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="mt-2 px-4 py-2 bg-[#E69A00] text-white text-xs font-bold rounded-xl hover:bg-[#D48D00] transition cursor-pointer"
            >
              + Create Combo Gift Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCombos.map((combo) => {
              const comboId = combo._id || combo.id || "";
              const setPacks = getSetPacks(combo);
              const comboMainImg =
                combo.images && combo.images.length > 0
                  ? getImageUrl(combo.images[0])
                  : getImageUrl(combo.image || combo.image_url);

              return (
                <div
                  key={comboId || combo.slug}
                  className="bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-48 bg-gradient-to-b from-amber-50/40 to-gray-100 overflow-hidden border-b border-gray-100">
                    <img
                      src={comboMainImg}
                      alt={combo.combo_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs pointer-events-auto backdrop-blur-md ${
                          combo.is_active !== false
                            ? "bg-emerald-500/90 text-white"
                            : "bg-gray-700/80 text-white"
                        }`}
                      >
                        {combo.is_active !== false ? "Active" : "Inactive"}
                      </span>

                      <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs pointer-events-auto flex items-center gap-1">
                        <Layers size={12} className="text-[#E69A00]" />
                        {setPacks.length} Set {setPacks.length === 1 ? "Pack" : "Packs"}
                      </span>
                    </div>

                    {/* Hover Image Action Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(combo)}
                        className="px-4 py-2 bg-white text-gray-800 rounded-xl font-bold text-xs shadow-md hover:bg-amber-50 hover:text-[#E69A00] transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={14} /> Edit Plan Details
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[#2D2118] line-clamp-2 group-hover:text-[#E69A00] transition-colors">
                        {combo.combo_name}
                      </h3>
                      
                      <p className="text-[11px] text-gray-400 font-mono truncate">
                        {combo.brand || "SudhVeda Honey"} • <span className="text-[#E69A00] font-sans">{combo.slug}</span>
                      </p>

                      {combo.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed pt-1">
                          {combo.description}
                        </p>
                      )}
                    </div>

                    {/* Key Benefits */}
                    {combo.key_benefits && (
                      <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100 text-[10px] text-amber-900 line-clamp-1 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-[#E69A00] shrink-0" />
                        <span className="truncate">{combo.key_benefits}</span>
                      </div>
                    )}

                    {/* Set Packs Box */}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                          <Layers size={12} className="text-[#E69A00]" />
                          Set Packs ({setPacks.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditModal(combo, 3)}
                          className="text-[11px] font-bold text-[#E69A00] hover:text-[#D48D00] flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus size={13} /> Add Pack
                        </button>
                      </div>

                      {setPacks.length === 0 ? (
                        <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-[11px] text-gray-400">
                          No set packs added yet
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {setPacks.map((pack, idx) => {
                            const packId = pack._id || pack.id || String(idx);
                            const packImg = getImageUrl(pack.image || pack.image_url);

                            return (
                              <div
                                key={packId}
                                className="flex items-center justify-between p-2 bg-gray-50 hover:bg-amber-50/50 rounded-lg border border-gray-100 transition text-xs"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <img
                                    src={packImg}
                                    alt={pack.pack_name}
                                    className="w-7 h-7 rounded-md object-cover bg-white border border-gray-200 shrink-0"
                                  />
                                  <div className="truncate">
                                    <p className="font-bold text-gray-800 text-[11px] truncate">
                                      {pack.pack_name}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                      Size: {pack.pack_size}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="text-right">
                                    <p className="font-extrabold text-[#E69A00] text-xs">
                                      ₹{pack.selling_price}
                                    </p>
                                    {Number(pack.mrp) > Number(pack.selling_price) && (
                                      <p className="text-[9px] text-gray-400 line-through">
                                        ₹{pack.mrp}
                                      </p>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    title="Delete Set Pack"
                                    onClick={() => {
                                      if (!comboId || !packId) {
                                        alert("Cannot delete: Missing Combo ID or Set Pack ID");
                                        return;
                                      }
                                      setDeletingTarget({
                                        comboProductId: comboId,
                                        setPackId: packId,
                                        packName: pack.pack_name,
                                      });
                                    }}
                                    className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(combo)}
                      className="w-full py-2 bg-[#E69A00] hover:bg-[#D48D00] text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 size={14} /> Edit Combo Plan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ➕ MULTI-STEP MODAL FOR CREATING / EDITING COMBO PRODUCT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-fadeIn">
          <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#FAF6F0] p-4 border-b border-[#F2E8D9] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-100 text-[#E69A00] rounded-xl border border-amber-200">
                  <Gift size={18} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#2D2118]">
                    {editingComboId ? "Edit Combo Gift Plan" : "Create Combo Gift Plan"}
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    {editingComboId
                      ? "Update combo info, images, and set pack pricing"
                      : "3-step wizard to setup combo info, images, and set pack pricing"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepper Tabs */}
            <div className="bg-gray-50 px-6 py-2.5 border-b border-gray-200 flex items-center justify-between text-xs shrink-0">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex items-center gap-2 font-bold cursor-pointer transition ${
                  currentStep === 1 ? "text-[#E69A00]" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-amber-100 text-[#E69A00] flex items-center justify-center text-[10px]">
                  1
                </span>
                Step 1: Product Info
              </button>

              <ChevronRight size={14} className="text-gray-300" />

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`flex items-center gap-2 font-bold cursor-pointer transition ${
                  currentStep === 2 ? "text-[#E69A00]" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-amber-100 text-[#E69A00] flex items-center justify-center text-[10px]">
                  2
                </span>
                Step 2: Combo Image
              </button>

              <ChevronRight size={14} className="text-gray-300" />

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`flex items-center gap-2 font-bold cursor-pointer transition ${
                  currentStep === 3 ? "text-[#E69A00]" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-amber-100 text-[#E69A00] flex items-center justify-center text-[10px]">
                  3
                </span>
                Step 3: Set Pack Pricing
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFullComboSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs">
              {/* Modal Body (Scrolls internally) */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
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

                {/* Progress Step Banner during submission */}
                {stepStatusMsg && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-pulse">
                    <Loader2 size={16} className="animate-spin text-[#E69A00] shrink-0" />
                    <span>{stepStatusMsg}</span>
                  </div>
                )}

                {/* STEP 1 CONTENT: Combo Details */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Combo Name */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Combo Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Raw Forest Honey + Multiflora Honey Combo Pack (2 x 250g)"
                        value={comboName}
                        onChange={(e) => handleComboNameChange(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition font-medium"
                      />
                    </div>

                    {/* Slug & Brand */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Slug <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="raw-forest-honey-multiflora-honey-combo-pack-500g"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Brand
                        </label>
                        <input
                          type="text"
                          placeholder="SudhVeda Honey"
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
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
                        rows={2}
                        placeholder="A specially curated combo of our Raw Forest Honey and Multiflora Honey..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                      />
                    </div>

                    {/* Key Benefits */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Key Benefits
                      </label>
                      <input
                        type="text"
                        placeholder="Boosts immunity, rich in antioxidants, natural energy booster..."
                        value={keyBenefits}
                        onChange={(e) => setKeyBenefits(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                      />
                    </div>

                    {/* Manufacturer Info & Shelf Life */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Shelf Life
                        </label>
                        <input
                          type="text"
                          placeholder="24 months from the date of packaging"
                          value={shelfLife}
                          onChange={(e) => setShelfLife(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Country of Origin
                        </label>
                        <input
                          type="text"
                          placeholder="India"
                          value={countryOfOrigin}
                          onChange={(e) => setCountryOfOrigin(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {/* Storage & FSSAI */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          FSSAI License Number
                        </label>
                        <input
                          type="text"
                          placeholder="10021045001234"
                          value={fssaiLicense}
                          onChange={(e) => setFssaiLicense(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={isActive ? "true" : "false"}
                          onChange={(e) => setIsActive(e.target.value === "true")}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition cursor-pointer"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* Manufacturer Address */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Manufacturer Information
                      </label>
                      <input
                        type="text"
                        placeholder="Manufactured and Packed by SudhVeda Honey Pvt. Ltd..."
                        value={manufacturerInfo}
                        onChange={(e) => setManufacturerInfo(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2 CONTENT: Main Combo Image */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Existing Images Gallery if Editing */}
                    {editingComboId && editingComboImages.length > 0 && (
                      <div className="space-y-2">
                        <label className="block font-bold text-gray-700 text-xs">
                          Current Combo Images ({editingComboImages.length})
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {editingComboImages.map((imgObj: any, idx: number) => {
                            const imgUrl = getImageUrl(imgObj);
                            const imgId =
                              typeof imgObj === "object"
                                ? imgObj._id || imgObj.id || imgObj.public_id
                                : null;

                            return (
                              <div
                                key={imgId || idx}
                                className="relative group rounded-xl overflow-hidden border border-gray-200 h-28 bg-gray-50 flex items-center justify-center"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Combo image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {imgId && (
                                  <button
                                    type="button"
                                    title="Delete this image"
                                    onClick={() =>
                                      handleDeleteComboImage(editingComboId, imgId)
                                    }
                                    className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg opacity-90 hover:opacity-100 shadow-md transition cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <label className="block font-bold text-gray-700 text-xs">
                      {editingComboId
                        ? "Upload New / Replacement Main Image"
                        : "Upload Combo Main Banner / Packaging Image"}
                    </label>

                    <div
                      onClick={() => fileInputComboRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-[#E69A00] bg-gray-50 hover:bg-[#FFFBF5] rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 group"
                    >
                      <input
                        ref={fileInputComboRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setComboImageFile(file);
                            setComboImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />

                      {comboImagePreview ? (
                        <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200">
                          <img
                            src={comboImagePreview}
                            alt="Combo Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                            Click to Change Combo Image
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-amber-100 text-[#E69A00] flex items-center justify-center">
                            <Upload size={22} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-700">
                              Click to select main combo image file
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              High resolution product shot (JPG, PNG, WEBP)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3 CONTENT: Set Pack Configuration */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Existing Set Packs List if Editing */}
                    {editingComboId && editingSetPacks.length > 0 && (
                      <div className="space-y-2 pb-3 border-b border-gray-100">
                        <label className="block font-bold text-gray-700 text-xs">
                          Current Set Packs ({editingSetPacks.length})
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {editingSetPacks.map((pack, idx) => {
                            const packId =
                              pack._id ||
                              pack.id ||
                              (pack as any).setPackId ||
                              (pack as any).set_pack_id ||
                              String(idx);
                            const packImg = getImageUrl(
                              pack.image || pack.image_url
                            );

                            return (
                              <div
                                key={packId}
                                className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs"
                              >
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                  <img
                                    src={packImg}
                                    alt={pack.pack_name}
                                    className="w-8 h-8 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                                  />
                                  <div className="truncate">
                                    <p className="font-bold text-gray-800 text-xs truncate">
                                      {pack.pack_name}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-mono">
                                      Size: {pack.pack_size} • MRP: ₹{pack.mrp} • Selling: ₹{pack.selling_price}
                                    </p>
                                  </div>
                                </div>

                                {editingComboId && (
                                  <button
                                    type="button"
                                    title="Delete Set Pack"
                                    onClick={() => {
                                      if (!editingComboId || !packId) return;
                                      setDeletingTarget({
                                        comboProductId: editingComboId,
                                        setPackId: packId,
                                        packName: pack.pack_name,
                                      });
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <p className="font-bold text-gray-800 text-xs">
                      {editingComboId
                        ? "Add New Set Pack (Optional)"
                        : "Configure Set Pack Pricing"}
                    </p>

                    {/* Pack Name & Size */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Set Pack Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Set of 2 (HF,AJ)"
                          value={packName}
                          onChange={(e) => setPackName(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Pack Size (Quantity) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          placeholder="2"
                          value={packSize}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : "";
                            setPackSize(val);
                            if (typeof val === "number" && val > 0) {
                              setSelectedSetPackProducts((prev) => {
                                if (prev.length === 0) {
                                  return Array.from({ length: val }, () => ({
                                    productId: "",
                                    selectedWeight: "",
                                  }));
                                }
                                return prev;
                              });
                            }
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {/* Products Selection for Set Pack */}
                    <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-gray-800 text-xs">
                          Select Products Included in Set Pack ({selectedSetPackProducts.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSetPackProducts((prev) => [
                              ...prev,
                              { productId: "", selectedWeight: "" },
                            ]);
                          }}
                          className="text-[11px] font-bold text-[#E69A00] hover:text-[#D48D00] flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={13} /> Add Product Slot
                        </button>
                      </div>

                      {fetchingCatalogProducts ? (
                        <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                          <Loader2 size={14} className="animate-spin text-[#E69A00]" /> Loading products catalog...
                        </div>
                      ) : selectedSetPackProducts.length === 0 ? (
                        <p className="text-[11px] text-gray-400 italic">
                          No product items added yet. Click &quot;+ Add Product Slot&quot; to choose products for this pack.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {selectedSetPackProducts.map((item, slotIdx) => {
                            const selectedProductObj = catalogProducts.find(
                              (p) => (p._id || p.id) === item.productId
                            );
                            const variantsList = selectedProductObj?.variantDocumentId || [];

                            return (
                              <div
                                key={slotIdx}
                                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-200 text-xs shadow-2xs"
                              >
                                <span className="font-bold text-[#E69A00] text-[11px] shrink-0 w-20">
                                  Product {slotIdx + 1}:
                                </span>

                                {/* Product Dropdown */}
                                <select
                                  value={item.productId}
                                  onChange={(e) => {
                                    const prodId = e.target.value;
                                    const foundProd = catalogProducts.find(
                                      (p) => (p._id || p.id) === prodId
                                    );
                                    const firstVariant = foundProd?.variantDocumentId?.[0];
                                    const defaultWeightId = firstVariant?._id || firstVariant?.id || "";

                                    setSelectedSetPackProducts((prev) => {
                                      const updated = [...prev];
                                      updated[slotIdx] = {
                                        productId: prodId,
                                        selectedWeight: defaultWeightId,
                                      };
                                      return updated;
                                    });
                                  }}
                                  className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00] font-medium"
                                >
                                  <option value="">-- Select Product --</option>
                                  {catalogProducts.map((p) => (
                                    <option key={p._id || p.id} value={p._id || p.id}>
                                      {p.product_name} {p.brand ? `(${p.brand})` : ""}
                                    </option>
                                  ))}
                                </select>

                                {/* Weight / Variant Dropdown */}
                                <select
                                  value={item.selectedWeight}
                                  disabled={!item.productId || variantsList.length === 0}
                                  onChange={(e) => {
                                    const weightId = e.target.value;
                                    setSelectedSetPackProducts((prev) => {
                                      const updated = [...prev];
                                      updated[slotIdx] = {
                                        ...updated[slotIdx],
                                        selectedWeight: weightId,
                                      };
                                      return updated;
                                    });
                                  }}
                                  className="w-full sm:w-44 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00] font-mono"
                                >
                                  <option value="">-- Select Weight --</option>
                                  {variantsList.map((v) => (
                                    <option key={v._id || v.id} value={v._id || v.id}>
                                      {v.weight}{v.unit || "g"} {v.price ? `(₹${v.price})` : ""}
                                    </option>
                                  ))}
                                </select>

                                {/* Delete Slot Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSetPackProducts((prev) =>
                                      prev.filter((_, i) => i !== slotIdx)
                                    );
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                                  title="Remove Item Slot"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* MRP & Selling Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          MRP (₹) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          placeholder="1150"
                          value={mrp}
                          onChange={(e) =>
                            setMrp(e.target.value ? Number(e.target.value) : "")
                          }
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Selling Price (₹) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          placeholder="999"
                          value={sellingPrice}
                          onChange={(e) =>
                            setSellingPrice(
                              e.target.value ? Number(e.target.value) : ""
                            )
                          }
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition font-extrabold text-[#E69A00]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Discount % (Auto)
                        </label>
                        <input
                          type="number"
                          placeholder="13.13"
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs outline-none transition font-mono text-emerald-600 font-bold"
                        />
                      </div>
                    </div>

                    {/* Set Pack Image File */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Set Pack Box Image <span className="text-rose-500">*</span>
                      </label>

                      <div
                        onClick={() => fileInputPackRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 hover:border-[#E69A00] bg-gray-50 hover:bg-[#FFFBF5] rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
                      >
                        <input
                          ref={fileInputPackRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSetPackImageFile(file);
                              setSetPackImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          className="hidden"
                        />

                        {setPackImagePreview ? (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={setPackImagePreview}
                              alt="Set Pack Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                              Click to Change Set Pack Image (box2.jpg)
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-amber-100 text-[#E69A00] flex items-center justify-center">
                              <Upload size={18} />
                            </div>
                            <p className="text-xs font-bold text-gray-700">
                              Click to upload set pack image file
                            </p>
                            <p className="text-[10px] text-gray-400">
                              box2.jpg (JPG, PNG, WEBP)
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions Sticky Footer */}
              <div className="shrink-0 bg-gray-50/90 border-t border-gray-200 px-5 py-3 flex items-center justify-between">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      Next Step <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-[#E69A00] hover:bg-[#D48D00] text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      {submitting
                        ? "Processing..."
                        : editingComboId
                        ? "Save & Update Combo Plan"
                        : "Create Full Combo Plan"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ⚠️ DELETE CONFIRMATION MODAL */}
      {deletingTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 size={22} />
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                Remove Set Pack?
              </h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to remove set pack{" "}
              <span className="font-bold text-gray-900">
                &quot;{deletingTarget.packName}&quot;
              </span>
              ?
            </p>
            <p className="text-[11px] text-gray-400 font-mono">
              API: <code>DELETE /api/combo/products/remove/setpack/&#123;comboProductId&#125;/&#123;setPackId&#125;</code>
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingTarget(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSetPack}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete Set Pack"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
