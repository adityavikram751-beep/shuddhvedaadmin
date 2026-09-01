"use client";

import { useState, useEffect } from "react";
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
      _id: "6a5f6296653462ef2e5dbf9b",
      product_name: "Pure Mustard Honey",
      brand: "SudVeda Honey",
      image: {
        image_url:
          "https://res.cloudinary.com/anjp8e9i/image/upload/v1785911046/products/a6bvqwytysado8c2z140.png",
      },
      variant: {
        _id: "6a5f64b3653462ef2e5dbfa0",
        weight: 250,
        unit: "g",
        price: 299,
        mrp: 349,
        save: 50,
      },
    },
    totalAmount: 299,
    totalWeight: 250,
    totalsave: 50,
  },
};

export default function SubscribePlanOrders() {
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
  const [planDeliveryDate, setPlanDeliveryDate] = useState("");
  const [orderItems, setOrderItems] = useState<DeliveryOrderItem[]>([
    defaultSampleItem,
  ]);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [postSuccessResponse, setPostSuccessResponse] = useState<any>(null);
  const [postErrorMsg, setPostErrorMsg] = useState<string | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  // 🌐 GET API Call: Fetch All Purchase Plan Orders
  const fetchPurchasePlans = async () => {
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
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];
        setPurchasePlans(list);
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

  useEffect(() => {
    void fetchPurchasePlans();
  }, []);

  // When a modal opens or selected item changes, setup POST API form values
  const handleOpenDetailModal = (
    item: PurchasePlanItem,
    initialTab: "overview" | "create_delivery" | "deliveries" | "payment" | "addresses" = "overview"
  ) => {
    setSelectedItem(item);
    setActiveTab(initialTab);
    setPlanPurchaseId(item._id);
    setPostSuccessResponse(null);
    setPostErrorMsg(null);

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

    // Auto populate items if delivery has products
    if (item.deliveries && item.deliveries.length > 0) {
      const currentDel =
        item.deliveries.find(
          (d) => d.deliveryNumber === item.currentDeliveryNumber
        ) || item.deliveries[0];

      if (currentDel?.products && currentDel.products.length > 0) {
        const populatedItems: DeliveryOrderItem[] = currentDel.products.map(
          (p) => ({
            type: "PLAN",
            quantity: p.quantity || 1,
            reserved_quantity: p.quantity || 1,
            product_details: {
              product: {
                _id: p.productId || "6a5f6296653462ef2e5dbf9b",
                product_name: p.productName || "Pure Mustard Honey",
                brand: "SudVeda Honey",
                image: {
                  image_url:
                    item.plan?.plan_image ||
                    "https://res.cloudinary.com/anjp8e9i/image/upload/v1785911046/products/a6bvqwytysado8c2z140.png",
                },
                variant: {
                  _id: p.variantId || "6a5f64b3653462ef2e5dbfa0",
                  weight: p.quantityPerJar || 250,
                  unit: p.quantityUnit || "g",
                  price: item.plan?.price || 299,
                  mrp: item.plan?.originalPrice || 349,
                  save: Math.max(
                    0,
                    (item.plan?.originalPrice || 349) -
                      (item.plan?.price || 299)
                  ),
                },
              },
              totalAmount: (item.plan?.price || 299) * (p.quantity || 1),
              totalWeight: (p.quantityPerJar || 250) * (p.quantity || 1),
              totalsave:
                Math.max(
                  0,
                  (item.plan?.originalPrice || 349) -
                    (item.plan?.price || 299)
                ) * (p.quantity || 1),
            },
          })
        );
        setOrderItems(populatedItems);
      } else {
        setOrderItems([defaultSampleItem]);
      }
    } else {
      setOrderItems([defaultSampleItem]);
    }
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
  };

  // Get live POST API payload
  const getPostPayload = () => ({
    planPurchaseId: planPurchaseId.trim(),
    plan_delivery_date: planDeliveryDate.trim(),
    items: orderItems,
  });

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
        void fetchPurchasePlans(); // Refresh background table list
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
          onClick={fetchPurchasePlans}
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
            onClick={fetchPurchasePlans}
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
                          {item.plan?.plan_image ? (
                            <img
                              src={item.plan.plan_image}
                              alt={item.plan.name}
                              className="w-8 h-8 rounded-lg object-cover border border-amber-100 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-[#E69A00] shrink-0 font-bold">
                              <Package size={15} />
                            </div>
                          )}
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
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              item.payment_status === "captured"
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
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            item.status?.toLowerCase() === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.status?.toLowerCase() === "completed"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : item.status?.toLowerCase() === "processing"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status?.toLowerCase() === "active"
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
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        selectedItem.status === "active"
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
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === "overview"
                    ? "border-[#E69A00] text-[#E69A00] bg-white font-bold"
                    : "border-transparent hover:text-gray-900"
                }`}
              >
                <Package size={15} /> Overview & Plan
              </button>

              {/* Create Plan Delivery Order Tab */}
              <button
                onClick={() => setActiveTab("create_delivery")}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === "create_delivery"
                    ? "border-[#E69A00] text-white bg-[#E69A00] rounded-t-lg font-bold"
                    : "border-transparent text-amber-700 bg-amber-50 hover:bg-amber-100"
                }`}
              >
                <Send size={15} /> Create Plan Delivery Order
              </button>

              <button
                onClick={() => setActiveTab("deliveries")}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === "deliveries"
                    ? "border-[#E69A00] text-[#E69A00] bg-white font-bold"
                    : "border-transparent hover:text-gray-900"
                }`}
              >
                <Truck size={15} /> Deliveries ({selectedItem.deliveries?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab("payment")}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === "payment"
                    ? "border-[#E69A00] text-[#E69A00] bg-white font-bold"
                    : "border-transparent hover:text-gray-900"
                }`}
              >
                <CreditCard size={15} /> Razorpay & Payment
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === "addresses"
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
                    <div className="flex items-center gap-4">
                      {selectedItem.plan?.plan_image ? (
                        <img
                          src={selectedItem.plan.plan_image}
                          alt={selectedItem.plan.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-amber-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-[#E69A00] flex items-center justify-center">
                          <Package size={28} />
                        </div>
                      )}
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Plan Purchase ID (planPurchaseId) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={planPurchaseId}
                            onChange={(e) => setPlanPurchaseId(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-[#E69A00] focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Plan Delivery Date (plan_delivery_date) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={planDeliveryDate}
                            onChange={(e) => setPlanDeliveryDate(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#E69A00] focus:bg-white"
                          />
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

                      {orderItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-[#FFFDF9] border border-[#F2E8D9] rounded-xl p-4 space-y-3 relative"
                        >
                          <div className="flex items-center justify-between border-b border-[#F2E8D9] pb-2">
                            <span className="font-bold text-xs text-[#2D3A1B] uppercase tracking-wider flex items-center gap-1.5">
                              <Package size={14} className="text-[#E69A00]" /> Product #{idx + 1}
                            </span>

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

                          {/* Item Type & Quantities */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                                Item Type
                              </label>
                              <input
                                type="text"
                                value={item.type}
                                onChange={(e) =>
                                  updateOrderItem(idx, "type", e.target.value)
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                                Quantity
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
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                                Reserved Quantity
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={item.reserved_quantity}
                                onChange={(e) =>
                                  updateOrderItem(
                                    idx,
                                    "reserved_quantity",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00]"
                              />
                            </div>
                          </div>

                          {/* Product Spec Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-[#F2E8D9]">
                            <div>
                              <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                                Product ID (_id)
                              </label>
                              <input
                                type="text"
                                value={item.product_details.product._id}
                                onChange={(e) =>
                                  updateOrderItem(
                                    idx,
                                    "product._id",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-mono outline-none focus:border-[#E69A00]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                                Product Name
                              </label>
                              <input
                                type="text"
                                value={item.product_details.product.product_name}
                                onChange={(e) =>
                                  updateOrderItem(
                                    idx,
                                    "product.product_name",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                                Brand
                              </label>
                              <input
                                type="text"
                                value={item.product_details.product.brand}
                                onChange={(e) =>
                                  updateOrderItem(
                                    idx,
                                    "product.brand",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00]"
                              />
                            </div>
                          </div>

                          {/* Variant Specs */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                                Weight (e.g. 250)
                              </label>
                              <input
                                type="number"
                                value={item.product_details.product.variant.weight}
                                onChange={(e) =>
                                  updateOrderItem(
                                    idx,
                                    "variant.weight",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                                Unit (g / kg)
                              </label>
                              <input
                                type="text"
                                value={item.product_details.product.variant.unit}
                                onChange={(e) =>
                                  updateOrderItem(
                                    idx,
                                    "variant.unit",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                                Unit Price (₹)
                              </label>
                              <input
                                type="number"
                                value={item.product_details.product.variant.price}
                                onChange={(e) =>
                                  updateOrderItem(
                                    idx,
                                    "variant.price",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                                Unit MRP (₹)
                              </label>
                              <input
                                type="number"
                                value={item.product_details.product.variant.mrp}
                                onChange={(e) =>
                                  updateOrderItem(
                                    idx,
                                    "variant.mrp",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#E69A00]"
                              />
                            </div>
                          </div>

                          {/* Calculated Totals Box */}
                          <div className="bg-white p-2.5 rounded-lg border border-gray-200 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-gray-700">
                            <div>
                              Total Amount:{" "}
                              <span className="text-emerald-700 font-bold">
                                ₹{item.product_details.totalAmount}
                              </span>
                            </div>
                            <div>
                              Total Weight:{" "}
                              <span className="text-amber-800 font-bold">
                                {item.product_details.totalWeight}{" "}
                                {item.product_details.product.variant.unit}
                              </span>
                            </div>
                            <div>
                              Total Save:{" "}
                              <span className="text-blue-700 font-bold">
                                ₹{item.product_details.totalsave}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
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
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  del.status === "processing"
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
