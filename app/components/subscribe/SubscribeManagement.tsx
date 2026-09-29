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
  Calendar,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Box,
  Gift,
  Sun,
  Leaf,
  ChevronDown,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

// ---------- Interfaces ----------
export interface PlanProductItem {
  name: string;
  weight: number | string;
  unit: string;
}

export interface ComboSetMonthItem {
  _id: string;
  monthName: string;
  title: string;
  image?: string;
  public_id?: string;
  products?: PlanProductItem[];
  season?: string;
  harvestTitle?: string;
  description?: string;
  readMore?: string;
}

export interface ComboSetParent {
  _id?: string;
  combosets?: ComboSetMonthItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionPlan {
  _id: string;
  id?: string;
  name: string;
  description: string;
  idealFor: string;
  durationMonths: number;
  comboSetId?: ComboSetParent | string | any;
  combosets?: ComboSetMonthItem[];
  comboSets?: ComboSetMonthItem[];
  price: number;
  originalPrice: number;
  discountPercentage?: number;
  currency: string;
  badge: string;
  isPopular: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const MONTHS_LIST = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SEASONS_LIST = [
  "Summer Harvest",
  "Monsoon Harvest",
  "Winter Harvest",
  "Spring Harvest",
  "Autumn Harvest",
];

export default function SubscribeManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submittingPlan, setSubmittingPlan] = useState(false);
  const [submittingCombo, setSubmittingCombo] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Form Toggles
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showAddComboModal, setShowAddComboModal] = useState(false);
  const [selectedPlanForCombo, setSelectedPlanForCombo] = useState<SubscriptionPlan | null>(null);

  // ------------------------------------------------------------------
  // 1. ADD PLAN FORM FIELDS
  // ------------------------------------------------------------------
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [idealFor, setIdealFor] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [currency, setCurrency] = useState("INR");
  const [badge, setBadge] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [durationMonths, setDurationMonths] = useState<number | "">(12);
  const [isActive, setIsActive] = useState(true);

  const [planImageFile, setPlanImageFile] = useState<File | null>(null);
  const [planImagePreview, setPlanImagePreview] = useState<string>("");
  const planFileInputRef = useRef<HTMLInputElement>(null);

  // ------------------------------------------------------------------
  // 2. ADD MONTHLY COMBO SET FORM FIELDS
  // ------------------------------------------------------------------
  const [comboMonthName, setComboMonthName] = useState("January");
  const [comboTitle, setComboTitle] = useState("");
  const [comboSeason, setComboSeason] = useState("Summer Harvest");
  const [comboHarvestTitle, setComboHarvestTitle] = useState("");
  const [comboDescription, setComboDescription] = useState("");
  const [comboReadMore, setComboReadMore] = useState("");

  const [comboProducts, setComboProducts] = useState<PlanProductItem[]>([
    { name: "Premium Mustard Honey", weight: 500, unit: "g" },
    { name: "Wild Forest Honey", weight: 500, unit: "g" },
  ]);

  const [comboImageFile, setComboImageFile] = useState<File | null>(null);
  const [comboImagePreview, setComboImagePreview] = useState<string>("");
  const comboFileInputRef = useRef<HTMLInputElement>(null);

  // ------------------------------------------------------------------
  // SCROLL LOCK EFFECT WHEN MODALS ARE OPEN
  // ------------------------------------------------------------------
  useEffect(() => {
    if (showAddPlanModal || showAddComboModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddPlanModal, showAddComboModal]);

  // ------------------------------------------------------------------
  // API 1: GET {{baseUrl}}/api/subscripation/plan/all-plans
  // ------------------------------------------------------------------
  const fetchPlans = async () => {
    setLoadingPlans(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/subscripation/plan/all-plans`, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        const liveData = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.plans)
          ? json.plans
          : Array.isArray(json)
          ? json
          : [];
        setPlans(liveData);
      } else {
        setErrorMsg(json.message || `Failed to fetch subscription plans (${res.status})`);
      }
    } catch (err: any) {
      console.error("Error fetching subscription plans:", err);
      setErrorMsg(err.message || "Failed to communicate with subscription API server");
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    void fetchPlans();
  }, []);

  // ------------------------------------------------------------------
  // API 2: DELETE {{baseUrl}}/api/subscripation/plan/remove/{{plansId}}
  // ------------------------------------------------------------------
  const handleDeletePlan = async (plansId: string) => {
    if (!confirm("Are you sure you want to delete this subscription plan?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/subscripation/plan/remove/${plansId}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok || json.success) {
        setSuccessMsg("Subscription plan deleted successfully!");
        setPlans((prev) => prev.filter((p) => (p._id || p.id) !== plansId));
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(json.message || `Failed to delete plan (${res.status})`);
      }
    } catch (err: any) {
      console.error("Error deleting subscription plan:", err);
      alert(err.message || "Failed to delete subscription plan");
    }
  };

  // ------------------------------------------------------------------
  // API 3: POST {{baseUrl}}/api/subscripation/plan/add
  // ------------------------------------------------------------------
  const handleAddPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a plan name");
      return;
    }
    if (!price || Number(price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    setSubmittingPlan(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const jsonBody = {
      name: name.trim(),
      description: description.trim(),
      idealFor: idealFor.trim(),
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price),
      currency: currency.trim() || "INR",
      badge: badge.trim(),
      isPopular: Boolean(isPopular),
      durationMonths: Number(durationMonths) || 12,
      isActive: Boolean(isActive),
    };

    try {
      let res: Response;

      if (planImageFile) {
        const formData = new FormData();
        Object.entries(jsonBody).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            formData.append(key, String(val));
          }
        });
        formData.append("image", planImageFile);

        res = await fetch(`${API_BASE_URL}/api/subscripation/plan/add`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/subscripation/plan/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify(jsonBody),
        });
      }

      const json = await res.json().catch(() => ({}));
      if (res.ok || json.success || json._id || json.data) {
        setSuccessMsg("Subscription plan created successfully!");
        setShowAddPlanModal(false);
        resetPlanForm();
        void fetchPlans();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        throw new Error(json.message || `Failed to create subscription plan (${res.status})`);
      }
    } catch (err: any) {
      console.error("Error adding subscription plan:", err);
      setErrorMsg(err.message || "Failed to create subscription plan");
    } finally {
      setSubmittingPlan(false);
    }
  };

  // ------------------------------------------------------------------
  // API 4: POST {{baseUrl}}/api/subscripation/plan/add/plan-comboset
  // ------------------------------------------------------------------
  const handleAddComboSetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForCombo) return;

    const targetPlanId = selectedPlanForCombo._id || selectedPlanForCombo.id;
    if (!targetPlanId) {
      alert("Invalid plan selected");
      return;
    }

    if (!comboTitle.trim()) {
      alert("Please enter a Title for the Month Combo Set");
      return;
    }

    setSubmittingCombo(true);
    try {
      const formData = new FormData();
      formData.append("planId", targetPlanId);
      formData.append("plan_id", targetPlanId);
      formData.append("monthName", comboMonthName.trim());
      formData.append("title", comboTitle.trim());
      formData.append("season", comboSeason.trim());
      formData.append("harvestTitle", comboHarvestTitle.trim() || `${comboMonthName} Floral Harvest`);
      formData.append("description", comboDescription.trim());
      formData.append("readMore", comboReadMore.trim());
      formData.append("products", JSON.stringify(comboProducts));

      if (comboImageFile) {
        formData.append("image", comboImageFile);
      }

      let res = await fetch(`${API_BASE_URL}/api/subscripation/plan/add/plan-comboset`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      // If server expects JSON payload instead of FormData
      if (!res.ok && res.status === 400) {
        const jsonBody = {
          planId: targetPlanId,
          plan_id: targetPlanId,
          monthName: comboMonthName.trim(),
          title: comboTitle.trim(),
          season: comboSeason.trim(),
          harvestTitle: comboHarvestTitle.trim() || `${comboMonthName} Floral Harvest`,
          description: comboDescription.trim(),
          readMore: comboReadMore.trim(),
          products: comboProducts,
        };

        res = await fetch(`${API_BASE_URL}/api/subscripation/plan/add/plan-comboset`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify(jsonBody),
        });
      }

      const json = await res.json().catch(() => ({}));
      if (res.ok || json.success) {
        setSuccessMsg("Monthly Combo Set added to plan successfully!");
        setShowAddComboModal(false);
        resetComboForm();
        void fetchPlans();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(json.message || `Failed to add combo set to plan (${res.status})`);
      }
    } catch (err: any) {
      console.error("Error adding combo set to plan:", err);
      alert(err.message || "Failed to add combo set to plan");
    } finally {
      setSubmittingCombo(false);
    }
  };

  // ------------------------------------------------------------------
  // API 5: DELETE {{baseUrl}}/api/subscripation/plan/remove/combosets/{{planId}}/{{combosetId}}
  // ------------------------------------------------------------------
  const handleDeleteComboSet = async (planId: string, combosetId: string) => {
    if (!confirm("Are you sure you want to remove this combo set from the plan?")) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/subscripation/plan/remove/combosets/${planId}/${combosetId}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json" },
          credentials: "include",
        }
      );

      const json = await res.json().catch(() => ({}));
      if (res.ok || json.success) {
        setSuccessMsg("Combo set removed from plan!");
        void fetchPlans();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(json.message || `Failed to remove combo set (${res.status})`);
      }
    } catch (err: any) {
      console.error("Error removing combo set:", err);
      alert(err.message || "Failed to remove combo set");
    }
  };

  // Helper Resets
  const resetPlanForm = () => {
    setName("");
    setDescription("");
    setIdealFor("");
    setPrice("");
    setOriginalPrice("");
    setCurrency("INR");
    setBadge("");
    setIsPopular(false);
    setDurationMonths(12);
    setIsActive(true);
    setPlanImageFile(null);
    setPlanImagePreview("");
    if (planFileInputRef.current) planFileInputRef.current.value = "";
  };

  const resetComboForm = () => {
    setSelectedPlanForCombo(null);
    setComboMonthName("January");
    setComboTitle("");
    setComboSeason("");
    setComboHarvestTitle("");
    setComboDescription("");
    setComboReadMore("");
    setComboProducts([]);
    setComboImageFile(null);
    setComboImagePreview("");
    if (comboFileInputRef.current) comboFileInputRef.current.value = "";
  };

  const openAddComboModal = (plan: SubscriptionPlan) => {
    setSelectedPlanForCombo(plan);
    setComboMonthName("January");
    setComboTitle("");
    setComboSeason("");
    setComboHarvestTitle("");
    setComboDescription("");
    setComboReadMore("");
    setComboProducts([]);
    setComboImageFile(null);
    setComboImagePreview("");
    setShowAddComboModal(true);
  };

  // Helper to extract combosets array from populated plan object
  const getPlanComboSets = (plan: SubscriptionPlan): ComboSetMonthItem[] => {
    if (plan.comboSetId && typeof plan.comboSetId === "object" && Array.isArray(plan.comboSetId.combosets)) {
      return plan.comboSetId.combosets;
    }
    if (Array.isArray(plan.combosets)) return plan.combosets;
    if (Array.isArray(plan.comboSets)) return plan.comboSets;
    return [];
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 👑 Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-[#FFFBF0] border border-[#F2D6A7] text-[#E69A00] rounded-2xl shadow-2xs">
            <UserCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2D2118]">Subscription Plans</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage plans, seasonal harvests, month combo sets & pricing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPlans}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 shadow-2xs transition cursor-pointer shrink-0"
          >
            <RefreshCw
              size={14}
              className={loadingPlans ? "animate-spin text-[#E69A00]" : "text-gray-500"}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetPlanForm();
              setShowAddPlanModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E69A00] hover:bg-[#D48D00] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Add Subscription Plan</span>
          </button>
        </div>
      </div>

      {/* 📊 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#E69A00] flex items-center justify-center font-bold">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Total Plans
            </p>
            <p className="text-xl font-extrabold text-[#2D2118]">{plans.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Active Plans
            </p>
            <p className="text-xl font-extrabold text-emerald-600">
              {plans.filter((p) => p.isActive !== false).length} Active
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Star size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Featured Plans
            </p>
            <p className="text-xl font-extrabold text-[#2D2118]">
              {plans.filter((p) => p.isPopular).length} Popular
            </p>
          </div>
        </div>
      </div>

      {/* Notifications Banner */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={fetchPlans}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 🎁 SUBSCRIPTION PLAN CARDS DISPLAY */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-[#2D2118] uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={16} className="text-[#E69A00]" />
          Subscription Plans ({plans.length})
        </h2>

        {loadingPlans ? (
          <div className="bg-white rounded-3xl p-16 border border-gray-100 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#E69A00]" size={36} />
            <p className="text-xs font-semibold text-gray-600">
              Fetching subscription plans...
            </p>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-gray-100 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
            <UserCheck size={44} className="text-gray-300 stroke-1" />
            <p className="text-sm font-bold text-gray-700">No Subscription Plans Found</p>
            <p className="text-xs text-gray-400 max-w-sm">
              Click &quot;Add Subscription Plan&quot; to define your first subscription plan card.
            </p>
            <button
              onClick={() => {
                resetPlanForm();
                setShowAddPlanModal(true);
              }}
              className="mt-2 px-5 py-2.5 bg-[#E69A00] text-white text-xs font-bold rounded-xl hover:bg-[#D48D00] shadow-md transition cursor-pointer"
            >
              + Add Subscription Plan
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {plans.map((plan) => {
              const planId = plan._id || plan.id || "";
              const comboSets = getPlanComboSets(plan);

              const discount =
                plan.discountPercentage ||
                (plan.originalPrice && plan.price && plan.originalPrice > plan.price
                  ? Math.round(
                      ((plan.originalPrice - plan.price) / plan.originalPrice) * 100
                    )
                  : 0);

              return (
                <div
                  key={planId}
                  className="bg-white rounded-3xl border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Card Header & Main Specs */}
                  <div className="p-6 bg-gradient-to-r from-[#FFFBF5] via-white to-amber-50/20 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xl font-extrabold text-[#2D2118]">
                          {plan.name}
                        </h3>

                        {plan.badge && (
                          <span className="px-3 py-0.5 bg-[#E69A00] text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                            {plan.badge}
                          </span>
                        )}

                        {plan.isPopular && (
                          <span className="bg-[#2D3A1B] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            POPULAR
                          </span>
                        )}

                        {plan.isActive !== false ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-extrabold uppercase">
                            Inactive
                          </span>
                        )}
                      </div>

                      {plan.description && (
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                          {plan.description}
                        </p>
                      )}

                      {plan.idealFor && (
                        <p className="text-xs text-amber-900/90 font-semibold flex items-center gap-1">
                          <span>💡 Ideal For:</span> {plan.idealFor}
                        </p>
                      )}
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Subscription Price
                        </span>
                        <div className="flex items-baseline gap-2 justify-end">
                          <span className="text-2xl font-black text-[#2D2118]">
                            ₹{plan.price ? plan.price.toLocaleString("en-IN") : "0"}
                          </span>
                          {plan.originalPrice && plan.originalPrice > plan.price && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{plan.originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        {discount > 0 && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 inline-block mt-0.5">
                            {discount}% OFF ({plan.durationMonths || 12} Months)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openAddComboModal(plan)}
                          className="px-3.5 py-2 bg-[#E69A00] hover:bg-[#D48D00] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus size={15} /> Add Combo Set
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePlan(planId)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition cursor-pointer"
                          title="Delete Subscription Plan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 🗓️ MONTHLY COMBO SETS HARVEST SECTION */}
                  <div className="p-6 bg-gray-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar size={15} className="text-[#E69A00]" />
                        Monthly Harvest Combosets ({comboSets.length} Months Configured)
                      </h4>

                      <button
                        type="button"
                        onClick={() => openAddComboModal(plan)}
                        className="text-xs font-bold text-[#E69A00] hover:text-[#C98715] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} /> + Add Month Harvest Combo
                      </button>
                    </div>

                    {comboSets.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center space-y-2">
                        <Gift className="mx-auto text-gray-300" size={32} />
                        <p className="text-xs font-semibold text-gray-600">
                          No monthly combo sets configured for this subscription plan yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => openAddComboModal(plan)}
                          className="px-4 py-2 bg-amber-100 text-amber-900 font-bold text-xs rounded-xl hover:bg-amber-200 transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus size={14} /> Add First Month Combo Set
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {comboSets.map((combo) => {
                          const comboId = combo._id || "";
                          const prods = combo.products || [];

                          return (
                            <div
                              key={comboId}
                              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                            >
                              {/* Combo Image Banner */}
                              <div className="relative h-36 bg-amber-50 overflow-hidden border-b border-gray-100">
                                {combo.image ? (
                                  <img
                                    src={combo.image}
                                    alt={combo.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-amber-300 bg-amber-50">
                                    <ImageIcon size={32} />
                                  </div>
                                )}

                                {/* Floating Badges */}
                                <span className="absolute top-2.5 left-2.5 bg-[#2D2118] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase shadow-xs">
                                  {combo.monthName}
                                </span>

                                {combo.season && (
                                  <span className="absolute top-2.5 right-2.5 bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs">
                                    {combo.season}
                                  </span>
                                )}
                              </div>

                              {/* Combo Details */}
                              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                                <div className="space-y-1.5">
                                  <h5 className="text-sm font-bold text-[#2D2118] line-clamp-2 leading-snug">
                                    {combo.title}
                                  </h5>

                                  {combo.harvestTitle && (
                                    <p className="text-[11px] font-semibold text-[#E69A00] flex items-center gap-1">
                                      <Sun size={12} /> {combo.harvestTitle}
                                    </p>
                                  )}

                                  {combo.description && (
                                    <p className="text-xs text-gray-500 line-clamp-2 pt-0.5 leading-relaxed">
                                      {combo.description}
                                    </p>
                                  )}
                                </div>

                                {/* Included Products List */}
                                {prods.length > 0 && (
                                  <div className="space-y-1 pt-2 border-t border-gray-100">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                      Included Jars ({prods.length}):
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {prods.map((p, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-0.5 bg-amber-50 text-amber-950 border border-amber-200/60 rounded-md text-[10px] font-medium"
                                        >
                                          {p.name} ({p.weight}{p.unit || "g"})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Action Delete */}
                                <div className="pt-2 border-t border-gray-100 flex items-center justify-end text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComboSet(planId, comboId)}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition flex items-center gap-1 text-[11px] cursor-pointer"
                                  >
                                    <Trash2 size={12} /> Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ➕ MODAL 1: ADD SUBSCRIPTION PLAN */}
      {showAddPlanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-fadeIn">
          <div className="bg-white w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-[#FAF6F0] p-4 border-b border-[#F2E8D9] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-100 text-[#E69A00] rounded-2xl border border-amber-200">
                  <UserCheck size={20} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#2D2118]">
                    Add New Subscription Plan
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Configure new subscription details and pricing
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddPlanModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleAddPlanSubmit}
              className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs"
            >
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Plan Name */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Plan Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A Year Of Honey Delivered to Your Door"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-semibold"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Discover Six Distinctive Shuddaveda Honey Varieties Delivered throughout the Year"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white"
                  />
                </div>

                {/* Ideal For */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Ideal For Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Perfect for everyday family use"
                    value={idealFor}
                    onChange={(e) => setIdealFor(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-medium"
                  />
                </div>

                {/* Price & Original Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Selling Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="2099"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-black text-[#2D2118]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Original Price (₹)
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="2394"
                      value={originalPrice}
                      onChange={(e) =>
                        setOriginalPrice(e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Currency
                    </label>
                    <input
                      type="text"
                      placeholder="INR"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Badge Tag & Duration Months */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Badge Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MOST POPULAR"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-bold text-[#E69A00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Duration (Months)
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="12"
                      value={durationMonths}
                      onChange={(e) =>
                        setDurationMonths(e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Switches */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-800">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                      className="w-4 h-4 accent-[#E69A00] rounded"
                    />
                    Mark as Popular (isPopular)
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-800">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    Active Plan (isActive)
                  </label>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="shrink-0 bg-gray-50 border-t border-gray-200 px-5 py-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={submittingPlan}
                  onClick={() => setShowAddPlanModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingPlan}
                  className="px-5 py-2.5 bg-[#E69A00] hover:bg-[#D48D00] text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingPlan ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {submittingPlan ? "Creating Plan..." : "Create Subscription Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📦 MODAL 2: ADD MONTHLY COMBO SET TO PLAN */}
      {showAddComboModal && selectedPlanForCombo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-fadeIn">
          <div className="bg-white w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-[#FAF6F0] p-4 border-b border-[#F2E8D9] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-100 text-[#E69A00] rounded-2xl border border-amber-200">
                  <Gift size={20} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#2D2118]">
                    Add Month Harvest Combo to Plan
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Target Plan: <span className="font-bold text-amber-900">{selectedPlanForCombo.name}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddComboModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleAddComboSetSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Month Name & Season */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Month Name <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={comboMonthName}
                      onChange={(e) => setComboMonthName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-semibold cursor-pointer"
                    >
                      {MONTHS_LIST.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Season Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Summer Harvest"
                      value={comboSeason}
                      onChange={(e) => setComboSeason(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Combo Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Mustard Honey – January Harvest"
                    value={comboTitle}
                    onChange={(e) => setComboTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-bold text-[#2D2118]"
                  />
                </div>

                {/* Harvest Title */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Harvest Title Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. January Floral Harvest"
                    value={comboHarvestTitle}
                    onChange={(e) => setComboHarvestTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white font-medium text-[#E69A00]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Start your subscription with our premium January harvest honey..."
                    value={comboDescription}
                    onChange={(e) => setComboDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white"
                  />
                </div>

                {/* Read More Detailed Description */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Read More Info
                  </label>
                  <textarea
                    rows={2}
                    placeholder="This month's selection brings you naturally sourced honey..."
                    value={comboReadMore}
                    onChange={(e) => setComboReadMore(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00] focus:bg-white"
                  />
                </div>

                {/* Included Products List */}
                <div className="space-y-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-800 text-xs">
                      Included Honey Jars ({comboProducts.length})
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setComboProducts([
                          ...comboProducts,
                          { name: "", weight: 500, unit: "g" },
                        ])
                      }
                      className="px-2.5 py-1 bg-[#E69A00] text-white font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Jar Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {comboProducts.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
                        <p className="text-xs text-gray-500 font-semibold">
                          No honey jars added to this month harvest yet.
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setComboProducts([{ name: "", weight: 500, unit: "g" }])
                          }
                          className="px-3.5 py-1.5 bg-[#E69A00] text-white font-bold text-xs rounded-lg shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={13} /> Add First Jar Item
                        </button>
                      </div>
                    ) : (
                      comboProducts.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200 text-xs"
                        >
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-[#E69A00] font-bold flex items-center justify-center text-[10px] shrink-0">
                            {idx + 1}
                          </span>

                          <input
                            type="text"
                            required
                            placeholder="Honey Name (e.g. Premium Mustard Honey)"
                            value={p.name}
                            onChange={(e) => {
                              const updated = [...comboProducts];
                              updated[idx].name = e.target.value;
                              setComboProducts(updated);
                            }}
                            className="flex-1 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00]"
                          />

                          <input
                            type="number"
                            required
                            placeholder="500"
                            value={p.weight}
                            onChange={(e) => {
                              const updated = [...comboProducts];
                              updated[idx].weight = e.target.value ? Number(e.target.value) : "";
                              setComboProducts(updated);
                            }}
                            className="w-16 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs outline-none font-mono"
                          />

                          <select
                            value={p.unit}
                            onChange={(e) => {
                              const updated = [...comboProducts];
                              updated[idx].unit = e.target.value;
                              setComboProducts(updated);
                            }}
                            className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-lg text-xs outline-none font-mono cursor-pointer"
                          >
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => setComboProducts(comboProducts.filter((_, i) => i !== idx))}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded-lg"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Image Upload File */}
                <div>
                  <label className="block font-bold text-gray-700 text-xs mb-1">
                    Month Harvest Image (Optional)
                  </label>
                  <div
                    onClick={() => comboFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-[#E69A00] bg-gray-50 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5"
                  >
                    {comboImagePreview ? (
                      <div className="relative w-full max-w-xs h-28">
                        <img
                          src={comboImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl shadow-xs"
                        />
                      </div>
                    ) : (
                      <>
                        <Upload className="text-[#E69A00]" size={20} />
                        <p className="text-xs font-bold text-gray-700">
                          Click to select harvest photo
                        </p>
                      </>
                    )}
                    <input
                      ref={comboFileInputRef}
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
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="shrink-0 bg-gray-50 border-t border-gray-200 px-5 py-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={submittingCombo}
                  onClick={() => setShowAddComboModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingCombo}
                  className="px-5 py-2.5 bg-[#E69A00] hover:bg-[#D48D00] text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingCombo ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {submittingCombo ? "Saving Harvest..." : "Save Month Combo Set"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
