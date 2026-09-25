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
  Layers,
  Zap,
  Award,
  Scale,
  Copy,
  CheckCheck,
  Eye,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

export interface ComboProductItem {
  _id?: string;
  name: string;
  weight: number | string;
  unit: string;
}

export interface ComboImage {
  _id?: string;
  id?: string;
  url?: string;
  image_url?: string;
  public_id?: string;
  path?: string;
}

export interface ComboProduct {
  _id?: string;
  id?: string;
  combo_name: string;
  slug: string;
  brand?: string;
  combo_size?: number;
  products?: ComboProductItem[];
  mrp?: number;
  selling_price?: number;
  description?: string;
  key_benefits?: string;
  manufacturer_information?: string;
  shelf_life?: string;
  storage_instructions?: string;
  country_of_origin?: string;
  fssai_license_number?: string;
  is_active?: boolean;
  images?: Array<string | ComboImage>;
  image?: string | ComboImage;
  image_url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function GiftPlanManagement() {
  const [comboProducts, setComboProducts] = useState<ComboProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingComboId, setEditingComboId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "products" | "pricing" | "images">("info");
  const [submitting, setSubmitting] = useState(false);
  const [stepStatusMsg, setStepStatusMsg] = useState<string | null>(null);
  const [formSuccessMsg, setFormSuccessMsg] = useState<string | null>(null);
  const [formErrorMsg, setFormErrorMsg] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState(false);

  // Form Fields
  const [comboName, setComboName] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("SudhVeda Honey");
  const [comboSize, setComboSize] = useState<number | "">(4);
  const [products, setProducts] = useState<ComboProductItem[]>([
    { name: "Mustard Honey", weight: 250, unit: "g" },
    { name: "Multiflora Honey", weight: 250, unit: "g" },
    { name: "Lychee Honey", weight: 250, unit: "g" },
    { name: "Wild Forest Honey", weight: 250, unit: "g" },
  ]);
  const [mrp, setMrp] = useState<number | "">(2000);
  const [sellingPrice, setSellingPrice] = useState<number | "">(1699);
  const [description, setDescription] = useState(
    "An exquisite collection of four naturally sourced honeys — Mustard, Multiflora, Lychee and Wild Forest Honey, curated to bring a variety of authentic honey flavours to your home."
  );
  const [keyBenefits, setKeyBenefits] = useState(
    "Supports immunity, rich in antioxidants, natural energy booster, supports digestion and offers a variety of natural honey flavours with no added sugar or preservatives."
  );
  const [manufacturerInfo, setManufacturerInfo] = useState(
    "Manufactured and Packed by SudhVeda Honey Pvt. Ltd., Plot No. 12, Industrial Area, Dehradun, Uttarakhand, India - 248001"
  );
  const [shelfLife, setShelfLife] = useState("24 months from the date of packaging");
  const [storageInstructions, setStorageInstructions] = useState(
    "Store in a cool, dry place away from direct sunlight. Do not refrigerate."
  );
  const [countryOfOrigin, setCountryOfOrigin] = useState("India");
  const [fssaiLicense, setFssaiLicense] = useState("10021045001234");
  const [isActive, setIsActive] = useState(true);

  // Images state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [editingComboImages, setEditingComboImages] = useState<Array<ComboImage | string>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Detail Drawer state
  const [selectedComboDetail, setSelectedComboDetail] = useState<ComboProduct | null>(null);

  // Auto-generate slug from name
  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleComboNameChange = (val: string) => {
    setComboName(val);
    setSlug(generateSlug(val));
  };

  // Sync comboSize automatically with products length
  const updateProductsList = (newList: ComboProductItem[]) => {
    setProducts(newList);
    setComboSize(newList.length);
  };

  // Preset Loaders
  const loadPresetQuartet = () => {
    setComboName("Honey Lovers Quartet");
    setSlug("mustard-multiflora-lychee-forest-honey-lovers-quartet");
    setBrand("SudhVeda Honey");
    setComboSize(4);
    setProducts([
      { name: "Mustard Honey", weight: 250, unit: "g" },
      { name: "Multiflora Honey", weight: 250, unit: "g" },
      { name: "Lychee Honey", weight: 250, unit: "g" },
      { name: "Wild Forest Honey", weight: 250, unit: "g" },
    ]);
    setMrp(2000);
    setSellingPrice(1699);
    setDescription(
      "An exquisite collection of four naturally sourced honeys — Mustard, Multiflora, Lychee and Wild Forest Honey, curated to bring a variety of authentic honey flavours to your home."
    );
    setKeyBenefits(
      "Supports immunity, rich in antioxidants, natural energy booster, supports digestion and offers a variety of natural honey flavours with no added sugar or preservatives."
    );
    setManufacturerInfo(
      "Manufactured and Packed by SudhVeda Honey Pvt. Ltd., Plot No. 12, Industrial Area, Dehradun, Uttarakhand, India - 248001"
    );
    setShelfLife("24 months from the date of packaging");
    setStorageInstructions("Store in a cool, dry place away from direct sunlight. Do not refrigerate.");
    setCountryOfOrigin("India");
    setFssaiLicense("10021045001234");
    setIsActive(true);
  };

  const loadPresetGoldenDuo = () => {
    setComboName("Golden Duo");
    setSlug("mustard-honey-lychee-honey-golden-duo");
    setBrand("SudhVeda Honey");
    setComboSize(2);
    setProducts([
      { name: "Mustard Honey", weight: 250, unit: "g" },
      { name: "Lychee Honey", weight: 250, unit: "g" },
    ]);
    setMrp(1250);
    setSellingPrice(1000);
    setDescription(
      "A specially curated combo of Mustard Honey and Lychee Honey — 100% pure, unprocessed, and sourced directly from trusted apiaries."
    );
    setKeyBenefits(
      "Boosts immunity, rich in antioxidants, natural energy booster, aids digestion, no added sugar or preservatives"
    );
    setManufacturerInfo(
      "Manufactured and Packed by SudhVeda Honey Pvt. Ltd., Plot No. 12, Industrial Area, Dehradun, Uttarakhand, India - 248001"
    );
    setShelfLife("24 months from the date of packaging");
    setStorageInstructions("Store in a cool, dry place away from direct sunlight. Do not refrigerate.");
    setCountryOfOrigin("India");
    setFssaiLicense("10021045001234");
    setIsActive(true);
  };

  // Helper to resolve Image URL safely
  const getImageUrl = (img?: any): string => {
    if (!img)
      return "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=600&auto=format&fit=crop";
    if (typeof img === "string") {
      if (img.startsWith("http") || img.startsWith("data:")) return img;
      return `${API_BASE_URL}/${img.replace(/^\//, "")}`;
    }
    if (typeof img === "object" && img !== null) {
      const url = img.url || img.image_url || img.path;
      if (url) {
        if (url.startsWith("http") || url.startsWith("data:")) return url;
        return `${API_BASE_URL}/${url.replace(/^\//, "")}`;
      }
    }
    return "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=600&auto=format&fit=crop";
  };

  // Fetch Single Combo Details
  const fetchComboProductDetails = async (comboProductId: string): Promise<ComboProduct | null> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/combo/products/details/${comboProductId}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          credentials: "include",
        }
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json.data || json.product || json.comboProduct || json.combo)) {
        return json.data || json.product || json.comboProduct || json.combo;
      }
      if (res.ok && json._id) return json;
    } catch (err) {
      console.error(`Error fetching details for ${comboProductId}:`, err);
    }
    return null;
  };

  // Fetch All Combo Products (GET /api/combo/products/all/combo-products)
  const fetchComboProducts = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/combo/products/all/combo-products`, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      });

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

        // Enrich with details if needed
        const enrichedList = await Promise.all(
          list.map(async (combo) => {
            const id = combo._id || combo.id;
            if (id && (!combo.products || combo.products.length === 0)) {
              const det = await fetchComboProductDetails(id);
              if (det) return det;
            }
            return combo;
          })
        );

        setComboProducts(enrichedList);
      } else {
        setErrorMsg(json.message || `Failed to fetch combo products (${res.status})`);
      }
    } catch (err: any) {
      console.error("Error fetching combo products:", err);
      setErrorMsg(err.message || "Failed to communicate with API server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchComboProducts();
  }, []);

  // Reset Form
  const resetForm = () => {
    setEditingComboId(null);
    setActiveTab("info");
    loadPresetQuartet();
    setImageFiles([]);
    setImagePreviews([]);
    setEditingComboImages([]);
    setFormSuccessMsg(null);
    setFormErrorMsg(null);
    setStepStatusMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Open Modal for Edit
  const openEditModal = async (combo: ComboProduct) => {
    const comboId = combo._id || combo.id || null;
    setEditingComboId(comboId);
    setActiveTab("info");

    let targetCombo = combo;
    if (comboId) {
      const fetched = await fetchComboProductDetails(comboId);
      if (fetched) targetCombo = fetched;
    }

    setComboName(targetCombo.combo_name || "");
    setSlug(targetCombo.slug || generateSlug(targetCombo.combo_name || ""));
    setBrand(targetCombo.brand || "SudhVeda Honey");
    setComboSize(targetCombo.combo_size || targetCombo.products?.length || 2);
    setProducts(
      targetCombo.products && targetCombo.products.length > 0
        ? targetCombo.products
        : [
            { name: "Mustard Honey", weight: 250, unit: "g" },
            { name: "Lychee Honey", weight: 250, unit: "g" },
          ]
    );
    setMrp(targetCombo.mrp || 1250);
    setSellingPrice(targetCombo.selling_price || 1000);
    setDescription(targetCombo.description || "");
    setKeyBenefits(targetCombo.key_benefits || "");
    setManufacturerInfo(
      targetCombo.manufacturer_information ||
        "Manufactured and Packed by SudhVeda Honey Pvt. Ltd., Plot No. 12, Industrial Area, Dehradun, Uttarakhand, India - 248001"
    );
    setShelfLife(targetCombo.shelf_life || "24 months from the date of packaging");
    setStorageInstructions(
      targetCombo.storage_instructions ||
        "Store in a cool, dry place away from direct sunlight. Do not refrigerate."
    );
    setCountryOfOrigin(targetCombo.country_of_origin || "India");
    setFssaiLicense(targetCombo.fssai_license_number || "10021045001234");
    setIsActive(targetCombo.is_active !== false);

    setEditingComboImages(targetCombo.images || []);
    setImageFiles([]);
    setImagePreviews([]);

    setFormErrorMsg(null);
    setFormSuccessMsg(null);
    setStepStatusMsg(null);
    setIsAddModalOpen(true);
  };

  // Submit Handler for Create & Patch Info
  const handleSaveComboProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comboName.trim()) {
      alert("Please enter a Combo Product Name");
      return;
    }

    if (products.length === 0) {
      alert("Please add at least one product item in the combo");
      return;
    }

    setSubmitting(true);
    setFormErrorMsg(null);
    setFormSuccessMsg(null);

    const formattedProducts = products.map((p) => ({
      name: p.name.trim(),
      weight: Number(p.weight) || 0,
      unit: p.unit.trim() || "g",
    }));

    const payload = {
      combo_name: comboName.trim(),
      slug: slug.trim() || generateSlug(comboName),
      brand: brand.trim() || "SudhVeda Honey",
      combo_size: Number(comboSize) || formattedProducts.length,
      products: formattedProducts,
      mrp: Number(mrp) || 0,
      selling_price: Number(sellingPrice) || 0,
      description: description.trim(),
      key_benefits: keyBenefits.trim(),
      manufacturer_information: manufacturerInfo.trim(),
      shelf_life: shelfLife.trim(),
      storage_instructions: storageInstructions.trim(),
      country_of_origin: countryOfOrigin.trim(),
      fssai_license_number: fssaiLicense.trim(),
      is_active: isActive,
    };

    let targetComboId = editingComboId;

    try {
      if (editingComboId) {
        // 🌐 PATCH /api/combo/products/update/combo-product/info/{{comboProductId}}
        setStepStatusMsg("Updating combo info (PATCH)...");
        const res = await fetch(
          `${API_BASE_URL}/api/combo/products/update/combo-product/info/${editingComboId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );

        const json = await res.json().catch(() => ({}));
        if (!res.ok && !json.success) {
          throw new Error(json.message || `Failed to update combo product (${res.status})`);
        }
      } else {
        // 🌐 POST /api/combo/products/create
        setStepStatusMsg("Creating combo product (POST)...");
        const res = await fetch(`${API_BASE_URL}/api/combo/products/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok && !json._id && !json.data?._id && !json.comboProductId && !json.data?.comboProductId) {
          throw new Error(json.message || `Failed to create combo product (${res.status})`);
        }

        targetComboId =
          json.comboProductId ||
          json.data?.comboProductId ||
          json._id ||
          json.id ||
          json.data?._id ||
          json.data?.id ||
          json.product?._id ||
          json.product?.id;
      }

      // Handle Image Uploads if images were selected
      if (imageFiles.length > 0 && targetComboId) {
        setStepStatusMsg("Uploading image files...");
        const formData = new FormData();
        imageFiles.forEach((file) => {
          formData.append("images", file);
          formData.append("image", file);
        });

        const imgEndpoint = editingComboId
          ? `${API_BASE_URL}/api/combo/products/update/comboProduct-image/${targetComboId}`
          : `${API_BASE_URL}/api/combo/products/image-uploads/${targetComboId}`;

        const imgMethod = editingComboId ? "PUT" : "POST";

        const imgRes = await fetch(imgEndpoint, {
          method: imgMethod,
          credentials: "include",
          body: formData,
        });

        if (!imgRes.ok) {
          const imgErr = await imgRes.json().catch(() => ({}));
          console.warn("Image upload notification:", imgErr);
        }
      }

      setFormSuccessMsg(
        editingComboId
          ? "Combo Product info updated successfully!"
          : "Combo Product created successfully!"
      );

      setTimeout(() => {
        setIsAddModalOpen(false);
        resetForm();
        void fetchComboProducts();
      }, 700);
    } catch (err: any) {
      console.error("Error saving combo product:", err);
      setFormErrorMsg(err.message || "Failed to save combo product");
    } finally {
      setSubmitting(false);
      setStepStatusMsg(null);
    }
  };

  // 🗑️ DELETE Image API (DELETE /api/combo/products/remove/combo-product/{{comboProductId}}/image/{{imageId}})
  const handleDeleteComboImage = async (comboProductId: string, imageId: string) => {
    if (!confirm("Are you sure you want to remove this image?")) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/combo/products/remove/combo-product/${comboProductId}/image/${imageId}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json" },
          credentials: "include",
        }
      );

      const json = await res.json().catch(() => ({}));
      if (res.ok || json.success) {
        setEditingComboImages((prev) =>
          prev.filter((img: any) => {
            const id = typeof img === "object" ? img._id || img.id || img.public_id : img;
            return id !== imageId;
          })
        );
        void fetchComboProducts();
      } else {
        alert(json.message || `Failed to delete image (${res.status})`);
      }
    } catch (err: any) {
      console.error("Error deleting image:", err);
      alert(err.message || "Failed to delete image");
    }
  };

  // Filter combo products by search query
  const filteredCombos = comboProducts.filter((combo) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const nameMatch = combo.combo_name?.toLowerCase().includes(term);
    const slugMatch = combo.slug?.toLowerCase().includes(term);
    const brandMatch = combo.brand?.toLowerCase().includes(term);
    const descMatch = combo.description?.toLowerCase().includes(term);
    const productMatch = combo.products?.some((p) => p.name?.toLowerCase().includes(term));
    return nameMatch || slugMatch || brandMatch || descMatch || productMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 👑 Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-[#FFFBF0] border border-[#F2D6A7] text-[#E69A00] rounded-2xl shadow-2xs">
            <Gift size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#2D2118]">Combo Gift Plans</h1>
              <span className="px-2.5 py-0.5 bg-amber-100 text-[#E69A00] font-bold text-[10px] rounded-full uppercase tracking-wider">
                API Standardized
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage gift sets, honey combos, pricing & details via REST API endpoints
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchComboProducts}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 shadow-2xs transition cursor-pointer shrink-0"
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
            <span>Create Combo Product</span>
          </button>
        </div>
      </div>

      {/* 📊 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#E69A00] flex items-center justify-center font-bold">
            <Gift size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Total Combos
            </p>
            <p className="text-xl font-extrabold text-[#2D2118]">{comboProducts.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Active Status
            </p>
            <p className="text-xl font-extrabold text-emerald-600">
              {comboProducts.filter((c) => c.is_active !== false).length} Active
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Items Curated
            </p>
            <p className="text-xl font-extrabold text-[#2D2118]">
              {comboProducts.reduce((acc, c) => acc + (c.products?.length || c.combo_size || 0), 0)}{" "}
              Honeys
            </p>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
          <button
            onClick={fetchComboProducts}
            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl font-bold transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Preset Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search combo name, slug, brand, honey varieties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase shrink-0">Quick Actions:</span>
          <button
            type="button"
            onClick={() => {
              resetForm();
              loadPresetQuartet();
              setIsAddModalOpen(true);
            }}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#E69A00] font-bold text-[11px] rounded-xl border border-amber-200 transition shrink-0 cursor-pointer flex items-center gap-1"
          >
            <Sparkles size={13} /> Preset: Quartet (4-Pack)
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              loadPresetGoldenDuo();
              setIsAddModalOpen(true);
            }}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#E69A00] font-bold text-[11px] rounded-xl border border-amber-200 transition shrink-0 cursor-pointer flex items-center gap-1"
          >
            <Sparkles size={13} /> Preset: Golden Duo (2-Pack)
          </button>
        </div>
      </div>

      {/* 🎁 Combo Products Cards Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-3xl p-16 border border-gray-100 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#E69A00]" size={36} />
            <p className="text-xs font-semibold text-gray-600">
              Fetching combo products from backend...
            </p>
          </div>
        ) : filteredCombos.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-gray-100 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
            <Gift size={44} className="text-gray-300 stroke-1" />
            <p className="text-sm font-bold text-gray-700">No Combo Products Found</p>
            <p className="text-xs text-gray-400 max-w-sm">
              Click &quot;Create Combo Product&quot; to define a new gift combo with custom honey varieties and pricing.
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="mt-2 px-5 py-2.5 bg-[#E69A00] text-white text-xs font-bold rounded-xl hover:bg-[#D48D00] shadow-md transition cursor-pointer"
            >
              + Create Combo Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCombos.map((combo) => {
              const comboId = combo._id || combo.id || "";
              const mainImg =
                combo.images && combo.images.length > 0
                  ? getImageUrl(combo.images[0])
                  : getImageUrl(combo.image || combo.image_url);

              const discount =
                combo.mrp && combo.selling_price && combo.mrp > combo.selling_price
                  ? Math.round(((combo.mrp - combo.selling_price) / combo.mrp) * 100)
                  : 0;

              const productsList = combo.products || [];

              return (
                <div
                  key={comboId || combo.slug}
                  className="bg-white rounded-3xl border border-gray-100 shadow-2xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  {/* Top Image & Badges */}
                  <div className="relative h-52 bg-gradient-to-b from-amber-50/50 to-gray-100 overflow-hidden border-b border-gray-100">
                    <img
                      src={mainImg}
                      alt={combo.combo_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm pointer-events-auto backdrop-blur-md ${
                          combo.is_active !== false
                            ? "bg-emerald-500/90 text-white"
                            : "bg-gray-700/80 text-white"
                        }`}
                      >
                        {combo.is_active !== false ? "Active" : "Inactive"}
                      </span>

                      <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs pointer-events-auto flex items-center gap-1">
                        <Layers size={12} className="text-[#E69A00]" />
                        {combo.combo_size || productsList.length || 0} Pack Combo
                      </span>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(combo)}
                        className="px-3.5 py-2 bg-white text-gray-800 rounded-xl font-bold text-xs shadow-md hover:bg-amber-50 hover:text-[#E69A00] transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={14} /> Edit Info
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedComboDetail(combo)}
                        className="px-3 py-2 bg-black/70 text-white rounded-xl font-bold text-xs shadow-md hover:bg-black transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={14} /> View
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-extrabold text-[#2D2118] line-clamp-2 group-hover:text-[#E69A00] transition-colors leading-snug">
                          {combo.combo_name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400">
                        <Tag size={12} className="text-[#E69A00] shrink-0" />
                        <span className="font-semibold text-gray-600">{combo.brand || "SudhVeda Honey"}</span>
                        <span>•</span>
                        <span className="text-[#E69A00] truncate max-w-[150px]">{combo.slug}</span>
                      </div>

                      {combo.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed pt-1">
                          {combo.description}
                        </p>
                      )}
                    </div>

                    {/* Included Honey Products */}
                    <div className="space-y-2 pt-1">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Package size={12} className="text-[#E69A00]" />
                        Included Honeys ({productsList.length}):
                      </p>

                      {productsList.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No products listed</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {productsList.map((p, idx) => (
                            <span
                              key={p._id || idx}
                              className="px-2.5 py-1 bg-amber-50/70 border border-amber-200/60 rounded-lg text-[11px] font-medium text-amber-950 flex items-center gap-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E69A00]"></span>
                              {p.name} ({p.weight}{p.unit || "g"})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price Banner */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Selling Price
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-extrabold text-[#E69A00]">
                            ₹{combo.selling_price || 0}
                          </span>
                          {combo.mrp && combo.mrp > (combo.selling_price || 0) && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{combo.mrp}
                            </span>
                          )}
                        </div>
                      </div>

                      {discount > 0 && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-lg border border-emerald-200">
                          {discount}% OFF
                        </span>
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
                      <Edit3 size={14} /> Edit Combo Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ➕ CREATE / EDIT COMBO PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-fadeIn">
          <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#FAF6F0] p-4 border-b border-[#F2E8D9] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-100 text-[#E69A00] rounded-2xl border border-amber-200">
                  <Gift size={20} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#2D2118]">
                    {editingComboId ? "Edit Combo Product (PATCH Info)" : "Create Combo Product (POST API)"}
                  </h2>
                  <p className="text-[11px] text-gray-500 font-mono">
                    {editingComboId
                      ? `PATCH /api/combo/products/update/combo-product/info/${editingComboId}`
                      : "POST /api/combo/products/create"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Presets Row */}
            <div className="bg-amber-50/60 px-5 py-2 border-b border-amber-100 flex items-center justify-between text-xs shrink-0">
              <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                <Sparkles size={13} className="text-[#E69A00]" /> Quick Payload Presets:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadPresetQuartet}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-[#E69A00] font-bold text-[11px] rounded-lg border border-amber-300 transition cursor-pointer"
                >
                  Honey Lovers Quartet (4-Pack)
                </button>
                <button
                  type="button"
                  onClick={loadPresetGoldenDuo}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-[#E69A00] font-bold text-[11px] rounded-lg border border-amber-300 transition cursor-pointer"
                >
                  Golden Duo (2-Pack)
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-gray-50 px-6 py-2 border-b border-gray-200 flex items-center gap-4 text-xs font-bold shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`py-1.5 px-3 rounded-lg cursor-pointer transition ${
                  activeTab === "info"
                    ? "bg-[#E69A00] text-white shadow-2xs"
                    : "text-gray-600 hover:bg-gray-200/70"
                }`}
              >
                1. Basic Info
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className={`py-1.5 px-3 rounded-lg cursor-pointer transition flex items-center gap-1 ${
                  activeTab === "products"
                    ? "bg-[#E69A00] text-white shadow-2xs"
                    : "text-gray-600 hover:bg-gray-200/70"
                }`}
              >
                2. Included Products ({products.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pricing")}
                className={`py-1.5 px-3 rounded-lg cursor-pointer transition ${
                  activeTab === "pricing"
                    ? "bg-[#E69A00] text-white shadow-2xs"
                    : "text-gray-600 hover:bg-gray-200/70"
                }`}
              >
                3. Pricing & Specs
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("images")}
                className={`py-1.5 px-3 rounded-lg cursor-pointer transition ${
                  activeTab === "images"
                    ? "bg-[#E69A00] text-white shadow-2xs"
                    : "text-gray-600 hover:bg-gray-200/70"
                }`}
              >
                4. Images ({editingComboImages.length + imageFiles.length})
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveComboProduct} className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {formErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0 text-rose-600" />
                    <span>{formErrorMsg}</span>
                  </div>
                )}

                {formSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                    <span>{formSuccessMsg}</span>
                  </div>
                )}

                {stepStatusMsg && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-pulse">
                    <Loader2 size={16} className="animate-spin text-[#E69A00] shrink-0" />
                    <span>{stepStatusMsg}</span>
                  </div>
                )}

                {/* TAB 1: BASIC INFO */}
                {activeTab === "info" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Combo Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Honey Lovers Quartet"
                        value={comboName}
                        onChange={(e) => handleComboNameChange(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Slug <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="mustard-multiflora-lychee-forest-honey-lovers-quartet"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Brand</label>
                        <input
                          type="text"
                          placeholder="SudhVeda Honey"
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        placeholder="An exquisite collection of four naturally sourced honeys..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Key Benefits</label>
                      <textarea
                        rows={2}
                        placeholder="Supports immunity, rich in antioxidants, natural energy booster..."
                        value={keyBenefits}
                        onChange={(e) => setKeyBenefits(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: INCLUDED PRODUCTS */}
                {activeTab === "products" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between bg-amber-50 p-3 rounded-2xl border border-amber-100">
                      <div>
                        <h4 className="font-bold text-amber-900 text-xs">
                          Combo Products Array ({products.length} Items)
                        </h4>
                        <p className="text-[10px] text-amber-700">
                          These items are passed as `products` array in POST & PATCH requests
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateProductsList([
                            ...products,
                            { name: "", weight: 250, unit: "g" },
                          ])
                        }
                        className="px-3 py-1.5 bg-[#E69A00] hover:bg-[#D48D00] text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} /> Add Product Item
                      </button>
                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {products.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs"
                        >
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-[#E69A00] font-bold flex items-center justify-center text-[10px] shrink-0">
                            {idx + 1}
                          </span>

                          <div className="flex-1">
                            <input
                              type="text"
                              required
                              placeholder="Honey Name (e.g. Mustard Honey)"
                              value={p.name}
                              onChange={(e) => {
                                const updated = [...products];
                                updated[idx].name = e.target.value;
                                updateProductsList(updated);
                              }}
                              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] font-medium"
                            />
                          </div>

                          <div className="w-24">
                            <input
                              type="number"
                              required
                              min={1}
                              placeholder="Weight (250)"
                              value={p.weight}
                              onChange={(e) => {
                                const updated = [...products];
                                updated[idx].weight = e.target.value ? Number(e.target.value) : "";
                                updateProductsList(updated);
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] font-mono"
                            />
                          </div>

                          <div className="w-20">
                            <select
                              value={p.unit}
                              onChange={(e) => {
                                const updated = [...products];
                                updated[idx].unit = e.target.value;
                                updateProductsList(updated);
                              }}
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] font-mono cursor-pointer"
                            >
                              <option value="g">g</option>
                              <option value="kg">kg</option>
                              <option value="ml">ml</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = products.filter((_, i) => i !== idx);
                              updateProductsList(updated);
                            }}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                            title="Remove Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: PRICING & SPECS */}
                {activeTab === "pricing" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Combo Size <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          placeholder="4"
                          value={comboSize}
                          onChange={(e) => setComboSize(e.target.value ? Number(e.target.value) : "")}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-bold text-gray-800"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          MRP (₹) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          placeholder="2000"
                          value={mrp}
                          onChange={(e) => setMrp(e.target.value ? Number(e.target.value) : "")}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-mono"
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
                          placeholder="1699"
                          value={sellingPrice}
                          onChange={(e) =>
                            setSellingPrice(e.target.value ? Number(e.target.value) : "")
                          }
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-extrabold text-[#E69A00]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Shelf Life</label>
                        <input
                          type="text"
                          placeholder="24 months from the date of packaging"
                          value={shelfLife}
                          onChange={(e) => setShelfLife(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Country of Origin</label>
                        <input
                          type="text"
                          placeholder="India"
                          value={countryOfOrigin}
                          onChange={(e) => setCountryOfOrigin(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">FSSAI License Number</label>
                        <input
                          type="text"
                          placeholder="10021045001234"
                          value={fssaiLicense}
                          onChange={(e) => setFssaiLicense(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Status</label>
                        <select
                          value={isActive ? "true" : "false"}
                          onChange={(e) => setIsActive(e.target.value === "true")}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition cursor-pointer font-bold"
                        >
                          <option value="true">Active (Visible)</option>
                          <option value="false">Inactive (Hidden)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Storage Instructions</label>
                      <input
                        type="text"
                        placeholder="Store in a cool, dry place away from direct sunlight. Do not refrigerate."
                        value={storageInstructions}
                        onChange={(e) => setStorageInstructions(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
                      />
                    </div>

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

                {/* TAB 4: IMAGES */}
                {activeTab === "images" && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Existing Images */}
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
                                className="relative group rounded-2xl overflow-hidden border border-gray-200 h-32 bg-gray-50 flex items-center justify-center"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Combo image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {imgId && editingComboId && (
                                  <button
                                    type="button"
                                    title="Delete image from API"
                                    onClick={() => handleDeleteComboImage(editingComboId, imgId)}
                                    className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl opacity-90 hover:opacity-100 shadow-md transition cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* New Upload Area */}
                    <div>
                      <label className="block font-bold text-gray-700 text-xs mb-1">
                        Select New Image File(s) to Upload
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 hover:border-[#E69A00] bg-gray-50 hover:bg-[#FFFBF5] rounded-3xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 group"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              setImageFiles((prev) => [...prev, ...files]);
                              const newPreviews = files.map((f) => URL.createObjectURL(f));
                              setImagePreviews((prev) => [...prev, ...newPreviews]);
                            }
                          }}
                          className="hidden"
                        />

                        <div className="w-12 h-12 rounded-full bg-amber-100 text-[#E69A00] flex items-center justify-center">
                          <Upload size={22} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-700">
                            Click to select product image files
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                            POST /api/combo/products/image-uploads/&#123;comboProductId&#125;
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Selected Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="space-y-2">
                        <label className="block font-bold text-gray-700 text-xs">
                          Files Ready for Upload ({imagePreviews.length})
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {imagePreviews.map((preview, idx) => (
                            <div
                              key={idx}
                              className="relative group rounded-2xl overflow-hidden border border-amber-300 h-28 bg-amber-50"
                            >
                              <img
                                src={preview}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
                                  setImageFiles((prev) => prev.filter((_, i) => i !== idx));
                                }}
                                className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-lg cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Actions Footer */}
              <div className="shrink-0 bg-gray-50 border-t border-gray-200 px-5 py-3 flex items-center justify-between">
                <button
                  type="button"
                  disabled={submitting}
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
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {submitting
                    ? "Saving Combo..."
                    : editingComboId
                    ? "Update Combo Product (PATCH)"
                    : "Create Combo Product (POST)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔍 DETAIL DRAWER / MODAL */}
      {selectedComboDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-100 text-[#E69A00] rounded-xl">
                  <Gift size={22} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedComboDetail.combo_name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">{selectedComboDetail.slug}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedComboDetail(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-48 rounded-2xl overflow-hidden border border-gray-100">
                <img
                  src={getImageUrl(
                    selectedComboDetail.images?.[0] || selectedComboDetail.image || selectedComboDetail.image_url
                  )}
                  alt={selectedComboDetail.combo_name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 text-xs">
                <p>
                  <strong className="text-gray-700">Brand:</strong> {selectedComboDetail.brand || "SudhVeda Honey"}
                </p>
                <p>
                  <strong className="text-gray-700">Combo Size:</strong> {selectedComboDetail.combo_size || selectedComboDetail.products?.length}
                </p>
                <p>
                  <strong className="text-gray-700">Selling Price:</strong>{" "}
                  <span className="font-extrabold text-[#E69A00]">₹{selectedComboDetail.selling_price}</span>
                </p>
                <p>
                  <strong className="text-gray-700">MRP:</strong> ₹{selectedComboDetail.mrp}
                </p>
                <p>
                  <strong className="text-gray-700">Shelf Life:</strong> {selectedComboDetail.shelf_life}
                </p>
                <p>
                  <strong className="text-gray-700">FSSAI:</strong> {selectedComboDetail.fssai_license_number}
                </p>
                <p>
                  <strong className="text-gray-700">Origin:</strong> {selectedComboDetail.country_of_origin}
                </p>
              </div>
            </div>

            {selectedComboDetail.description && (
              <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
                <strong className="block text-gray-800 mb-1">Description:</strong>
                {selectedComboDetail.description}
              </div>
            )}

            {selectedComboDetail.products && selectedComboDetail.products.length > 0 && (
              <div className="space-y-2">
                <strong className="block text-xs font-bold text-gray-800">
                  Included Honeys ({selectedComboDetail.products.length}):
                </strong>
                <div className="grid grid-cols-2 gap-2">
                  {selectedComboDetail.products.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 font-medium"
                    >
                      {p.name} — {p.weight}{p.unit || "g"}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedComboDetail(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
