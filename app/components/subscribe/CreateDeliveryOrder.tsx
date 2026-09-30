"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Calendar,
  RefreshCw,
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Eye,
  X,
  Loader2,
  ShoppingBag,
  Filter,
  CreditCard,
  Truck,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Plus,
  Trash2,
  Send,
  Code2,
  Building2,
  Sparkles,
  Check,
  Pencil,
  ChevronDown,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface Customer {
  name: string;
  mobile: string;
  email: string;
}

export interface PlanComboSetProduct {
  _id?: string;
  name: string;
  weight: number;
  unit: string;
}

export interface PlanComboSetItem {
  _id?: string;
  monthName: string;
  title: string;
  image?: string;
  public_id?: string;
  season?: string;
  harvestTitle?: string;
  description?: string;
  readMore?: string;
  products?: PlanComboSetProduct[];
}

export interface Plan {
  name: string;
  plan_image?: string;
  packageLabel?: string;
  quantityPerJar?: number;
  quantityUnit?: string;
  numberOfJars?: number;
  totalQuantity?: number;
  totalQuantityUnit?: string;
  durationMonths?: number;
  jarsPerDelivery?: number;
  price?: number;
  originalPrice?: number;
  currency?: string;
}

export interface PaymentDetails {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  method?: string;
  amount?: number;
  currency?: string;
  status?: string;
  captured?: boolean;
  fee?: number;
  tax?: number;
  vpa?: string | null;
  bank?: string | null;
  wallet?: string | null;
  email?: string;
  contact?: string;
  acquirer_data?: {
    bank_transaction_id?: string;
  };
  raw?: any;
}

export interface DeliveryProduct {
  productId: string;
  variantId: string;
  productName: string;
  quantity: number;
  quantityPerJar: number;
  quantityUnit: string;
  _id: string;
}

export interface DeliveryTracking {
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface DeliveryBatch {
  _id: string;
  deliveryNumber: number;
  orderId?: string;
  products?: DeliveryProduct[];
  status: string;
  scheduledDate?: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  tracking?: DeliveryTracking;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchasePlanItem {
  _id: string;
  purchase_id: string;
  userId: string;
  planId: string;
  plan?: Plan;
  customer?: Customer;
  payment?: PaymentDetails;
  shipping_address?: ShippingAddress;
  billing_address?: ShippingAddress;
  finalAmount: number;
  currency: string;
  payment_status: string;
  status: string;
  totalDeliveries: number;
  completedDeliveries: number;
  currentDeliveryNumber: number;
  deliveries?: DeliveryBatch[];
  createdAt?: string;
  updatedAt?: string;
  payment_mode?: string;
  startDate?: string;
  endDate?: string;
}

// Interface for POST API Delivery Order Item
export interface DeliveryOrderItem {
  type: string;
  quantity: number;
  reserved_quantity: number;
  product_details: {
    product: {
      _id: string;
      product_name: string;
      brand: string;
      image: {
        image_url: string;
      };
      variant: {
        _id: string;
        weight: number;
        unit: string;
        price: number;
        mrp: number;
        save: number;
      };
    };
    totalAmount: number;
    totalWeight: number;
    totalsave: number;
  };
}

const defaultSampleItem: DeliveryOrderItem = {
  type: "PLAN",
  quantity: 1,
  reserved_quantity: 1,
  product_details: {
    product: {
      _id: "",
      product_name: "",
      brand: "ShuddhVeda Honey",
      image: {
        image_url: "",
      },
      variant: {
        _id: "",
        weight: 0,
        unit: "g",
        price: 0,
        mrp: 0,
        save: 0,
      },
    },
    totalAmount: 0,
    totalWeight: 0,
    totalsave: 0,
  },
};

export interface CatalogVariant {
  _id?: string;
  id?: string;
  weight?: number;
  unit?: string;
  price?: number;
  mrp?: number;
  save?: number;
}

export interface CatalogProduct {
  _id?: string;
  id?: string;
  product_name?: string;
  name?: string;
  brand?: string;
  image?: {
    image_url?: string;
  } | string;
  image_url?: string;
  variant?: CatalogVariant;
  variants?: CatalogVariant[];
  [key: string]: any;
}

export function extractVariantsFromProduct(prod: any): CatalogVariant[] {
  if (!prod) return [];

  let rawList: any[] = [];
  if (Array.isArray(prod.variantDocumentId) && prod.variantDocumentId.length > 0) {
    rawList = prod.variantDocumentId;
  } else if (Array.isArray(prod.variants) && prod.variants.length > 0) {
    rawList = prod.variants;
  } else if (Array.isArray(prod.variant_details) && prod.variant_details.length > 0) {
    rawList = prod.variant_details;
  } else if (Array.isArray(prod.productVariants) && prod.productVariants.length > 0) {
    rawList = prod.productVariants;
  } else if (Array.isArray(prod.product_variants) && prod.product_variants.length > 0) {
    rawList = prod.product_variants;
  } else if (Array.isArray(prod.variant) && prod.variant.length > 0) {
    rawList = prod.variant;
  } else if (prod.variant && typeof prod.variant === "object") {
    rawList = [prod.variant];
  } else if (Array.isArray(prod.weights) && prod.weights.length > 0) {
    rawList = prod.weights;
  } else if (Array.isArray(prod.pack_sizes) && prod.pack_sizes.length > 0) {
    rawList = prod.pack_sizes;
  } else {

  }

  return rawList.map((v: any, idx: number) => {
    const weight = Number(
      v?.weight ?? v?.size ?? v?.net_weight ?? v?.quantityPerJar ?? prod?.weight ?? 250
    );
    const unit = String(
      v?.unit ?? v?.quantityUnit ?? prod?.unit ?? "g"
    );
    const price = Number(
      v?.price ?? v?.sellingPrice ?? v?.selling_price ?? v?.variant_price ?? prod?.price ?? 0
    );
    const mrp = Number(
      v?.mrp ?? v?.originalPrice ?? v?.original_price ?? price ?? 0
    );
    const save = v?.save !== undefined ? Number(v.save) : Math.max(0, mrp - price);
    const id = String(v?._id || v?.id || v?.variant_id || `var-${idx}`);

    return {
      _id: id,
      id: id,
      weight,
      unit,
      price,
      mrp,
      save,
    };
  });
}

export function getProductImageByName(name?: string): string {
  const lower = (name || "").toLowerCase();
  if (lower.includes("jamun")) {
    return "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=80";
  }
  if (lower.includes("mustard") || lower.includes("sarson")) {
    return "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=400&auto=format&fit=crop&q=80";
  }
  if (lower.includes("wild") || lower.includes("forest") || lower.includes("flora")) {
    return "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=400&auto=format&fit=crop&q=80";
  }
  return "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=400&auto=format&fit=crop&q=80";
}

export function parseEtdToDateString(etdValue: any): string | null {
  if (!etdValue) return null;
  const str = String(etdValue).trim();

  // Match YYYY-MM-DD
  const ymdMatch = str.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (ymdMatch) return ymdMatch[1];

  // Match DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Match relative days
  const daysNum = parseInt(str, 10);
  if (!isNaN(daysNum) && daysNum > 0 && daysNum < 60) {
    const d = new Date();
    d.setDate(d.getDate() + daysNum);
    return d.toISOString().split("T")[0];
  }

  const parsedDate = new Date(str);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split("T")[0];
  }

  return null;
}

export const DEFAULT_HONEY_IMAGE =
  "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=400&auto=format&fit=crop&q=80";

export const FALLBACK_HONEY_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%23FFFBF0" stroke="%23E69A00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M5 8h14"/><path d="M6 8v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/><path d="M9 12h6"/></svg>`;

export function getPlanIdFromPurchaseItem(item: any): string {
  if (!item) return "";
  if (typeof item.plan === "string" && item.plan.trim()) {
    return item.plan.trim();
  }
  if (typeof item.plan === "object" && item.plan !== null) {
    const objId = (item.plan as any)._id || (item.plan as any).id || (item.plan as any).planId;
    if (typeof objId === "string" && objId.trim()) return objId.trim();
  }
  if (item.planId && typeof item.planId === "string" && item.planId.trim()) return item.planId.trim();
  if (item.plan_id && typeof item.plan_id === "string" && item.plan_id.trim()) return item.plan_id.trim();
  return "";
}

export function extractComboImageUrl(combo: any): string {
  if (!combo) return DEFAULT_HONEY_IMAGE;
  let rawUrl = "";
  if (typeof combo === "string") {
    rawUrl = combo;
  } else if (typeof combo === "object" && combo !== null) {
    const candidates = [
      combo.image,
      combo.image_url,
      combo.imageUrl,
      combo.plan_image,
      combo.planImage,
      combo.cover_image,
      combo.coverImage,
      combo.thumbnail,
      combo.thumbnail_url,
      combo.public_id,
      combo.path,
      combo.url,
      combo.plan?.plan_image,
      combo.plan?.image_url,
      combo.plan?.image,
      combo.combosets?.[0]?.image,
    ];

    for (const c of candidates) {
      if (!c) continue;
      if (typeof c === "string" && c.trim()) {
        rawUrl = c;
        break;
      }
      if (typeof c === "object" && c !== null) {
        const nestedUrl =
          c.url || c.image_url || c.imageUrl || c.secure_url || c.path || c.public_id || "";
        if (typeof nestedUrl === "string" && nestedUrl.trim()) {
          rawUrl = nestedUrl;
          break;
        }
      }
    }
  }

  if (!rawUrl || !rawUrl.trim()) return DEFAULT_HONEY_IMAGE;

  rawUrl = rawUrl.trim();

  if (
    rawUrl.startsWith("http://") ||
    rawUrl.startsWith("https://") ||
    rawUrl.startsWith("blob:") ||
    rawUrl.startsWith("data:")
  ) {
    return rawUrl;
  }

  if (rawUrl.includes("cloudinary.com")) {
    return rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
  }

  if (rawUrl.startsWith("sudhvedahoney/") || rawUrl.startsWith("plans/") || rawUrl.includes("sudhvedahoney")) {
    const cleanPublicId = rawUrl.startsWith("sudhvedahoney/")
      ? rawUrl
      : `sudhvedahoney/${rawUrl.replace(/^\//, "")}`;
    return `https://res.cloudinary.com/anjp8e9i/image/upload/${cleanPublicId}`;
  }

  const cleanPath = rawUrl.replace(/^\//, "");
  return `${API_BASE_URL}/${cleanPath}`;
}

export function extractProductImageUrl(prod: any, variant?: any): string {
  let rawUrl = "";

  if (variant) {
    if (typeof variant.image === "string" && variant.image.trim()) rawUrl = variant.image;
    else if (variant.image?.image_url) rawUrl = variant.image.image_url;
    else if (variant.image?.url) rawUrl = variant.image.url;
    else if (variant.image_url) rawUrl = variant.image_url;
  }

  if (!rawUrl && prod) {
    if (typeof prod === "string" && prod.trim()) {
      rawUrl = prod;
    } else if (typeof prod === "object") {
      const candidates = [
        prod.imageDocumentId,
        prod.image_document_id,
        prod.image,
        prod.product_image,
        prod.productImage,
        prod.image_url,
        prod.imageUrl,
        prod.thumbnail,
        prod.thumbnail_url,
        prod.main_image,
        prod.mainImage,
        prod.cover_image,
        prod.banner_image,
      ];

      for (const c of candidates) {
        if (!c) continue;
        if (typeof c === "string" && c.trim()) {
          rawUrl = c;
          break;
        }
        if (Array.isArray(c) && c.length > 0) {
          const first = c[0];
          if (typeof first === "string" && first.trim()) { rawUrl = first; break; }
          if (typeof first === "object" && first) {
            if (first.image_url) { rawUrl = first.image_url; break; }
            if (first.url) { rawUrl = first.url; break; }
            if (first.secure_url) { rawUrl = first.secure_url; break; }
            if (first.path) { rawUrl = first.path; break; }
          }
        }
        if (typeof c === "object" && !Array.isArray(c)) {
          if (c.image_url) { rawUrl = c.image_url; break; }
          if (c.url) { rawUrl = c.url; break; }
          if (c.secure_url) { rawUrl = c.secure_url; break; }
          if (c.path) { rawUrl = c.path; break; }
          if (c.location) { rawUrl = c.location; break; }
        }
      }

      if (!rawUrl) {
        const arrayCandidates = [prod.images, prod.medias, prod.media, prod.imageGallery, prod.gallery];
        for (const arr of arrayCandidates) {
          if (Array.isArray(arr) && arr.length > 0) {
            const first = arr[0];
            if (typeof first === "string" && first.trim()) { rawUrl = first; break; }
            if (typeof first === "object" && first) {
              if (first.image_url) { rawUrl = first.image_url; break; }
              if (first.url) { rawUrl = first.url; break; }
              if (first.secure_url) { rawUrl = first.secure_url; break; }
              if (first.path) { rawUrl = first.path; break; }
            }
          }
        }
      }
    }
  }

  if (!rawUrl) {
    return getProductImageByName(prod?.product_name || prod?.name);
  }

  if (
    rawUrl.startsWith("http://") ||
    rawUrl.startsWith("https://") ||
    rawUrl.startsWith("blob:") ||
    rawUrl.startsWith("data:")
  ) {
    return rawUrl;
  }
  const cleanPath = rawUrl.replace(/^\//, "");
  return `${API_BASE_URL}/${cleanPath}`;
}

export default function SubscribePlanOrders() {
  const router = useRouter();
  const [purchasePlans, setPurchasePlans] = useState<PurchasePlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");

  // Modal view detail state
  const [selectedItem, setSelectedItem] = useState<PurchasePlanItem | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "create_delivery" | "deliveries" | "payment" | "addresses"
  >("overview");

  // POST API State (Create Plan Delivery Order) inside Modal
  const [planPurchaseId, setPlanPurchaseId] = useState("");
  const [comboSetId, setComboSetId] = useState("");
  const [planDeliveryDate, setPlanDeliveryDate] = useState("");
  const [orderItems, setOrderItems] = useState<DeliveryOrderItem[]>([
    defaultSampleItem,
  ]);
  const [collapsedItems, setCollapsedItems] = useState<{ [key: number]: boolean }>({});
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [postSuccessResponse, setPostSuccessResponse] = useState<any>(null);
  const [postErrorMsg, setPostErrorMsg] = useState<string | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  // Delivery check & package dimension states
  const [length, setLength] = useState<number | string>("");
  const [breadth, setBreadth] = useState<number | string>("");
  const [height, setHeight] = useState<number | string>("");
  const [weight, setWeight] = useState<number | string>("");
  const [pincode, setPincode] = useState<string>("");
  const [checkingDelivery, setCheckingDelivery] = useState<boolean>(false);
  const [availableCarriers, setAvailableCarriers] = useState<any[]>([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>("");
  const [deliveryCheckMsg, setDeliveryCheckMsg] = useState<string | null>(null);
  const [deliveryCheckError, setDeliveryCheckError] = useState<string | null>(null);
  const [isCarrierDropdownOpen, setIsCarrierDropdownOpen] = useState(false);
  const carrierDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        carrierDropdownRef.current &&
        !carrierDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCarrierDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCheckDeliveryAvailability = async (targetPincode?: string) => {
    const pinToUse = (targetPincode !== undefined ? targetPincode : pincode).trim();
    if (!pinToUse) {
      alert("Please enter a valid pincode first.");
      return;
    }
    setCheckingDelivery(true);
    setDeliveryCheckMsg(null);
    setDeliveryCheckError(null);
    setAvailableCarriers([]);
    setSelectedCarrierId("");

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("sudhveda_token") || localStorage.getItem("admin_token")
          : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/order-service/checkdeliveryavailabilitybyadmin`,
        {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify({ pincode: pinToUse }),
        }
      );

      const resJson = await res.json().catch(() => ({}));

      if (
        res &&
        res.ok &&
        resJson &&
        (Array.isArray(resJson.serviceability_results) ||
          Array.isArray(resJson.data?.serviceability_results) ||
          resJson.success !== false)
      ) {
        let list: any[] = [];
        if (Array.isArray(resJson.serviceability_results)) {
          list = resJson.serviceability_results;
        } else if (resJson.data && Array.isArray(resJson.data.serviceability_results)) {
          list = resJson.data.serviceability_results;
        } else if (Array.isArray(resJson.data)) {
          list = resJson.data;
        } else if (Array.isArray(resJson.carriers)) {
          list = resJson.carriers;
        } else if (resJson.data && Array.isArray(resJson.data.available_courier_companies)) {
          list = resJson.data.available_courier_companies;
        } else if (resJson.data && Array.isArray(resJson.data.carriers)) {
          list = resJson.data.carriers;
        } else if (resJson.data && typeof resJson.data === "object") {
          const firstArray = Object.values(resJson.data).find((val) =>
            Array.isArray(val)
          );
          if (firstArray) list = firstArray as any[];
        }

        const formatted = list.map((item: any, i: number) => {
          const cId = String(
            item.carrier_id ??
            item.courier_company_id ??
            item.id ??
            item.carrierId ??
            item.code ??
            item.courier_name ??
            `carrier_${i + 1}`
          );
          const cName = String(
            item.carrier_name ??
            item.courier_name ??
            item.name ??
            item.title ??
            item.courier_company_name ??
            `Carrier ${cId}`
          );
          const etd =
            item.expected_delivery_date ??
            item.etd ??
            item.estimated_delivery_days ??
            item.delivery_performance;
          const rate =
            item.rate ?? item.freight_charge ?? item.cost ?? item.rate_total ?? item.charge;
          const mode = item.mode ?? item.transport_mode;

          let displayTitle = cName;
          if (etd) displayTitle += ` (EST: ${etd})`;
          if (mode) displayTitle += ` [${mode}]`;
          if (rate !== undefined && rate !== null) displayTitle += ` - ₹${rate}`;

          return {
            carrier_id: cId,
            courier_name: cName,
            display_title: displayTitle,
            rate,
            etd: etd ? String(etd) : undefined,
            mode: mode ? String(mode) : undefined,
            raw: item,
          };
        });

        setAvailableCarriers(formatted);
        if (formatted.length > 0) {
          const firstCarrier = formatted[0];
          setSelectedCarrierId(firstCarrier.carrier_id);
          setDeliveryCheckMsg(
            `Found ${formatted.length} available courier options for pincode ${pinToUse}`
          );

          // Auto set delivery date from first carrier's ETD if available
          const autoDate = parseEtdToDateString(
            firstCarrier.etd ||
            firstCarrier.raw?.expected_delivery_date ||
            firstCarrier.raw?.etd
          );
          if (autoDate) {
            setPlanDeliveryDate(autoDate);
          }
        } else {
          setDeliveryCheckError(`No delivery carriers available for pincode ${pinToUse}`);
        }
      } else {
        setDeliveryCheckError(
          resJson.message || resJson.error || "Pincode is not serviceable or invalid."
        );
      }
    } catch (err: any) {
      console.error("Error checking delivery availability:", err);
      setDeliveryCheckError(err.message || "Failed to check delivery availability.");
    } finally {
      setCheckingDelivery(false);
    }
  };

  const toggleItemDone = (index: number) => {
    setCollapsedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // 🌐 GET API Call: Fetch All Purchase Plan Orders
  const fetchPurchasePlans = async (targetPlanId?: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/plan-orders/purchase-plans`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json.data || Array.isArray(json))) {
        const list: PurchasePlanItem[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];
        setPurchasePlans(list);

        if (targetPlanId) {
          const freshItem = list.find(
            (p) => p._id === targetPlanId || p.purchase_id === targetPlanId
          );
          if (freshItem) {
            setSelectedItem(freshItem);
          }
        }
      } else {
        setErrorMsg(
          json.message || `Failed to fetch purchase plans (${res.status})`
        );
      }
    } catch (err: any) {
      console.error("Error fetching purchase plans GET API:", err);
      setErrorMsg(err.message || "Failed to communicate with API server");
    } finally {
      setLoading(false);
    }
  };

  // 🛒 GET API State (Plan Combosets API: /api/admin/plan-orders/combosets/${planId})
  const [planComboSets, setPlanComboSets] = useState<PlanComboSetItem[]>([]);
  const [loadingComboSets, setLoadingComboSets] = useState(false);
  const [comboSetsErrorMsg, setComboSetsErrorMsg] = useState<string | null>(null);

  // 🌐 GET API Call: Fetch Plan Combo Sets from /api/admin/plan-orders/combosets/${planId}
  const fetchPlanComboSets = async (targetPlanId: string) => {
    if (!targetPlanId) return;
    setLoadingComboSets(true);
    setComboSetsErrorMsg(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/plan-orders/combosets/${targetPlanId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success !== false) {
        let sets: PlanComboSetItem[] = [];
        if (json.data && Array.isArray(json.data.combosets)) {
          sets = json.data.combosets;
        } else if (Array.isArray(json.data)) {
          sets = json.data;
        } else if (Array.isArray(json.combosets)) {
          sets = json.combosets;
        }
        setPlanComboSets(sets);
        if (sets.length > 0) {
          const firstCombo = sets[0];
          if (firstCombo._id) {
            setComboSetId((prev) => prev || firstCombo._id || "");
          }
        }
      } else {
        setComboSetsErrorMsg(
          json.message || `Failed to fetch plan combo sets (${res.status})`
        );
      }
    } catch (err: any) {
      console.error("Error fetching plan combo sets GET API:", err);
      setComboSetsErrorMsg(
        err.message || "Failed to fetch plan combo sets from server"
      );
    } finally {
      setLoadingComboSets(false);
    }
  };

  useEffect(() => {
    void fetchPurchasePlans();
  }, []);

  // Helper to select a product jar from plan combo sets and populate item details
  const handleSelectComboSetItem = (
    itemIndex: number,
    combo: PlanComboSetItem,
    selectedProduct?: PlanComboSetProduct
  ) => {
    if (combo._id) {
      setComboSetId(combo._id);
    }
    setOrderItems((prevItems) => {
      const newItems = JSON.parse(JSON.stringify(prevItems));
      const target = newItems[itemIndex];
      if (!target) return prevItems;

      const prodName = selectedProduct?.name || combo.title || "Subscription Honey Jar";
      const imageUrl = extractComboImageUrl(combo);

      const weight = selectedProduct?.weight !== undefined ? Number(selectedProduct.weight) : 500;
      const unit = selectedProduct?.unit || "g";
      const prodId = selectedProduct?._id || combo._id || `combo-prod-${itemIndex}`;
      const variantId = `var-${prodId}`;

      const price = Number((selectedProduct as any)?.price || (combo as any)?.price || 0);
      const mrp = Number((selectedProduct as any)?.mrp || (selectedProduct as any)?.originalPrice || (combo as any)?.mrp || price);
      const save = Math.max(0, mrp - price);
      const qty = target.quantity || 1;

      target.product_details = {
        product: {
          _id: prodId,
          product_name: prodName,
          brand: combo.harvestTitle || combo.season || "ShuddhVeda Honey",
          comboTitle: combo.title || "",
          monthName: combo.monthName || "",
          season: combo.season || "",
          harvestTitle: combo.harvestTitle || "",
          description: combo.description || "",
          image: {
            image_url: imageUrl,
          },
          variant: {
            _id: variantId,
            weight: weight,
            unit: unit,
            price: price,
            mrp: mrp,
            save: save,
          },
        },
        totalAmount: price * qty,
        totalWeight: weight * qty,
        totalsave: save * qty,
      };

      return newItems;
    });
  };

  // When a modal opens or selected item changes, setup POST API form values
  const handleOpenDetailModal = (
    item: PurchasePlanItem,
    initialTab: "overview" | "create_delivery" | "deliveries" | "payment" | "addresses" = "overview"
  ) => {
    setSelectedItem(item);
    setActiveTab(initialTab);
    setPlanPurchaseId(item._id);
    setComboSetId((item as any)?.comboSetId || (item as any)?.combo_set_id || "");
    setPostSuccessResponse(null);
    setPostErrorMsg(null);

    const targetPlanId = getPlanIdFromPurchaseItem(item);
    if (targetPlanId) {
      void fetchPlanComboSets(targetPlanId);
    }

    // Auto calculate delivery date
    let dateStr = new Date().toISOString().split("T")[0];
    if (item.deliveries && item.deliveries.length > 0) {
      const currentDel =
        item.deliveries.find(
          (d) => d.deliveryNumber === item.currentDeliveryNumber
        ) || item.deliveries[0];
      if (currentDel?.scheduledDate) {
        const d = new Date(currentDel.scheduledDate);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split("T")[0];
        }
      }
    }
    setPlanDeliveryDate(dateStr);

    // Always start Create Plan Delivery Order with a clean empty form for adding new products
    setOrderItems([JSON.parse(JSON.stringify(defaultSampleItem))]);
    setCollapsedItems({});

    setPincode("");
    setLength("");
    setBreadth("");
    setHeight("");
    setWeight("");
    setAvailableCarriers([]);
    setSelectedCarrierId("");
    setDeliveryCheckMsg(null);
    setDeliveryCheckError(null);
  };

  // Helper to calculate totals automatically for an item in the form
  const updateOrderItem = (index: number, fieldPath: string, value: any) => {
    setOrderItems((prevItems) => {
      const newItems = JSON.parse(JSON.stringify(prevItems));
      const target = newItems[index];

      if (fieldPath === "type") target.type = value;
      else if (fieldPath === "quantity") {
        const qty = Number(value) || 1;
        target.quantity = qty;
        target.reserved_quantity = qty;
        const unitPrice = target.product_details.product.variant.price || 0;
        const unitWeight = target.product_details.product.variant.weight || 0;
        const unitSave = target.product_details.product.variant.save || 0;

        target.product_details.totalAmount = unitPrice * qty;
        target.product_details.totalWeight = unitWeight * qty;
        target.product_details.totalsave = unitSave * qty;
      } else if (fieldPath === "reserved_quantity") {
        target.reserved_quantity = Number(value) || 0;
      } else if (fieldPath === "product._id") {
        target.product_details.product._id = value;
      } else if (fieldPath === "product.product_name") {
        target.product_details.product.product_name = value;
      } else if (fieldPath === "product.brand") {
        target.product_details.product.brand = value;
      } else if (fieldPath === "product.image_url") {
        target.product_details.product.image.image_url = value;
      } else if (fieldPath === "variant._id") {
        target.product_details.product.variant._id = value;
      } else if (fieldPath === "variant.weight") {
        const w = Number(value) || 0;
        target.product_details.product.variant.weight = w;
        target.product_details.totalWeight = w * target.quantity;
      } else if (fieldPath === "variant.unit") {
        target.product_details.product.variant.unit = value;
      } else if (fieldPath === "variant.price") {
        const p = Number(value) || 0;
        target.product_details.product.variant.price = p;
        target.product_details.totalAmount = p * target.quantity;
        const mrp = target.product_details.product.variant.mrp || p;
        const save = Math.max(0, mrp - p);
        target.product_details.product.variant.save = save;
        target.product_details.totalsave = save * target.quantity;
      } else if (fieldPath === "variant.mrp") {
        const mrp = Number(value) || 0;
        target.product_details.product.variant.mrp = mrp;
        const price = target.product_details.product.variant.price || 0;
        const save = Math.max(0, mrp - price);
        target.product_details.product.variant.save = save;
        target.product_details.totalsave = save * target.quantity;
      }

      return newItems;
    });
  };

  const handleAddOrderItem = () => {
    setOrderItems((prev) => [
      ...prev,
      JSON.parse(JSON.stringify(defaultSampleItem)),
    ]);
  };

  const handleRemoveOrderItem = (index: number) => {
    if (orderItems.length <= 1) {
      alert("At least one item is required in the delivery order!");
      return;
    }
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
    setCollapsedItems((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  // Get live POST API payload matching {{baseUrl}}/api/admin/plan-orders/create-plan-delivery-order
  const getPostPayload = () => {
    const fallbackComboId =
      orderItems[0]?.product_details?.product?._id ||
      (planComboSets.length > 0 ? planComboSets[0]._id || planComboSets[0].monthName : "");

    return {
      planPurchaseId: planPurchaseId.trim(),
      comboSetId: comboSetId.trim() || fallbackComboId || "",
      plan_delivery_date: planDeliveryDate.trim(),
      carrier_id: selectedCarrierId || "",
      length: Number(length) || 3,
      breadth: Number(breadth) || 1,
      height: Number(height) || 1,
      weight: Number(weight) || 1,
      items: orderItems,
    };
  };

  // 🚀 POST API Submit Function
  const handleCreateDeliveryOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planPurchaseId.trim()) {
      alert("Please enter a Plan Purchase ID");
      return;
    }
    if (!planDeliveryDate.trim()) {
      alert("Please select a delivery date");
      return;
    }

    setSubmittingOrder(true);
    setPostSuccessResponse(null);
    setPostErrorMsg(null);

    const payload = getPostPayload();

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/plan-orders/create-plan-delivery-order`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json().catch(() => ({}));

      if (res.ok && (json.success || json.data || json.message)) {
        setPostSuccessResponse(json);
        await fetchPurchasePlans(planPurchaseId);
        // Reset order item inputs so old data is completely removed and ready for new entries
        setOrderItems([JSON.parse(JSON.stringify(defaultSampleItem))]);
        setCollapsedItems({});
        setPincode("");
        setAvailableCarriers([]);
        setSelectedCarrierId("");
        setDeliveryCheckMsg(null);
        setDeliveryCheckError(null);
        setTimeout(() => {
          setActiveTab("deliveries");
          router.push("/subscribe/delivery-order");
        }, 600);
      } else {
        setPostErrorMsg(
          json.message ||
          json.error ||
          `API error (${res.status}): ${res.statusText}`
        );
      }
    } catch (err: any) {
      console.error("Error creating plan delivery order POST API:", err);
      setPostErrorMsg(err.message || "Failed to communicate with API server");
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Filter Purchase Plans
  const filteredPlans = purchasePlans.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (p.purchase_id && p.purchase_id.toLowerCase().includes(term)) ||
      (p._id && p._id.toLowerCase().includes(term)) ||
      (p.customer?.name && p.customer.name.toLowerCase().includes(term)) ||
      (p.customer?.mobile && p.customer.mobile.includes(term)) ||
      (p.customer?.email && p.customer.email.toLowerCase().includes(term)) ||
      (p.plan?.name && p.plan.name.toLowerCase().includes(term)) ||
      (p.payment?.razorpay_payment_id &&
        p.payment.razorpay_payment_id.toLowerCase().includes(term)) ||
      (p.shipping_address?.city &&
        p.shipping_address.city.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === "all" ||
      (p.status && p.status.toLowerCase() === statusFilter.toLowerCase());

    const matchesPaymentStatus =
      paymentStatusFilter === "all" ||
      (p.payment_status &&
        p.payment_status.toLowerCase() === paymentStatusFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  // Calculate Metrics
  const totalOrdersCount = purchasePlans.length;
  const activeOrdersCount = purchasePlans.filter(
    (p) => p.status?.toLowerCase() === "active"
  ).length;
  const totalRevenue = purchasePlans.reduce(
    (acc, curr) => acc + (curr.finalAmount || 0),
    0
  );
  const totalDeliveriesCompleted = purchasePlans.reduce(
    (acc, curr) => acc + (curr.completedDeliveries || 0),
    0
  );

  // Helper date formatters
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-[#FFFBF0] border border-[#F2D6A7] text-[#E69A00] rounded-lg">
            <ShoppingBag size={20} />
          </span>
          <h1 className="text-xl font-bold text-[#2D2118]">
            Subscribe Plan Order
          </h1>
        </div>

        <button
          type="button"
          onClick={() => void fetchPurchasePlans()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg border border-gray-200 shadow-2xs transition cursor-pointer shrink-0"
        >
          <RefreshCw
            size={13}
            className={loading ? "animate-spin text-[#E69A00]" : "text-gray-500"}
          />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#E69A00] flex items-center justify-center font-bold shrink-0">
            <Package size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider truncate">
              Total Plan Orders
            </p>
            <p className="text-lg font-bold text-[#2D2118]">
              {totalOrdersCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider truncate">
              Active Subscriptions
            </p>
            <p className="text-lg font-bold text-[#2D2118]">
              {activeOrdersCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <CreditCard size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider truncate">
              Total Revenue
            </p>
            <p className="text-lg font-bold text-[#2D2118]">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <Truck size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider truncate">
              Deliveries Completed
            </p>
            <p className="text-lg font-bold text-[#2D2118]">
              {totalDeliveriesCompleted}
            </p>
          </div>
        </div>
      </div>

      {/* Error Banner if GET API fails */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs font-semibold">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
          <button
            onClick={() => void fetchPurchasePlans()}
            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-md transition text-xs"
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
            placeholder="Search Purchase ID, Customer Name, Phone, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00] focus:bg-white transition"
          />
        </div>
      </div>

      {/* 📊 Main Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2.5">
            <Loader2 className="animate-spin text-[#E69A00]" size={28} />
            <p className="text-xs font-semibold text-gray-600">
              Loading Subscribe Plan Orders...
            </p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No purchase plan orders match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6F0] text-[#2D2118] border-b border-[#F2E8D9] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 min-w-[140px]">
                    Purchase ID & Dates
                  </th>
                  <th className="py-2.5 px-3 min-w-[140px]">Customer Info</th>
                  <th className="py-2.5 px-3 min-w-[140px]">Subscription Plan</th>
                  <th className="py-2.5 px-3 min-w-[120px]">
                    Amount & Payment
                  </th>
                  <th className="py-2.5 px-3 min-w-[130px]">Deliveries</th>
                  <th className="py-2.5 px-3 min-w-[90px]">Status</th>
                  <th className="py-2.5 px-3 text-center min-w-[130px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {filteredPlans.map((item) => {
                  const progressPct =
                    item.totalDeliveries > 0
                      ? Math.min(
                        100,
                        Math.round(
                          (item.completedDeliveries / item.totalDeliveries) *
                          100
                        )
                      )
                      : 0;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-[#FFFBF5]/70 transition-colors"
                    >
                      {/* Purchase ID & Dates */}
                      <td className="py-2.5 px-3 space-y-1">
                        <div>
                          <span className="font-mono font-bold text-[#2D2118] bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[11px] inline-block">
                            {item.purchase_id || item._id}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-600 font-medium flex items-center gap-1">
                          <Calendar size={11} className="text-gray-400 shrink-0" />
                          <span>Purchased: {formatDate(item.createdAt)}</span>
                        </p>
                        <p className="text-[9px] text-gray-400 font-mono">
                          {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        </p>
                      </td>

                      {/* Customer Details */}
                      <td className="py-2.5 px-3 space-y-0.5">
                        <p className="font-bold text-gray-900 text-xs">
                          {item.customer?.name || "Customer Name"}
                        </p>
                        <p className="text-gray-600 flex items-center gap-1 text-[10px]">
                          <Phone size={10} className="text-gray-400 shrink-0" />
                          {item.customer?.mobile || "-"}
                        </p>
                        <p className="text-gray-500 flex items-center gap-1 text-[10px] truncate max-w-[140px]">
                          <Mail size={10} className="text-gray-400 shrink-0" />
                          {item.customer?.email || "-"}
                        </p>
                      </td>

                      {/* Subscription Plan */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const rawImg = item.plan?.plan_image || (item.plan as any)?.image || (item.plan as any)?.image_url;
                            if (typeof rawImg === "string" && rawImg.trim() && !rawImg.startsWith("data:image/svg+xml") && rawImg !== DEFAULT_HONEY_IMAGE) {
                              return (
                                <img
                                  src={rawImg}
                                  alt={item.plan?.name || "Subscription Plan"}
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                  }}
                                  className="w-10 h-10 rounded-xl object-cover border-2 border-amber-300 shrink-0 shadow-2xs bg-amber-50"
                                />
                              );
                            }
                            return null;
                          })()}
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-xs truncate">
                              {item.plan?.name || "Subscription Plan"}
                            </p>
                            <p className="text-[10px] text-amber-700 font-semibold truncate">
                              {item.plan?.packageLabel ||
                                `${item.plan?.numberOfJars || 6} Jars`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Amount & Payment */}
                      <td className="py-2.5 px-3 space-y-0.5">
                        <p className="font-bold text-emerald-700 text-xs">
                          ₹
                          {item.finalAmount
                            ? item.finalAmount.toLocaleString("en-IN")
                            : "0"}{" "}
                          <span className="text-[9px] text-gray-400 font-normal">
                            {item.currency || "INR"}
                          </span>
                        </p>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${item.payment_status === "captured"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                              }`}
                          >
                            {item.payment_status || "captured"}
                          </span>
                          {item.payment_mode && (
                            <span className="text-[9px] text-gray-600 font-mono bg-gray-100 px-1 py-0.2 rounded border border-gray-200 uppercase font-semibold">
                              {item.payment_mode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Deliveries Progress */}
                      <td className="py-2.5 px-3 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-gray-700">
                            {item.completedDeliveries} / {item.totalDeliveries}
                          </span>
                          <span className="text-[#E69A00] font-mono text-[10px]">
                            {progressPct}%
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#E69A00] h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${item.status?.toLowerCase() === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status?.toLowerCase() === "completed"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : item.status?.toLowerCase() === "processing"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${item.status?.toLowerCase() === "active"
                              ? "bg-emerald-500"
                              : item.status?.toLowerCase() === "completed"
                                ? "bg-blue-500"
                                : item.status?.toLowerCase() === "processing"
                                  ? "bg-amber-500"
                                  : "bg-gray-400"
                              }`}
                          />
                          {item.status || "Active"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex flex-col items-center justify-center gap-1 font-sans mx-auto">
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(item, "overview")}
                            className="w-[115px] h-7 inline-flex items-center justify-center gap-1 bg-[#2D3A1B] hover:bg-[#1E2712] text-white text-[10px] font-bold rounded-lg transition cursor-pointer shadow-2xs whitespace-nowrap"
                          >
                            <Eye size={11} className="shrink-0" />
                            <span>View Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenDetailModal(item, "create_delivery")
                            }
                            className="w-[115px] h-7 inline-flex items-center justify-center gap-1 bg-[#E69A00] hover:bg-[#D48D00] text-white text-[10px] font-bold rounded-lg transition cursor-pointer shadow-2xs whitespace-nowrap"
                          >
                            <Send size={11} className="shrink-0" />
                            <span>Create Delivery</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🔍 DETAILED VIEW MODAL WITH POST API CREATION FORM */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#FAF6F0] p-5 border-b border-[#F2E8D9] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-100 text-[#E69A00] rounded-xl border border-amber-200">
                  <Receipt size={20} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#2D2118]">
                      Purchase Order: {selectedItem.purchase_id}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${selectedItem.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {selectedItem.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-5 shrink-0 text-xs font-bold text-gray-600 gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${activeTab === "overview"
                  ? "border-[#E69A00] text-[#E69A00] bg-white font-bold"
                  : "border-transparent hover:text-gray-900"
                  }`}
              >
                <Package size={15} /> Overview & Plan
              </button>

              {/* Create Plan Delivery Order Tab */}
              <button
                onClick={() => setActiveTab("create_delivery")}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${activeTab === "create_delivery"
                  ? "border-[#E69A00] text-white bg-[#E69A00] rounded-t-lg font-bold"
                  : "border-transparent text-amber-700 bg-amber-50 hover:bg-amber-100"
                  }`}
              >
                <Send size={15} /> Create Plan Delivery Order
              </button>

              <button
                onClick={() => setActiveTab("deliveries")}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${activeTab === "deliveries"
                  ? "border-[#E69A00] text-[#E69A00] bg-white font-bold"
                  : "border-transparent hover:text-gray-900"
                  }`}
              >
                <Truck size={15} /> Deliveries ({selectedItem.deliveries?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab("payment")}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${activeTab === "payment"
                  ? "border-[#E69A00] text-[#E69A00] bg-white font-bold"
                  : "border-transparent hover:text-gray-900"
                  }`}
              >
                <CreditCard size={15} /> Razorpay & Payment
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${activeTab === "addresses"
                  ? "border-[#E69A00] text-[#E69A00] bg-white font-bold"
                  : "border-transparent hover:text-gray-900"
                  }`}
              >
                <MapPin size={15} /> Shipping & Billing
              </button>
            </div>

            {/* Modal Content Scroll Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* 🟢 TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Plan Banner Card */}
                  <div className="bg-[#FFFDF9] border border-[#F2E8D9] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {(() => {
                        const rawImg = selectedItem.plan?.plan_image || (selectedItem.plan as any)?.image || (selectedItem.plan as any)?.image_url;
                        if (typeof rawImg === "string" && rawImg.trim() && !rawImg.startsWith("data:image/svg+xml") && rawImg !== DEFAULT_HONEY_IMAGE) {
                          return (
                            <img
                              src={rawImg}
                              alt={selectedItem.plan?.name || "Subscription Plan"}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-2xs shrink-0 bg-amber-50"
                            />
                          );
                        }
                        return null;
                      })()}
                      <div>
                        <h3 className="text-lg font-bold text-[#2D2118]">
                          {selectedItem.plan?.name || "Subscription Plan"}
                        </h3>
                        <p className="text-amber-800 font-semibold text-xs">
                          {selectedItem.plan?.packageLabel || "6 Jars Pack"}
                        </p>
                        <p className="text-gray-500 text-[11px] mt-0.5">
                          Total Quantity: {selectedItem.plan?.totalQuantity}{" "}
                          {selectedItem.plan?.totalQuantityUnit} (
                          {selectedItem.plan?.numberOfJars} Jars total)
                        </p>
                      </div>
                    </div>

                    <div className="text-right bg-white p-3 rounded-xl border border-gray-100 min-w-[160px]">
                      <p className="text-[10px] uppercase font-bold text-gray-400">
                        Paid Price
                      </p>
                      <p className="text-xl font-bold text-emerald-700">
                        ₹{selectedItem.finalAmount?.toLocaleString("en-IN")}
                      </p>
                      {selectedItem.plan?.originalPrice && (
                        <p className="text-[11px] text-gray-400 line-through">
                          Original ₹{selectedItem.plan.originalPrice}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Customer & Order Dates Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Info Box */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm border-b border-gray-200 pb-2">
                        <User size={16} className="text-[#E69A00]" /> Customer Profile
                      </h4>
                      <p className="text-gray-700 font-bold text-sm">
                        {selectedItem.customer?.name}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <Phone size={13} className="text-gray-400" />
                        {selectedItem.customer?.mobile}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <Mail size={13} className="text-gray-400" />
                        {selectedItem.customer?.email}
                      </p>
                    </div>

                    {/* Timeline Info Box */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm border-b border-gray-200 pb-2">
                        <CalendarDays size={16} className="text-[#E69A00]" /> Timeline & Subscription Period
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">
                            Purchased On
                          </span>
                          <span className="font-bold text-gray-800">
                            {formatDateTime(selectedItem.createdAt)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">
                            Start Date
                          </span>
                          <span className="font-bold text-gray-800">
                            {formatDate(selectedItem.startDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">
                            End Date
                          </span>
                          <span className="font-bold text-gray-800">
                            {formatDate(selectedItem.endDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">
                            Duration
                          </span>
                          <span className="font-bold text-gray-800">
                            {selectedItem.plan?.durationMonths || 6} Months
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 🔴 TAB 2: POST API FORM - CREATE PLAN DELIVERY ORDER */}
              {activeTab === "create_delivery" && (
                <div className="space-y-6">
                  {/* Success Banner */}
                  {postSuccessResponse && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl flex items-center gap-3 animate-fadeIn">
                      <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                      <div className="space-y-0.5 flex-1">
                        <h4 className="font-bold text-emerald-900 text-sm">
                          Delivery Order Created Successfully!
                        </h4>
                        <p className="text-xs text-emerald-700">
                          {postSuccessResponse.message ||
                            "The plan delivery order has been submitted successfully."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Banner */}
                  {postErrorMsg && (
                    <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-xl flex items-start gap-3 animate-fadeIn">
                      <AlertCircle size={22} className="text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-rose-900 text-xs">Order Creation Failed</h4>
                        <p className="text-xs text-rose-700">{postErrorMsg}</p>
                      </div>
                    </div>
                  )}

                  {/* Delivery Creation Form */}
                  <form onSubmit={handleCreateDeliveryOrderSubmit} className="space-y-5">
                    {/* Part 1: Order Details */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                      <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                        <span className="w-5 h-5 rounded-full bg-[#E69A00] text-white flex items-center justify-center text-[10px]">
                          1
                        </span>{" "}
                        Order Identification & Delivery Date
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Plan Purchase ID <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            readOnly
                            value={planPurchaseId}
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-800 outline-none cursor-not-allowed select-all"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Combo Set ID <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 6ab79cbfda4bbc02c80022cb"
                            value={comboSetId}
                            onChange={(e) => setComboSetId(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-800 outline-none focus:border-[#E69A00] focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Plan Delivery Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={planDeliveryDate}
                            onChange={(e) => setPlanDeliveryDate(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#E69A00] focus:bg-white [&::-webkit-calendar-picker-indicator]:hidden"
                          />
                        </div>
                      </div>

                      {/* Delivery Pincode Check & Courier Selection */}
                      <div className="pt-3 border-t border-gray-100 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-bold text-gray-700 mb-1">
                              Delivery Pincode
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Enter Pincode (e.g. 110001)"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#E69A00] focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleCheckDeliveryAvailability()}
                                disabled={checkingDelivery}
                                className="px-3 py-2 bg-[#E69A00] hover:bg-[#D48D00] text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {checkingDelivery ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Truck size={13} />
                                )}
                                Check
                              </button>
                            </div>
                          </div>

                          {availableCarriers.length > 0 && (
                            <div className="relative" ref={carrierDropdownRef}>
                              <label className="block font-bold text-gray-700 mb-1">
                                Available Couriers / Carriers ({availableCarriers.length})
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsCarrierDropdownOpen((prev) => !prev)}
                                className="w-full px-3 py-2 bg-white border border-[#E69A00] rounded-lg text-xs font-semibold text-gray-800 outline-none shadow-2xs flex items-center justify-between gap-2 cursor-pointer hover:bg-amber-50/50 transition text-left"
                              >
                                <span className="truncate">
                                  {availableCarriers.find(
                                    (c) => c.carrier_id === selectedCarrierId
                                  )?.display_title || "Select Courier"}
                                </span>
                                <ChevronDown
                                  size={14}
                                  className={`text-[#E69A00] transition-transform duration-200 shrink-0 ${isCarrierDropdownOpen ? "rotate-180" : ""
                                    }`}
                                />
                              </button>

                              {/* Downward opening menu */}
                              {isCarrierDropdownOpen && (
                                <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-amber-300 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1 divide-y divide-gray-100">
                                  {availableCarriers.map((carrier) => {
                                    const isSelected =
                                      carrier.carrier_id === selectedCarrierId;
                                    return (
                                      <button
                                        key={carrier.carrier_id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCarrierId(carrier.carrier_id);
                                          setIsCarrierDropdownOpen(false);

                                          // Auto sync selected courier's estimated delivery date to Plan Delivery Date input
                                          const selDate = parseEtdToDateString(
                                            carrier.etd ||
                                            carrier.raw?.expected_delivery_date ||
                                            carrier.raw?.etd
                                          );
                                          if (selDate) {
                                            setPlanDeliveryDate(selDate);
                                          }
                                        }}
                                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition flex items-center justify-between cursor-pointer ${isSelected
                                          ? "bg-amber-100/70 text-amber-950 font-bold"
                                          : "hover:bg-amber-50 text-gray-700"
                                          }`}
                                      >
                                        <span className="truncate pr-2">
                                          {carrier.display_title}
                                        </span>
                                        {isSelected && (
                                          <Check
                                            size={14}
                                            className="text-[#E69A00] shrink-0"
                                          />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {deliveryCheckMsg && (
                          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 size={13} /> {deliveryCheckMsg}
                          </p>
                        )}
                        {deliveryCheckError && (
                          <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                            <AlertCircle size={13} /> {deliveryCheckError}
                          </p>
                        )}
                      </div>

                      {/* Parcel Dimensions & Weight */}
                      <div className="pt-3 border-t border-gray-100">
                        <label className="block font-bold text-gray-800 text-xs mb-2 uppercase tracking-wider">
                          Package Dimensions & Weight
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Length (cm)
                            </label>
                            <input
                              type="number"
                              step="any"
                              placeholder="Length"
                              value={length}
                              onChange={(e) => setLength(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 outline-none focus:border-[#E69A00] focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Breadth (cm)
                            </label>
                            <input
                              type="number"
                              step="any"
                              placeholder="Breadth"
                              value={breadth}
                              onChange={(e) => setBreadth(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 outline-none focus:border-[#E69A00] focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Height (cm)
                            </label>
                            <input
                              type="number"
                              step="any"
                              placeholder="Height"
                              value={height}
                              onChange={(e) => setHeight(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 outline-none focus:border-[#E69A00] focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Weight (kg)
                            </label>
                            <input
                              type="number"
                              step="any"
                              placeholder="Weight"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 outline-none focus:border-[#E69A00] focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Part 2: Order Items */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#E69A00] text-white flex items-center justify-center text-[10px]">
                            2
                          </span>{" "}
                          Order Items ({orderItems.length})
                        </h4>

                        <button
                          type="button"
                          onClick={handleAddOrderItem}
                          className="flex items-center gap-1 px-3 py-1 bg-[#FAF6F0] hover:bg-[#FFF3DF] text-[#2D3A1B] font-bold text-xs rounded-lg border border-[#F2E8D9] transition cursor-pointer"
                        >
                          <Plus size={13} /> Add Product Item
                        </button>
                      </div>

                      {orderItems.map((item, idx) => {
                        const isDone = Boolean(collapsedItems[idx]);
                        const hasSelectedProduct = Boolean(
                          item.product_details.product._id &&
                          item.product_details.product.variant._id
                        );

                        return (
                          <div
                            key={idx}
                            className="bg-[#FFFDF9] border border-[#F2E8D9] rounded-xl p-4 space-y-3 relative"
                          >
                            <div className="flex items-center justify-between border-b border-[#F2E8D9] pb-2">
                              <span className="font-bold text-xs text-[#2D3A1B] uppercase tracking-wider flex items-center gap-1.5">
                                <Package size={14} className="text-[#E69A00]" /> Product #{idx + 1}
                                {isDone && (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-1 normal-case tracking-normal">
                                    <CheckCircle2 size={11} /> Done
                                  </span>
                                )}
                              </span>

                              <div className="flex items-center gap-2">
                                {isDone && (
                                  <button
                                    type="button"
                                    onClick={() => toggleItemDone(idx)}
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg border border-amber-200 transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Pencil size={12} /> Edit Selection
                                  </button>
                                )}

                                {orderItems.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOrderItem(idx)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded transition text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 size={13} /> Remove
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* 🛒 PLAN HARVEST COMBOSET & PRODUCT SELECTOR (HIDDEN WHEN DONE IS CLICKED) */}
                            {!isDone && (
                              <div className="bg-[#FFFBF0] border border-[#F2D6A7] rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-[#F2D6A7]/60 pb-2">
                                  <label className="font-bold text-[#2D2118] text-xs uppercase tracking-wider">
                                    Select Plan Harvest Combo & Jars
                                  </label>
                                  <div className="flex items-center gap-2">
                                    {loadingComboSets ? (
                                      <span className="text-[10px] text-amber-700 flex items-center gap-1 font-medium">
                                        <Loader2 size={12} className="animate-spin text-[#E69A00]" /> Loading harvest combos...
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const pId =
                                            selectedItem?.planId ||
                                            (typeof selectedItem?.plan === "object" && (selectedItem?.plan as any)?._id) ||
                                            "";
                                          const actualPlanId = getPlanIdFromPurchaseItem(selectedItem);
                                          if (actualPlanId || pId) void fetchPlanComboSets(actualPlanId || pId);
                                        }}
                                        className="text-[10px] text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 underline cursor-pointer"
                                      >
                                        <RefreshCw size={10} /> Reload Combosets
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {/* 1. Select Harvest Month Combo */}
                                  <div>
                                    <label className="block font-bold text-gray-800 text-[11px] mb-1">
                                      1. Select Harvest Combo ({planComboSets.length})
                                    </label>
                                    <select
                                      value={item.product_details.product._id || ""}
                                      onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const foundCombo = planComboSets.find(
                                          (c) => (c._id || c.monthName) === selectedId
                                        );
                                        if (foundCombo) {
                                          const firstProd =
                                            foundCombo.products && foundCombo.products.length > 0
                                              ? foundCombo.products[0]
                                              : undefined;
                                          handleSelectComboSetItem(idx, foundCombo, firstProd);
                                        }
                                      }}
                                      className="w-full px-2.5 py-2 bg-white border border-[#F2D6A7] rounded-lg text-xs font-semibold text-gray-800 outline-none focus:border-[#E69A00] shadow-2xs"
                                    >
                                      <option value="">-- Select Month Combo Set --</option>
                                      {planComboSets.map((combo, cIdx) => {
                                        const id = combo._id || combo.monthName || `combo-${cIdx}`;
                                        const label = `${combo.monthName} - ${combo.title || combo.harvestTitle || "Harvest Combo"}`;
                                        return (
                                          <option key={id} value={id}>
                                            {label}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </div>

                                  {/* 2. Select Honey Jar Product */}
                                  <div>
                                    <label className="block font-bold text-gray-800 text-[11px] mb-1">
                                      2. Select Honey Jar Product
                                    </label>
                                    {(() => {
                                      const currentCombo =
                                        planComboSets.find(
                                          (c) =>
                                            String(c._id || c.monthName || "") ===
                                            String(item.product_details.product._id || "")
                                        ) || (planComboSets.length > 0 ? planComboSets[0] : null);

                                      const products = currentCombo?.products || [];

                                      return (
                                        <select
                                          value={item.product_details.product.product_name || ""}
                                          onChange={(e) => {
                                            const prodName = e.target.value;
                                            const foundProd = products.find(
                                              (p: any) => p.name === prodName
                                            );
                                            if (currentCombo) {
                                              handleSelectComboSetItem(idx, currentCombo, foundProd);
                                            }
                                          }}
                                          className="w-full px-2.5 py-2 bg-white border border-[#F2D6A7] rounded-lg text-xs font-semibold text-gray-800 outline-none focus:border-[#E69A00] shadow-2xs"
                                        >
                                          <option value="">-- Select Honey Jar --</option>
                                          {products.map((p: any, pIdx: number) => (
                                            <option key={p._id || pIdx} value={p.name}>
                                              {p.name} ({p.weight}{p.unit})
                                            </option>
                                          ))}
                                        </select>
                                      );
                                    })()}
                                  </div>

                                  {/* 3. Jar Quantity */}
                                  <div>
                                    <label className="block font-bold text-gray-800 text-[11px] mb-1">
                                      3. Jar Quantity
                                    </label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={item.quantity}
                                      onChange={(e) =>
                                        updateOrderItem(
                                          idx,
                                          "quantity",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2.5 py-2 bg-white border border-[#F2D6A7] rounded-lg text-xs font-bold text-gray-800 outline-none focus:border-[#E69A00] shadow-2xs"
                                    />
                                  </div>
                                </div>

                                {/* 🟢 Done Button & Visual Cards */}
                                <div className="flex items-center justify-between pt-2 border-t border-[#F2D6A7]/60">
                                  <span className="text-[11px] text-amber-900 font-medium">
                                    {planComboSets.length > 0 ? "Or click a harvest card below to select:" : ""}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!hasSelectedProduct) {
                                        alert("Please select a month combo set and product jar first!");
                                        return;
                                      }
                                      toggleItemDone(idx);
                                    }}
                                    className="px-4 py-1.5 bg-[#E69A00] hover:bg-[#D48D00] text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                                  >
                                    <Check size={14} /> Done
                                  </button>
                                </div>

                                {/* 🖼️ VISUAL HARVEST CARDS GRID WITH REAL IMAGES & DETAILS */}
                                {planComboSets.length > 0 && (
                                  <div className="pt-2 border-t border-[#F2D6A7]/60 space-y-2">
                                    <label className="font-bold text-xs text-amber-950 block">
                                      Harvest Combos Image Gallery ({planComboSets.length} Months):
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                      {planComboSets.map((combo, cIdx) => {
                                        const imgUrl = extractComboImageUrl(combo);
                                        const isSelectedCombo =
                                          String(item.product_details.product._id || "") ===
                                          String(combo._id || combo.monthName || "");

                                        return (
                                          <div
                                            key={combo._id || cIdx}
                                            onClick={() => {
                                              const firstProd =
                                                combo.products && combo.products.length > 0
                                                  ? combo.products[0]
                                                  : undefined;
                                              handleSelectComboSetItem(idx, combo, firstProd);
                                            }}
                                            className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-200 bg-white shadow-2xs hover:shadow-md flex flex-col justify-between ${isSelectedCombo
                                              ? "border-[#E69A00] ring-2 ring-amber-300 bg-amber-50/40"
                                              : "border-gray-200 hover:border-amber-300"
                                              }`}
                                          >
                                            <div className="relative h-28 w-full bg-amber-100/50 overflow-hidden">
                                              <img
                                                src={imgUrl}
                                                alt={combo.title || combo.monthName}
                                                onError={(e) => {
                                                  (e.currentTarget as HTMLImageElement).src = DEFAULT_HONEY_IMAGE;
                                                }}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                              />
                                              <span className="absolute top-2 left-2 bg-[#2D2118] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase shadow-xs">
                                                {combo.monthName}
                                              </span>
                                              {combo.season && (
                                                <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                                                  {combo.season}
                                                </span>
                                              )}
                                            </div>

                                            <div className="p-2.5 space-y-1">
                                              <h6 className="font-bold text-xs text-gray-900 line-clamp-1">
                                                {combo.title || combo.harvestTitle}
                                              </h6>
                                              {combo.products && combo.products.length > 0 && (
                                                <p className="text-[10px] text-gray-500 line-clamp-1">
                                                  Jars: {combo.products.map((p) => p.name).join(", ")}
                                                </p>
                                              )}
                                              <div className="pt-1 flex items-center justify-between">
                                                <span
                                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isSelectedCombo
                                                    ? "bg-[#E69A00] text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-amber-100"
                                                    }`}
                                                >
                                                  {isSelectedCombo ? "Selected ✓" : "Select Combo"}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {comboSetsErrorMsg && (
                                  <p className="text-[10px] text-rose-600 font-medium pt-1">
                                    Plan Combosets API notice: {comboSetsErrorMsg}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* 📋 AUTO-FILLED PRODUCT INFORMATION CARD (ALWAYS VISIBLE WHEN SELECTED, OR PREVIEWED) */}
                            {hasSelectedProduct && (
                              <div className="bg-white border border-amber-200/80 rounded-xl p-4 space-y-3 shadow-2xs">
                                <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                                  <span className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <CheckCircle2 size={15} className="text-emerald-600" />
                                    Selected Harvest & Product Details
                                  </span>

                                  {isDone && (
                                    <button
                                      type="button"
                                      onClick={() => toggleItemDone(idx)}
                                      className="text-amber-800 hover:text-amber-950 font-bold text-[11px] flex items-center gap-1 underline cursor-pointer"
                                    >
                                      <Pencil size={11} /> Change Selection
                                    </button>
                                  )}
                                </div>

                                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                                  {/* Product Info with Thumbnail Image */}
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-amber-300 shadow-sm shrink-0 bg-amber-50">
                                      <img
                                        src={extractComboImageUrl(
                                          item.product_details.product.image?.image_url ||
                                          item.product_details.product.image ||
                                          item.product_details.product
                                        )}
                                        alt={item.product_details.product.product_name || "Product"}
                                        onError={(e) => {
                                          (e.currentTarget as HTMLImageElement).src = DEFAULT_HONEY_IMAGE;
                                        }}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="space-y-1.5 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {(item.product_details.product as any).monthName && (
                                          <span className="px-2.5 py-0.5 bg-[#2D2118] text-white rounded-full text-[10px] font-extrabold uppercase shadow-2xs">
                                            {(item.product_details.product as any).monthName} Harvest
                                          </span>
                                        )}
                                        {(item.product_details.product as any).season && (
                                          <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-extrabold shadow-2xs">
                                            {(item.product_details.product as any).season}
                                          </span>
                                        )}
                                      </div>

                                      <h5 className="font-bold text-gray-900 text-sm leading-snug">
                                        {item.product_details.product.product_name || "Selected Product"}
                                      </h5>

                                      {(item.product_details.product as any).comboTitle &&
                                        (item.product_details.product as any).comboTitle !== item.product_details.product.product_name && (
                                          <p className="text-[11px] font-semibold text-amber-800">
                                            {(item.product_details.product as any).comboTitle}
                                          </p>
                                        )}

                                      {(item.product_details.product as any).description && (
                                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                                          {(item.product_details.product as any).description}
                                        </p>
                                      )}

                                      <div className="pt-1 flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-bold border border-amber-200">
                                          Weight: {item.product_details.product.variant.weight} {item.product_details.product.variant.unit || "g"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Delivery Quantity & Jar Details */}
                                  <div className="bg-[#FFFDF9] border border-[#F2E8D9] p-3.5 rounded-xl min-w-[180px] text-right space-y-1.5 shrink-0 flex flex-col justify-center items-end">
                                    <span className="text-[10px] uppercase font-extrabold text-amber-800 tracking-wider">
                                      Delivery Quantity
                                    </span>
                                    <p className="text-base font-extrabold text-gray-900">
                                      {item.quantity} Jar{item.quantity > 1 ? "s" : ""}
                                    </p>
                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                      Net Weight: {item.product_details.product.variant.weight * item.quantity} {item.product_details.product.variant.unit || "g"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Submit Order Action Button */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={submittingOrder}
                        className="px-6 py-2.5 bg-[#E69A00] hover:bg-[#D48D00] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {submittingOrder ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Send size={15} />
                        )}
                        {submittingOrder ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 🔵 TAB 3: DELIVERIES */}
              {activeTab === "deliveries" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">
                      Scheduled Delivery Batches ({selectedItem.deliveries?.length || 0})
                    </h3>
                    <span className="text-xs text-gray-500">
                      Completed: {selectedItem.completedDeliveries} of {selectedItem.totalDeliveries}
                    </span>
                  </div>

                  {selectedItem.deliveries && selectedItem.deliveries.length > 0 ? (
                    <div className="space-y-3">
                      {selectedItem.deliveries.map((del) => (
                        <div
                          key={del._id}
                          className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-2xs"
                        >
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-[#E69A00] text-white flex items-center justify-center font-bold text-xs">
                                #{del.deliveryNumber}
                              </span>
                              <span className="font-bold text-gray-900">
                                Delivery Batch #{del.deliveryNumber}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${del.status === "processing"
                                  ? "bg-amber-100 text-amber-800"
                                  : del.status === "delivered"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-gray-100 text-gray-700"
                                  }`}
                              >
                                {del.status}
                              </span>
                            </div>
                            <span className="font-mono text-[11px] text-gray-400">
                              Order ID: {del.orderId || "-"}
                            </span>
                          </div>

                          {/* Products in this delivery */}
                          {del.products && del.products.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">
                                Dispatch Products:
                              </p>
                              {del.products.map((prod) => (
                                <div
                                  key={prod._id}
                                  className="flex items-center justify-between text-xs font-semibold text-gray-800"
                                >
                                  <span>
                                    {prod.productName} ({prod.quantityPerJar}
                                    {prod.quantityUnit})
                                  </span>
                                  <span className="text-[#E69A00] font-mono">
                                    Qty: {prod.quantity} Jar(s)
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Dates & Tracking */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-600 pt-1">
                            <div>
                              <span className="text-gray-400 font-bold block">
                                Scheduled Date:
                              </span>
                              {formatDate(del.scheduledDate)}
                            </div>
                            <div>
                              <span className="text-gray-400 font-bold block">
                                Shipped At:
                              </span>
                              {del.shippedAt ? formatDate(del.shippedAt) : "Not yet shipped"}
                            </div>
                            <div>
                              <span className="text-gray-400 font-bold block">
                                Delivered At:
                              </span>
                              {del.deliveredAt ? formatDate(del.deliveredAt) : "Pending"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400">
                      No delivery schedules recorded for this plan purchase.
                    </div>
                  )}
                </div>
              )}

              {/* 💳 TAB 4: PAYMENT & RAZORPAY */}
              {activeTab === "payment" && (
                <div className="space-y-4">
                  <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800">
                        Payment Status
                      </span>
                      <p className="text-lg font-bold text-emerald-900 uppercase">
                        {selectedItem.payment_status || selectedItem.payment?.status || "Captured"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-emerald-800">
                        Total Amount
                      </span>
                      <p className="text-xl font-bold text-emerald-900">
                        ₹{selectedItem.finalAmount?.toLocaleString("en-IN")}{" "}
                        {selectedItem.currency}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 font-mono text-xs">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm font-sans border-b border-gray-200 pb-2">
                      <CreditCard size={16} className="text-[#E69A00]" /> Razorpay Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">
                          Razorpay Payment ID:
                        </span>
                        <span className="font-bold text-gray-800">
                          {selectedItem.payment?.razorpay_payment_id || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">
                          Razorpay Order ID:
                        </span>
                        <span className="font-bold text-gray-800">
                          {selectedItem.payment?.razorpay_order_id || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">
                          Payment Method:
                        </span>
                        <span className="font-bold text-amber-700 uppercase">
                          {selectedItem.payment?.method || selectedItem.payment_mode || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">
                          Bank Code:
                        </span>
                        <span className="font-bold text-gray-800">
                          {selectedItem.payment?.bank || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">
                          Gateway Fee:
                        </span>
                        <span className="font-bold text-gray-800">
                          ₹{selectedItem.payment?.fee ? selectedItem.payment.fee / 100 : 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">
                          Gateway Tax:
                        </span>
                        <span className="font-bold text-gray-800">
                          ₹{selectedItem.payment?.tax ? selectedItem.payment.tax / 100 : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 🏠 TAB 5: ADDRESSES */}
              {activeTab === "addresses" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Shipping Address */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm border-b border-gray-200 pb-2">
                      <MapPin size={16} className="text-[#E69A00]" /> Shipping Address
                    </h4>
                    {selectedItem.shipping_address ? (
                      <div className="space-y-1 text-gray-700 leading-relaxed">
                        <p className="font-bold text-gray-900">
                          {selectedItem.shipping_address.full_name}
                        </p>
                        <p className="text-gray-600">
                          Phone: {selectedItem.shipping_address.phone}
                        </p>
                        <p>{selectedItem.shipping_address.address_line1}</p>
                        {selectedItem.shipping_address.address_line2 && (
                          <p>{selectedItem.shipping_address.address_line2}</p>
                        )}
                        <p>
                          {selectedItem.shipping_address.city},{" "}
                          {selectedItem.shipping_address.state} -{" "}
                          <span className="font-mono font-bold">
                            {selectedItem.shipping_address.pincode}
                          </span>
                        </p>
                        <p className="text-gray-500 font-semibold">
                          {selectedItem.shipping_address.country || "India"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-400">No shipping address recorded</p>
                    )}
                  </div>

                  {/* Billing Address */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm border-b border-gray-200 pb-2">
                      <Building2 size={16} className="text-[#E69A00]" /> Billing Address
                    </h4>
                    {selectedItem.billing_address ? (
                      <div className="space-y-1 text-gray-700 leading-relaxed">
                        <p className="font-bold text-gray-900">
                          {selectedItem.billing_address.full_name}
                        </p>
                        <p className="text-gray-600">
                          Phone: {selectedItem.billing_address.phone}
                        </p>
                        <p>{selectedItem.billing_address.address_line1}</p>
                        {selectedItem.billing_address.address_line2 && (
                          <p>{selectedItem.billing_address.address_line2}</p>
                        )}
                        <p>
                          {selectedItem.billing_address.city},{" "}
                          {selectedItem.billing_address.state} -{" "}
                          <span className="font-mono font-bold">
                            {selectedItem.billing_address.pincode}
                          </span>
                        </p>
                        <p className="text-gray-500 font-semibold">
                          {selectedItem.billing_address.country || "India"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-400">Same as shipping address</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#FAF6F0] p-4 border-t border-[#F2E8D9] flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 bg-[#2D3A1B] hover:bg-[#1E2712] text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
