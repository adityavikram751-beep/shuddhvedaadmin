"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  UserCheck,
  RefreshCw,
  Sparkles,
  Package,
  Layers,
  Image as ImageIcon,
  Check,
  Upload,
  X,
  Loader2,
  Star,
  Tag,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  image: string;
  public_id?: string;
  packageLabel: string;
  quantityPerJar: number;
  quantityUnit: string;
  numberOfJars: number;
  totalQuantity: number;
  totalQuantityUnit: string;
  idealFor: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  currency: string;
  badge: string;
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
  durationMonths?: number;
  deliveriesPerMonth?: number;
  jarsPerDelivery?: number;
  createdAt?: string;
  updatedAt?: string;
}

const mockPlans: SubscriptionPlan[] = [
  {
    _id: "6a82a70121741212bb86d7e0",
    name: "Family Plan",
    description: "Our most popular plan for daily health, cooking & tea needs for the entire household.",
    image: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600&auto=format&fit=crop&q=70",
    packageLabel: "250 g × 6 Jars",
    quantityPerJar: 250,
    quantityUnit: "g",
    numberOfJars: 6,
    totalQuantity: 1.5,
    totalQuantityUnit: "kg",
    idealFor: "Perfect for everyday family use",
    price: 4299,
    originalPrice: 4794,
    discountPercentage: 10.33,
    currency: "INR",
    badge: "MOST POPULAR",
    isPopular: true,
    isActive: true,
    displayOrder: 1,
  },
  {
    _id: "6a82a70121741212bb86d7e1",
    name: "Royal Ayurvedic Pack",
    description: "Premium selection of raw Sidr & Wildflower honey jars for immunity boost.",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=600&auto=format&fit=crop&q=70",
    packageLabel: "500 g × 3 Jars",
    quantityPerJar: 500,
    quantityUnit: "g",
    numberOfJars: 3,
    totalQuantity: 1.5,
    totalQuantityUnit: "kg",
    idealFor: "Best for immunity boosters & gift boxes",
    price: 3499,
    originalPrice: 3999,
    discountPercentage: 12.5,
    currency: "INR",
    badge: "PREMIUM SELECTION",
    isPopular: false,
    isActive: true,
    displayOrder: 2,
  },
];

export default function SubscribeManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // INLINE FORM TOGGLE (Opens directly inside the page, NOT as a popup modal)
  const [showInlineForm, setShowInlineForm] = useState(false);

  // Form Fields
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [packageLabel, setPackageLabel] = useState("250 g × 6 Jars");
  const [quantityPerJar, setQuantityPerJar] = useState<number>(250);
  const [quantityUnit, setQuantityUnit] = useState("g");
  const [numberOfJars, setNumberOfJars] = useState<number>(6);
  const [totalQuantity, setTotalQuantity] = useState<number>(1.5);
  const [totalQuantityUnit, setTotalQuantityUnit] = useState("kg");
  const [idealFor, setIdealFor] = useState("Perfect for everyday family use");
  const [price, setPrice] = useState<number>(4299);
  const [originalPrice, setOriginalPrice] = useState<number>(4794);
  const [discountPercentage, setDiscountPercentage] = useState<number>(10.33);
  const [badge, setBadge] = useState("MOST POPULAR");
  const [isPopular, setIsPopular] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [deliveriesPerMonth, setDeliveriesPerMonth] = useState<number>(1);
  const [jarsPerDelivery, setJarsPerDelivery] = useState<number>(1);

  // GET API Call - Fetch ONLY real backend data
  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/subscripation/plan/all-plans`, {
        method: "GET",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (json && (Array.isArray(json.data) || Array.isArray(json))) {
        const liveData = Array.isArray(json.data) ? json.data : json;
        setPlans(liveData);
      }
    } catch (err) {
      console.error("Error fetching subscription plans GET API:", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    void fetchPlans();
  }, []);

  // Calculate discount percentage automatically
  const handlePriceChange = (newPrice: number, newOrigPrice: number) => {
    setPrice(newPrice);
    setOriginalPrice(newOrigPrice);
    if (newOrigPrice > 0 && newPrice > 0 && newOrigPrice >= newPrice) {
      const disc = ((newOrigPrice - newPrice) / newOrigPrice) * 100;
      setDiscountPercentage(Number(disc.toFixed(2)));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  // POST API Call (FormData)
  const handleAddPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a plan name");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      }
      formData.append("packageLabel", packageLabel.trim());
      formData.append("quantityPerJar", String(quantityPerJar));
      formData.append("quantityUnit", quantityUnit.trim());
      formData.append("numberOfJars", String(numberOfJars));
      formData.append("totalQuantity", String(totalQuantity));
      formData.append("totalQuantityUnit", totalQuantityUnit.trim());
      formData.append("idealFor", idealFor.trim());
      formData.append("price", String(price));
      formData.append("originalPrice", String(originalPrice));
      formData.append("discountPercentage", String(discountPercentage));
      formData.append("badge", badge.trim());
      formData.append("isPopular", String(isPopular));
      formData.append("isActive", String(isActive));
      formData.append("displayOrder", String(displayOrder));
      formData.append("durationMonths", String(durationMonths));
      formData.append("deliveriesPerMonth", String(deliveriesPerMonth));
      formData.append("jarsPerDelivery", String(jarsPerDelivery));

      const res = await fetch(`${API_BASE_URL}/api/subscripation/plan/add`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && (json.success || json.data)) {
        alert("Subscription Plan created successfully!");
        setShowInlineForm(false);
        resetForm();
        void fetchPlans();
      } else {
        // Fallback state update
        const newPlanItem: SubscriptionPlan = {
          _id: json.data?._id || `PLAN-${Date.now()}`,
          name: name.trim(),
          description: description.trim(),
          image: imagePreview || "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600",
          packageLabel: packageLabel.trim(),
          quantityPerJar,
          quantityUnit,
          numberOfJars,
          totalQuantity,
          totalQuantityUnit,
          idealFor: idealFor.trim(),
          price,
          originalPrice,
          discountPercentage,
          currency: "INR",
          badge: badge.trim(),
          isPopular,
          isActive,
          displayOrder,
          durationMonths,
          deliveriesPerMonth,
          jarsPerDelivery,
        };
        setPlans([newPlanItem, ...plans]);
        setShowInlineForm(false);
        resetForm();
      }
    } catch (err) {
      console.error("Error posting subscription plan:", err);
      setShowInlineForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE API Call
  const handleDeletePlan = async (planId: string) => {
    if (confirm("Are you sure you want to delete this subscription plan?")) {
      try {
        await fetch(`${API_BASE_URL}/api/subscripation/plan/remove/${planId}`, {
          method: "DELETE",
          credentials: "include",
        });
      } catch (err) {
        console.error("Error deleting plan:", err);
      }
      setPlans(plans.filter((p) => p._id !== planId));
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageFile(null);
    setImagePreview("");
    setPackageLabel("250 g × 6 Jars");
    setQuantityPerJar(250);
    setQuantityUnit("g");
    setNumberOfJars(6);
    setTotalQuantity(1.5);
    setTotalQuantityUnit("kg");
    setIdealFor("Perfect for everyday family use");
    setPrice(4299);
    setOriginalPrice(4794);
    setDiscountPercentage(10.33);
    setBadge("MOST POPULAR");
    setIsPopular(true);
    setIsActive(true);
    setDisplayOrder(1);
    setDurationMonths(6);
    setDeliveriesPerMonth(1);
    setJarsPerDelivery(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#FFF8EF] border border-[#F2D6A7] text-[#E69A00] rounded-xl">
              <UserCheck size={20} />
            </span>
            <h1 className="text-2xl font-bold text-[#2D2118]">Subscription Plans</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Create, edit & manage customer subscription plan cards & pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPlans}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FAF6F0] hover:bg-[#FFF3DF] text-[#2D3A1B] font-semibold text-xs rounded-xl border border-[#F2E8D9] transition cursor-pointer"
          >
            <RefreshCw size={14} className={loadingPlans ? "animate-spin" : ""} /> Refresh Plans
          </button>

          <button
            onClick={() => setShowInlineForm(!showInlineForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E69A00] hover:bg-[#C98715] text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer"
          >
            {showInlineForm ? (
              <>
                <ChevronUp size={16} /> Hide Add Form
              </>
            ) : (
              <>
                <Plus size={16} /> Add Subscription Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* INLINE ADD SUBSCRIPTION PLAN FORM (OPENS DIRECTLY ON THE PAGE) */}
      {showInlineForm && (
        <div className="bg-gradient-to-br from-[#FFFBF5] via-[#FFF9EE] to-[#FFF4E0] border-2 border-[#F2D6A7] rounded-2xl p-6 shadow-md transition-all duration-300 space-y-5 animate-fadeIn">
          {/* Form Header */}
          <div className="flex items-center justify-between border-b border-[#F2D6A7]/70 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#E69A00] text-white flex items-center justify-center font-bold text-sm">
                +
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#2D2118] flex items-center gap-2">
                  Create New Subscription Plan Card
                </h2>
                <p className="text-xs text-gray-500">
                  Fills <span className="font-mono text-[#B97B00]">POST /api/subscripation/plan/add</span> (FormData with image file)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInlineForm(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 bg-white rounded-lg border border-gray-200"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleAddPlanSubmit} className="space-y-5 text-xs text-gray-700">
            {/* Section 1: Image Upload Box */}
            <div className="bg-white p-4 rounded-xl border border-[#F2E8D9]">
              <label className="block font-bold uppercase text-[#3A3550] mb-2 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-[#E69A00]" /> 1. Upload Plan Image
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#F2D6A7] hover:border-[#E69A00] rounded-xl p-4 text-center cursor-pointer bg-[#FFFBF5] transition flex flex-col items-center justify-center min-h-32"
              >
                {imagePreview ? (
                  <div className="relative w-full max-w-xs h-36">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl shadow-xs" />
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md font-semibold">
                      Change Image
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1 py-2">
                    <Upload className="mx-auto text-[#E69A00]" size={28} />
                    <p className="font-bold text-gray-800 text-sm">Click to choose image file</p>
                    <p className="text-[11px] text-gray-400">Cloudinary automatic image upload</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Section 2: Plan Identity */}
            <div className="bg-white p-4 rounded-xl border border-[#F2E8D9] space-y-3">
              <span className="font-bold uppercase text-[#3A3550] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#E69A00]" /> 2. Plan Info & Title
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Family Plan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E69A00] font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. MOST POPULAR / BEST VALUE"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E69A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Our most popular plan for daily health and cooking needs"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E69A00] resize-none"
                />
              </div>
            </div>

            {/* Section 3: Packaging & Jars */}
            <div className="bg-white p-4 rounded-xl border border-[#F2E8D9] space-y-3">
              <span className="font-bold uppercase text-[#3A3550] flex items-center gap-1.5">
                <Package size={14} className="text-[#E69A00]" /> 3. Jar Quantity & Packaging Details
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Package Label</label>
                  <input
                    type="text"
                    placeholder="e.g. 250 g × 6 Jars"
                    value={packageLabel}
                    onChange={(e) => setPackageLabel(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E69A00]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ideal For Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Perfect for everyday family use"
                    value={idealFor}
                    onChange={(e) => setIdealFor(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E69A00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF6F0] p-3 rounded-xl border border-[#F2E8D9]">
                <div>
                  <label className="block font-semibold text-gray-500 text-[11px] mb-1">Qty per Jar</label>
                  <input
                    type="number"
                    value={quantityPerJar}
                    onChange={(e) => setQuantityPerJar(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-500 text-[11px] mb-1">Unit</label>
                  <input
                    type="text"
                    value={quantityUnit}
                    onChange={(e) => setQuantityUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-500 text-[11px] mb-1">No. of Jars</label>
                  <input
                    type="number"
                    value={numberOfJars}
                    onChange={(e) => setNumberOfJars(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-500 text-[11px] mb-1">Total Weight (e.g. 1.5 kg)</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={totalQuantity}
                      onChange={(e) => setTotalQuantity(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={totalQuantityUnit}
                      onChange={(e) => setTotalQuantityUnit(e.target.value)}
                      className="w-10 px-1 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery & Duration Plan Details */}
              <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#F2E8D9]">
                <label className="block font-bold text-gray-700 text-[11px] uppercase tracking-wider mb-2">
                  Subscription Duration & Frequency
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-600 text-[11px] mb-1">
                      Duration (Months) <span className="font-mono text-[#E69A00] text-[10px]">(durationMonths)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="6"
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-[#E69A00] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 text-[11px] mb-1">
                      Deliveries / Month <span className="font-mono text-[#E69A00] text-[10px]">(deliveriesPerMonth)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={deliveriesPerMonth}
                      onChange={(e) => setDeliveriesPerMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-[#E69A00] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 text-[11px] mb-1">
                      Jars / Delivery <span className="font-mono text-[#E69A00] text-[10px]">(jarsPerDelivery)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={jarsPerDelivery}
                      onChange={(e) => setJarsPerDelivery(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-[#E69A00] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Pricing & Discount */}
            <div className="bg-white p-4 rounded-xl border border-[#F2E8D9] space-y-3">
              <span className="font-bold uppercase text-[#3A3550] flex items-center gap-1.5">
                <Tag size={14} className="text-[#E69A00]" /> 4. Pricing & Discount Calculation
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="4299"
                    value={price}
                    onChange={(e) => handlePriceChange(Number(e.target.value), originalPrice)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#2D2118] outline-none focus:border-[#E69A00]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    placeholder="4794"
                    value={originalPrice}
                    onChange={(e) => handlePriceChange(price, Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E69A00]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-800">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                      className="w-4 h-4 accent-[#E69A00] rounded"
                    />
                    Mark as Popular Badge
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-800">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 accent-[#2D3A1B] rounded"
                    />
                    Active & Available
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="font-semibold text-gray-500">Display Order:</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-16 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Inline Form Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInlineForm(false)}
                className="px-5 py-2.5 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#2D3A1B] hover:bg-[#1E2712] rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving Plan...
                  </>
                ) : (
                  <>
                    <Check size={16} /> Save & Publish Subscription Plan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subscription Plans Cards Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2F241C] flex items-center gap-2">
            <Sparkles size={18} className="text-[#E69A00]" /> All Subscription Cards ({plans.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingPlans ? (
            <div className="col-span-full bg-white p-12 rounded-2xl border border-gray-100 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#E69A00]" size={28} />
              <p className="text-sm font-semibold text-gray-600">Fetching live subscription plans from API...</p>
            </div>
          ) : plans.length > 0 ? (
            plans.map((plan) => (
              <div
                key={plan._id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Card Image */}
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    {plan.image ? (
                      <img
                        src={plan.image}
                        alt={plan.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-amber-50">
                        <ImageIcon size={40} />
                      </div>
                    )}

                    {/* Floating Badges */}
                    {plan.badge && (
                      <span className="absolute top-3 left-3 bg-[#E69A00] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                        {plan.badge}
                      </span>
                    )}
                    {plan.isPopular && (
                      <span className="absolute top-3 right-3 bg-[#2D3A1B] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Star size={11} className="fill-amber-400 text-amber-400" /> Popular
                      </span>
                    )}
                  </div>

                  {/* Card Main Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-xl font-bold text-[#2D2118]">{plan.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{plan.description}</p>

                    {/* Package details pills */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF6F0] border border-[#F2E8D9] text-[#B97B00] rounded-lg text-xs font-semibold">
                        <Package size={13} /> {plan.packageLabel}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/70 text-emerald-700 rounded-lg text-xs font-semibold">
                        <Layers size={13} /> Total {plan.totalQuantity} {plan.totalQuantityUnit}
                      </span>
                      {(plan.durationMonths !== undefined || plan.deliveriesPerMonth !== undefined || plan.jarsPerDelivery !== undefined) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/70 text-amber-900 rounded-lg text-xs font-semibold">
                          ⏱ {plan.durationMonths ?? 1} Mths | {plan.deliveriesPerMonth ?? 1} Del/Mo | {plan.jarsPerDelivery ?? 1} Jar/Del
                        </span>
                      )}
                    </div>

                    {/* Ideal For */}
                    {plan.idealFor && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic">
                        💡 {plan.idealFor}
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="pt-2 border-t border-gray-100 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#2D2118]">
                        ₹{plan.price ? plan.price.toLocaleString("en-IN") : "0"}
                      </span>
                      {plan.originalPrice > plan.price && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{plan.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                      {plan.discountPercentage > 0 && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {plan.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className={`font-semibold flex items-center gap-1.5 ${plan.isActive ? "text-emerald-600" : "text-gray-400"}`}>
                    <span className={`h-2 w-2 rounded-full ${plan.isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
                    {plan.isActive ? "Active Plan" : "Inactive"}
                  </span>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 font-semibold cursor-pointer"
                    title="Remove Subscription Plan"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400">
              No subscription plans found from API. Click "+ Add Subscription Plan" to create your first plan!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
