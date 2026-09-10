"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Printer,
  Download,
  Phone,
  Mail,
  CheckCircle2,
  Circle,
  User,
  ClipboardList,
  Box,
  FileText,
  Clock,
  Zap,
  Truck,
  XCircle,
  PackageCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  AlertCircle,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

type OrderStatus = "Pending" | "Confirmed" | "Packed" | "Shipped" | "Cancelled";

interface Product {
  name: string;
  brand?: string;
  description?: string;
  variant: string;
  qty: number;
  price: number;
  mrp?: number;
  save?: number;
  image: string;
  cartItemId?: string;
}

const defaultProducts: Product[] = [
  {
    name: "Raw Honey 250g",
    variant: "250g",
    qty: 1,
    price: 249,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
  },
  {
    name: "Wild Honey 1kg",
    variant: "1kg",
    qty: 1,
    price: 675,
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
  },
];

function loadPdfLibs(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).jspdf?.jsPDF) {
      resolve((window as any).jspdf);
      return;
    }
    const s1 = document.createElement("script");
    s1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s1.onload = () => {
      const s2 = document.createElement("script");
      s2.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
      s2.onload = () => resolve((window as any).jspdf);
      s2.onerror = reject;
      document.body.appendChild(s2);
    };
    s1.onerror = reject;
    document.body.appendChild(s1);
  });
}

export default function OrderDetails() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id") || searchParams.get("group_id") || searchParams.get("groupId");

  const [loadingOrder, setLoadingOrder] = useState<boolean>(false);
  const [allApiOrders, setAllApiOrders] = useState<any[]>([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number>(0);

  const [orderIdLabel, setOrderIdLabel] = useState<string>("#ORD-1052");
  const [orderDateLabel, setOrderDateLabel] = useState<string>("07 Jul 2026 • 10:15 AM");
  const [customerInfo, setCustomerInfo] = useState<{
    name: string;
    phone: string;
    email: string;
    shippingName?: string;
    shippingPhone?: string;
    shippingAddress: string;
    billingName?: string;
    billingPhone?: string;
    billingAddress: string;
    customerNote?: string;
  }>({
    name: "aditya",
    phone: "8175022207",
    email: "",
    shippingName: "Anoop",
    shippingPhone: "08377738980",
    shippingAddress: "Hno-49, Garwa,lambhua, Sultanpur, Hno-49, Sultanpur, Uttar Pradesh, 227304, India",
    billingName: "Anoop",
    billingPhone: "08377738980",
    billingAddress: "Hno-49, Garwa,lambhua, Sultanpur, Garwa,Lambhua,Sultanpur, Sultanpur, Uttar Pradesh, 227304, India",
    customerNote: "Please deliver during daytime.",
  });

  const [orderAmounts, setOrderAmounts] = useState<{
    groupId: string;
    totalAmount: number;
    finalAmount: number;
    codAmount: number;
    couponDiscount: number;
    totalSave: number;
    totalWeight: number;
  }>({
    groupId: "SG-20260822-3D0C4823",
    totalAmount: 449,
    finalAmount: 561.25,
    codAmount: 112.25,
    couponDiscount: 0,
    totalSave: 51,
    totalWeight: 250,
  });

  const [orderMetaData, setOrderMetaData] = useState<{
    subOrderId: string;
    paymentStatus: string;
    paymentMethod: string;
    orderStatus: string;
    inventoryStatus: string;
    trackingNumber: string;
    deliveryMethod: string;
    deliveryPartner: string;
    deliveryCharge: number;
    estimatedDelivery: string;
  }>({
    subOrderId: "SV - 20260822 -7C1A1FA0",
    paymentStatus: "Pending",
    paymentMethod: "COD",
    orderStatus: "Processing",
    inventoryStatus: "Reserved",
    trackingNumber: "123456789012",
    deliveryMethod: "Standard Delivery",
    deliveryPartner: "Delhivery",
    deliveryCharge: 60,
    estimatedDelivery: "3-5 Business Days",
  });

  const [productList, setProductList] = useState<Product[]>(defaultProducts);

  const [confirmed, setConfirmed] = useState(false);
  const [packed, setPacked] = useState(false);
  const [shipped, setShipped] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const [confirmedAt, setConfirmedAt] = useState<string | null>("07 Jul 2026 • 10:20 AM");
  const [packedAt, setPackedAt] = useState<string | null>(null);
  const [shippedAt, setShippedAt] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [pdfReady, setPdfReady] = useState(false);
  const pdfLoadStarted = useRef(false);

  // Modal State for Confirm Order API integration
  const [rawGroupId, setRawGroupId] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pincodeInput, setPincodeInput] = useState<string>("");
  const [checkingDelivery, setCheckingDelivery] = useState<boolean>(false);
  const [availableCarriers, setAvailableCarriers] = useState<
    Array<{
      carrier_id: string;
      courier_name: string;
      display_title: string;
      rate?: string | number;
      etd?: string;
      mode?: string;
      raw?: any;
    }>
  >([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>("");
  const [orderGroupIdInput, setOrderGroupIdInput] = useState<string>("");
  const [dimensions, setDimensions] = useState<{
    length: string;
    breadth: string;
    height: string;
    weight: string;
  }>({
    length: "",
    breadth: "",
    height: "",
    weight: "",
  });
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [isCarrierDropdownOpen, setIsCarrierDropdownOpen] = useState<boolean>(false);
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

  // Calculate pricing breakdown dynamically
  const subtotal = productList.reduce((s, p) => s + p.price * p.qty, 0);
  const shipping = orderMetaData.deliveryCharge || 60;
  const discount = subtotal > 1000 ? 50 : 0;
  const gstRate = 0.05;
  const gst = Math.round(subtotal * gstRate);
  const grandTotal = Math.max(0, subtotal + shipping - discount + gst);

  const populateOrderFromData = (rawItem: any) => {
    if (!rawItem) return;

    let item = rawItem;
    if (item.order && typeof item.order === "object" && !Array.isArray(item.order)) {
      item = item.order;
    } else if (item.data && typeof item.data === "object" && !Array.isArray(item.data)) {
      item = item.data;
    }

    const ordersList = Array.isArray(item.orders) ? item.orders : [];
    const firstOrder = ordersList[0] || {};

    const displayId =
      item.group_id ||
      item.groupId ||
      firstOrder.order_id ||
      item.orderId ||
      item.order_id ||
      (item._id ? `#ORD-${item._id.slice(-5).toUpperCase()}` : "#ORD-1052");
    setOrderIdLabel(displayId);

    const dateObj = new Date(item.createdAt || firstOrder.createdAt || item.date || item.orderDate || Date.now());
    const dateStr = !isNaN(dateObj.getTime())
      ? `${dateObj.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })} • ${dateObj.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`
      : "07 Jul 2026 • 10:15 AM";
    setOrderDateLabel(`Placed on ${dateStr}`);

    // Customer details extraction
    const u =
      (typeof firstOrder.userId === "object" && firstOrder.userId ? firstOrder.userId : null) ||
      (typeof item.userId === "object" && item.userId ? item.userId : null) ||
      (typeof item.customer === "object" && item.customer ? item.customer : null) ||
      {};
    const sa =
      (typeof firstOrder.shipping_address === "object" && firstOrder.shipping_address ? firstOrder.shipping_address : null) ||
      (typeof item.shipping_address === "object" && item.shipping_address ? item.shipping_address : null) ||
      {};
    const ba =
      (typeof firstOrder.billing_address === "object" && firstOrder.billing_address ? firstOrder.billing_address : null) ||
      (typeof item.billing_address === "object" && item.billing_address ? item.billing_address : null) ||
      {};

    let name =
      u.name ||
      u.full_name ||
      u.fullName ||
      (u.first_name ? `${u.first_name} ${u.last_name || ""}`.trim() : "") ||
      sa.full_name ||
      sa.name ||
      sa.fullName ||
      ba.full_name ||
      ba.name ||
      (typeof item.customer === "string" && item.customer.trim() && item.customer !== "Customer" ? item.customer : "") ||
      "";

    let phone =
      u.mobile ||
      u.phone ||
      u.contact ||
      sa.phone ||
      sa.mobile ||
      sa.contact ||
      ba.phone ||
      ba.mobile ||
      "";

    let email =
      u.email ||
      u.email_address ||
      sa.email ||
      ba.email ||
      "";

    if (!name) name = email ? email.split("@")[0] : phone ? `Customer (${phone.slice(-4)})` : "Guest Customer";

    const formatAddr = (addrObj: any) => {
      if (!addrObj) return "";
      if (typeof addrObj === "string") return addrObj.trim();
      const line1 = addrObj.address_line1 || addrObj.addressLine1 || addrObj.address || addrObj.street || addrObj.hno || "";
      const line2 = addrObj.address_line2 || addrObj.addressLine2 || addrObj.area || addrObj.locality || "";
      const city = addrObj.city || addrObj.district || "";
      const state = addrObj.state || "";
      const pincode = addrObj.pincode || addrObj.zip || addrObj.postalCode || addrObj.zipCode || "";
      const country = addrObj.country || "India";

      const parts = [line1, line2, city, state, pincode, country].filter((p) => p && String(p).trim().length > 0);
      return parts.join(", ");
    };

    let shippingAddrStr = formatAddr(sa);
    let billingAddrStr = formatAddr(ba);

    if (!shippingAddrStr) shippingAddrStr = billingAddrStr || "-";
    if (!billingAddrStr) billingAddrStr = shippingAddrStr !== "-" ? shippingAddrStr : "-";

    const shippingName = sa.full_name || sa.name || name;
    const shippingPhone = sa.phone || sa.mobile || phone;
    const billingName = ba.full_name || ba.name || name;
    const billingPhone = ba.phone || ba.mobile || phone;
    const custNote = firstOrder.customer_note || item.customer_note || "";

    setCustomerInfo({
      name,
      phone,
      email,
      shippingName,
      shippingPhone,
      shippingAddress: shippingAddrStr,
      billingName,
      billingPhone,
      billingAddress: billingAddrStr,
      customerNote: custNote,
    });

    const og = typeof item.order_group_id === "object" && item.order_group_id ? item.order_group_id : {};

    const groupId = item.group_id || item.groupId || og.group_id || "";
    
    const findHex24 = (...vals: any[]): string => {
      for (const v of vals) {
        if (!v) continue;
        const str = typeof v === "object" ? v._id || v.id : String(v);
        if (typeof str === "string" && /^[0-9a-fA-F]{24}$/.test(str)) {
          return str;
        }
      }
      return "";
    };

    const mongoId =
      findHex24(
        item._id,
        og._id,
        item.order_group_id,
        item.ordergoupId,
        item.id,
        firstOrder._id,
        firstOrder.order_group_id,
        queryId
      ) || groupId;
    setRawGroupId(String(mongoId));

    const tAmt = Number(item.totalAmount ?? firstOrder.totalAmount ?? item.total_amount ?? og.totalAmount ?? 0);
    const fAmt = Number(item.finalAmount ?? firstOrder.finalAmount ?? item.final_amount ?? og.finalAmount ?? 0);
    const cAmt = Number(item.cod_amount ?? item.codAmount ?? firstOrder.cod_amount ?? og.cod_amount ?? 0);

    const couponObj = item.coupon || firstOrder.coupon || null;
    const couponDisc = Number(couponObj?.discountAmount ?? item.couponDiscount ?? item.coupon_discount ?? 0);
    let totalSave = Number(item.totalsave ?? item.total_save ?? item.totalSave ?? 0);
    let weight = Number(item.totalWeight ?? item.total_weight ?? item.weight ?? 0);

    // Parse products list
    let rawProds: any[] = [];
    if (ordersList.length > 0) {
      rawProds = ordersList.flatMap((o: any) =>
        Array.isArray(o.items)
          ? o.items
          : Array.isArray(o.products)
          ? o.products
          : Array.isArray(o.order_items)
          ? o.order_items
          : []
      );
    } else {
      rawProds = Array.isArray(item.products)
        ? item.products
        : Array.isArray(item.items)
        ? item.items
        : Array.isArray(item.order_items)
        ? item.order_items
        : Array.isArray(item.product_details)
        ? item.product_details
        : item.plan
        ? [item.plan]
        : [];
    }

    if (rawProds.length > 0) {
      let weightSum = 0;
      let saveSum = 0;
      const parsedProds: Product[] = rawProds.map((p: any) => {
        const pd = p.product_details || {};
        const prod = pd.product || p.product || p;
        const variant = prod.variant || pd.variant || {};

        const pName =
          prod.product_name ||
          prod.name ||
          p.name ||
          "Wild Forest Multiflora Honey";

        const brand = prod.brand || "";
        const description = prod.description || "";

        const weightVal = variant.weight || p.variant || p.weight || pd.totalWeight || "";
        const unitVal = variant.unit || p.unit || "g";
        const variantStr = weightVal ? (typeof weightVal === "number" ? `${weightVal}${unitVal}` : String(weightVal)) : "250g";

        const qty = Number(p.quantity || p.qty || 1);
        const price = Number(variant.price || pd.finalAmount || p.price || 0);
        const mrp = Number(variant.mrp || 0);
        const save = Number(variant.save || pd.totalsave || 0);

        if (pd.totalWeight) weightSum += Number(pd.totalWeight);
        else if (typeof weightVal === "number") weightSum += weightVal * qty;

        if (pd.totalsave) saveSum += Number(pd.totalsave);
        else if (variant.save) saveSum += Number(variant.save) * qty;

        let image =
          prod.image?.image_url ||
          prod.image ||
          p.image_url ||
          p.image ||
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60";
        if (typeof image === "object" && image) {
          image = image.image_url || image.url || "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60";
        }

        return {
          name: pName,
          brand,
          description,
          variant: variantStr,
          qty,
          price,
          mrp,
          save,
          image,
          cartItemId: pd.cartItemId || p.cartItemId,
        };
      });
      setProductList(parsedProds);

      if (weightSum > 0) weight = weightSum;
      if (saveSum > 0) totalSave = saveSum;
    }

    setOrderAmounts({
      groupId,
      totalAmount: tAmt,
      finalAmount: fAmt,
      codAmount: cAmt,
      couponDiscount: couponDisc,
      totalSave: totalSave,
      totalWeight: weight,
    });

    // Order Meta
    const subOrderId = firstOrder.order_id || item.order_id || "";
    const ordStatus = firstOrder.order_status || item.order_status || item.status || "processing";
    const invStatus = firstOrder.inventory_status || item.inventory_status || "reserved";
    const payStatus = item.payment_status || firstOrder.payment_status || item.payment?.status || "pending";
    const payMethod = (item.payment_mode || firstOrder.payment_mode || item.payment_method || item.payment?.method || "COD").toUpperCase();
    const tracking = item.trackingNumber || firstOrder.trackingNumber || item.tracking_number || "123456789012";
    const courier = item.courier || firstOrder.courier || item.delivery_partner || "Delhivery";
    const shippingCharge = Number(item.shipping_charge || item.shippingCharge || 60);

    setOrderMetaData({
      subOrderId,
      paymentStatus: payStatus.charAt(0).toUpperCase() + payStatus.slice(1).toLowerCase(),
      paymentMethod: payMethod,
      orderStatus: ordStatus.charAt(0).toUpperCase() + ordStatus.slice(1).toLowerCase(),
      inventoryStatus: invStatus.charAt(0).toUpperCase() + invStatus.slice(1).toLowerCase(),
      trackingNumber: tracking,
      deliveryMethod: "Standard Delivery",
      deliveryPartner: courier,
      deliveryCharge: shippingCharge,
      estimatedDelivery: "3-5 Business Days",
    });

    // Status sync
    const st = String(firstOrder.order_status || item.order_status || item.status || "Pending").toLowerCase();
    if (st.includes("cancel")) {
      setCancelled(true);
      setConfirmed(false);
      setPacked(false);
      setShipped(false);
    } else if (st.includes("ship") || st.includes("deliver")) {
      setShipped(true);
      setPacked(true);
      setConfirmed(true);
      setCancelled(false);
    } else if (st.includes("pack")) {
      setPacked(true);
      setConfirmed(true);
      setShipped(false);
      setCancelled(false);
    } else if (st.includes("confirm")) {
      setConfirmed(true);
      setPacked(false);
      setShipped(false);
      setCancelled(false);
    } else {
      setConfirmed(false);
      setPacked(false);
      setShipped(false);
      setCancelled(false);
    }
  };

  // 🌐 GET API Call: Fetch Order Detail by ID
  const fetchOrderData = async () => {
    setLoadingOrder(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sudhveda_token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      if (queryId) {
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(queryId);

        const endpointsToTry: string[] = [
          `${API_BASE_URL}/api/admin/order-dashboard/orders?group_id=${encodeURIComponent(queryId)}`,
          `${API_BASE_URL}/api/admin/order-dashboard/orders?groupId=${encodeURIComponent(queryId)}`,
          `${API_BASE_URL}/api/admin/order-dashboard/orders/group/${encodeURIComponent(queryId)}`,
          `${API_BASE_URL}/api/admin/order-dashboard/orders?id=${encodeURIComponent(queryId)}`,
        ];

        if (isMongoId) {
          endpointsToTry.unshift(`${API_BASE_URL}/api/admin/order-dashboard/orders/${encodeURIComponent(queryId)}`);
        }

        for (const url of endpointsToTry) {
          try {
            const detailRes = await fetch(url, {
              method: "GET",
              credentials: "include",
              headers,
            });
            const detailJson = await detailRes.json().catch(() => ({}));
            
            if (detailRes.ok && detailJson.success !== false) {
              const resData = detailJson.data || detailJson.order || detailJson;
              
              if (resData) {
                let targetItem: any = null;
                if (Array.isArray(resData)) {
                  targetItem = resData.find(
                    (o: any) => o.group_id === queryId || o._id === queryId || o.id === queryId
                  ) || resData[0];
                } else if (typeof resData === "object" && (resData.group_id || resData.orders || resData._id || resData.items)) {
                  targetItem = resData;
                }

                if (targetItem) {
                  populateOrderFromData(targetItem);
                  setLoadingOrder(false);
                  return;
                }
              }
            }
          } catch (detailErr) {
            console.log(`Fetch failed for ${url}:`, detailErr);
          }
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const rawList: any[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.orders)
          ? json.orders
          : Array.isArray(json)
          ? json
          : Array.isArray(json.data?.orders)
          ? json.data.orders
          : [];

        if (rawList.length > 0) {
          setAllApiOrders(rawList);
          let targetIdx = 0;
          if (queryId) {
            const foundIdx = rawList.findIndex(
              (o) =>
                o.group_id === queryId ||
                o._id === queryId ||
                o.id === queryId ||
                o.orderId === queryId ||
                o.order_id === queryId ||
                o.purchase_id === queryId
            );
            if (foundIdx !== -1) targetIdx = foundIdx;
          }
          setCurrentOrderIndex(targetIdx);
          populateOrderFromData(rawList[targetIdx]);
        }
      }
    } catch (err) {
      console.error("Error fetching order details from API:", err);
    } finally {
      setLoadingOrder(false);
    }
  };

  useEffect(() => {
    void fetchOrderData();
  }, [queryId]);

  useEffect(() => {
    if (pdfLoadStarted.current) return;
    pdfLoadStarted.current = true;
    loadPdfLibs()
      .then(() => setPdfReady(true))
      .catch(() => setPdfReady(false));
  }, []);

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (showConfirmModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showConfirmModal]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const now = () =>
    new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const status: OrderStatus = cancelled
    ? "Cancelled"
    : shipped
    ? "Shipped"
    : packed
    ? "Packed"
    : confirmed
    ? "Confirmed"
    : "Pending";

  const openConfirmOrderModal = () => {
    const matchPincode =
      customerInfo.shippingAddress.match(/\b\d{6}\b/) || customerInfo.billingAddress.match(/\b\d{6}\b/);
    const detectedPincode = matchPincode ? matchPincode[0] : "";
    setPincodeInput(detectedPincode);

    const targetGroupId = rawGroupId || orderAmounts.groupId || queryId || "";
    setOrderGroupIdInput(targetGroupId);

    setAvailableCarriers([]);
    setSelectedCarrierId("");
    setDimensions({
      length: "",
      breadth: "",
      height: "",
      weight: "",
    });
    setModalError(null);

    setShowConfirmModal(true);
  };

  const checkDeliveryAvailability = async (pincodeToTest?: string) => {
    const pin = pincodeToTest || pincodeInput;
    if (!pin || pin.trim().length === 0) {
      setModalError("Please enter a valid 6-digit pincode.");
      return;
    }

    setCheckingDelivery(true);
    setModalError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sudhveda_token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const pinStr = pin.trim();

      const res = await fetch(`${API_BASE_URL}/api/order-service/checkdeliveryavailabilitybyadmin`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ pincode: pinStr }),
      });

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
          const firstArray = Object.values(resJson.data).find((val) => Array.isArray(val));
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
          const rate = item.rate ?? item.freight_charge ?? item.cost ?? item.rate_total ?? item.charge;
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
          setSelectedCarrierId(formatted[0].carrier_id);
        } else {
          setModalError("No delivery carriers available for this pincode.");
        }
      } else {
        const errMsg = resJson.message || resJson.error || "Failed to fetch delivery availability from server.";
        setModalError(`Server Error (${resJson.statusCode || resJson.error || 500}): ${errMsg}`);
        setAvailableCarriers([]);
      }
    } catch (err: any) {
      console.error("Delivery availability error:", err);
      setModalError(`Delivery availability error: ${err.message || "Failed to check delivery availability."}`);
      setAvailableCarriers([]);
    } finally {
      setCheckingDelivery(false);
    }
  };

  const handleCreateOrderByAdmin = async () => {
    if (!pincodeInput.trim()) {
      setModalError("Pincode is required.");
      return;
    }
    if (!selectedCarrierId) {
      setModalError("Please select an available carrier from the dropdown.");
      return;
    }
    if (!orderGroupIdInput.trim()) {
      setModalError("Order Group ID is required.");
      return;
    }

    setSubmittingOrder(true);
    setModalError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sudhveda_token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const payload = {
        ordergoupId: orderGroupIdInput.trim(),
        carrier_id: selectedCarrierId.trim(),
        length: Number(dimensions.length),
        breadth: Number(dimensions.breadth),
        height: Number(dimensions.height),
        weight: Number(dimensions.weight),
      };

      const res = await fetch(`${API_BASE_URL}/api/order-service/createorderbyadmin`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(payload),
      });

      const resJson = await res.json().catch(() => ({}));

      if (res.ok && resJson.success !== false) {
        showToast("Order created & confirmed successfully!");
        setConfirmed(true);
        setConfirmedAt(now());
        setShowConfirmModal(false);
      } else {
        setModalError(resJson.message || resJson.error || "Failed to create order by admin.");
      }
    } catch (err: any) {
      console.error("Create order by admin error:", err);
      setModalError(err.message || "Failed to submit order.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleConfirm = () => {
    openConfirmOrderModal();
  };
  const handlePack = () => {
    setPacked(true);
    setPackedAt(now());
    showToast("Order marked as packed.");
  };
  const handleShip = () => {
    setShipped(true);
    setShippedAt(now());
    showToast("Order marked as shipped.");
  };
  const handleCancel = () => {
    setCancelled(true);
    showToast("Order has been cancelled.");
  };

  const buildInvoiceDoc = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("Invoice", 40, 50);

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Order ${orderIdLabel}`, 40, 70);
    doc.text(`Status: ${status}`, 40, 84);
    doc.text(orderDateLabel, 40, 98);

    doc.text("Bill To:", 400, 70);
    const activeAddr = customerInfo.billingAddress || customerInfo.shippingAddress || "";
    const addrLines = activeAddr.split(",");
    let addrY = 98;
    addrLines.slice(0, 3).forEach((line) => {
      doc.text(line.trim(), 400, addrY);
      addrY += 14;
    });

    (doc as any).autoTable({
      startY: 140,
      head: [["Product", "Variant", "Qty", "Price", "Total"]],
      body: productList.map((p) => [
        p.name,
        p.variant,
        String(p.qty),
        `Rs ${p.price.toFixed(2)}`,
        `Rs ${(p.price * p.qty).toFixed(2)}`,
      ]),
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [217, 119, 6] },
      margin: { left: 40, right: 40 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    const rows: [string, string][] = [
      ["Subtotal", `Rs ${subtotal.toFixed(2)}`],
      ["Shipping charge", `Rs ${shipping.toFixed(2)}`],
      ["Discount", `- Rs ${discount.toFixed(2)}`],
      ["GST (5%)", `Rs ${gst.toFixed(2)}`],
      ["Grand total", `Rs ${grandTotal.toFixed(2)}`],
    ];
    let y = finalY;
    rows.forEach(([label, value], i) => {
      doc.setFont(undefined, i === rows.length - 1 ? "bold" : "normal");
      doc.setFontSize(i === rows.length - 1 ? 12 : 10);
      doc.text(label, 380, y);
      doc.text(value, 500, y);
      y += 18;
    });

    return doc;
  };

  const handlePrint = async () => {
    if (!pdfReady) {
      window.print();
      return;
    }
    const doc = buildInvoiceDoc();
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  };

  const handleDownload = async () => {
    if (!pdfReady) {
      showToast("Preparing PDF engine, try again in a moment.");
      return;
    }
    const doc = buildInvoiceDoc();
    doc.save(`Invoice-${orderIdLabel.replace("#", "")}.pdf`);
    showToast("Invoice downloaded.");
  };

  const goPrev = () => {
    if (allApiOrders.length > 0 && currentOrderIndex > 0) {
      const nextIdx = currentOrderIndex - 1;
      setCurrentOrderIndex(nextIdx);
      populateOrderFromData(allApiOrders[nextIdx]);
    }
  };

  const goNext = () => {
    if (allApiOrders.length > 0 && currentOrderIndex < allApiOrders.length - 1) {
      const nextIdx = currentOrderIndex + 1;
      setCurrentOrderIndex(nextIdx);
      populateOrderFromData(allApiOrders[nextIdx]);
    }
  };

  const timeline = [
    { label: "Order Placed", time: orderDateLabel.replace("Placed on ", ""), done: true },
    { label: "Payment Received", time: orderDateLabel.replace("Placed on ", ""), done: true },
    { label: "Order Confirmed", time: confirmedAt, done: confirmed },
    { label: "Packed", time: packedAt, done: packed },
    { label: "Shipped", time: shippedAt, done: shipped },
    { label: "Delivered", time: null, done: false },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto bg-[#f8f9fa] min-h-screen p-4 sm:p-8 font-sans text-slate-800">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-3">
        <span className="hover:text-slate-600 cursor-pointer">Orders</span>
        <ChevronRight size={12} />
        <span className="text-slate-800 font-semibold">Order Details</span>
      </div>

      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order {orderIdLabel}</h1>
            <span className={`px-3 py-0.5 rounded-full text-xs font-bold border transition-colors ${
              status === "Confirmed" || status === "Shipped" || status === "Packed"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : status === "Cancelled"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {status}
            </span>
            {loadingOrder && <Loader2 size={16} className="animate-spin text-orange-500" />}
          </div>
          <p className="text-xs text-slate-400 mt-1">{orderDateLabel}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={14} />
            Print Invoice
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={14} />
            Download Invoice
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6">
            <h2 className="flex items-center gap-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide mb-5">
              <User size={15} className="text-slate-400" />
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Account Details
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900 text-base">{customerInfo.name}</p>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle2 size={11} />
                    Verified
                  </span>
                </div>
                {customerInfo.phone && (
                  <p className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Phone size={12} className="text-slate-400" />
                    {customerInfo.phone}
                  </p>
                )}
                {customerInfo.email && (
                  <p className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <Mail size={12} className="text-slate-400" />
                    {customerInfo.email}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Shipping Address
                </p>
                {customerInfo.shippingName && (
                  <p className="font-bold text-slate-800 text-xs mb-0.5">
                    {customerInfo.shippingName} {customerInfo.shippingPhone ? `(${customerInfo.shippingPhone})` : ""}
                  </p>
                )}
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {customerInfo.shippingAddress}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Billing Address
                </p>
                {customerInfo.billingName && (
                  <p className="font-bold text-slate-800 text-xs mb-0.5">
                    {customerInfo.billingName} {customerInfo.billingPhone ? `(${customerInfo.billingPhone})` : ""}
                  </p>
                )}
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {customerInfo.billingAddress}
                </p>
              </div>
            </div>

            {customerInfo.customerNote && (
              <div className="mt-5 pt-4 border-t border-slate-100 bg-amber-50/60 rounded-xl p-3.5 border border-amber-200/50 flex items-start gap-2.5">
                <FileText size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Customer Note</p>
                  <p className="text-xs text-amber-900 font-medium italic mt-0.5">"{customerInfo.customerNote}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6">
            <h2 className="flex items-center gap-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide mb-5">
              <ClipboardList size={15} className="text-slate-400" />
              Order Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-6 text-xs">
              <div>
                <p className="text-slate-400 font-medium mb-1">Group ID</p>
                <p className="font-bold text-slate-900">{orderAmounts.groupId || orderIdLabel}</p>
              </div>
              {orderMetaData.subOrderId && (
                <div>
                  <p className="text-slate-400 font-medium mb-1">Order ID</p>
                  <p className="font-bold text-slate-900">{orderMetaData.subOrderId}</p>
                </div>
              )}
              <div>
                <p className="text-slate-400 font-medium mb-1">Payment Status</p>
                <span className="inline-flex items-center gap-1.5 font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {orderMetaData.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Payment Method</p>
                <p className="font-bold text-slate-900">{orderMetaData.paymentMethod}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Order Status</p>
                <span className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full text-[11px] border ${
                  confirmed || orderMetaData.orderStatus.toLowerCase().includes("confirm") || orderMetaData.orderStatus.toLowerCase().includes("ship") || orderMetaData.orderStatus.toLowerCase().includes("pack")
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : orderMetaData.orderStatus.toLowerCase().includes("cancel")
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {confirmed ? "Confirmed" : orderMetaData.orderStatus}
                </span>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Inventory Status</p>
                <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px]">
                  {orderMetaData.inventoryStatus}
                </span>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Order Date</p>
                <p className="font-bold text-slate-900">{orderDateLabel.replace("Placed on ", "")}</p>
              </div>
              {orderAmounts.totalWeight > 0 && (
                <div>
                  <p className="text-slate-400 font-medium mb-1">Total Weight</p>
                  <p className="font-bold text-slate-900">{orderAmounts.totalWeight}g</p>
                </div>
              )}
              <div>
                <p className="text-slate-400 font-medium mb-1">Total Amount</p>
                <p className="font-bold text-slate-900">
                  ₹{(orderAmounts.totalAmount > 0 ? orderAmounts.totalAmount : subtotal).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">COD Amount</p>
                <p className="font-bold text-slate-900">
                  ₹{orderAmounts.codAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Final Amount</p>
                <p className="font-bold text-slate-900">
                  ₹{(orderAmounts.finalAmount > 0 ? orderAmounts.finalAmount : grandTotal).toFixed(2)}
                </p>
              </div>
              {orderAmounts.totalSave > 0 && (
                <div>
                  <p className="text-slate-400 font-medium mb-1">Total Savings</p>
                  <p className="font-bold text-emerald-600">₹{orderAmounts.totalSave.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Products Ordered Card */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
            <h2 className="flex items-center gap-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide p-6 pb-4">
              <Box size={15} className="text-slate-400" />
              Products Ordered ({productList.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50/70 border-y border-slate-100 text-slate-400 font-semibold">
                    <th className="px-6 py-3 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 uppercase tracking-wider">Variant</th>
                    <th className="px-6 py-3 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productList.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-amber-50 shrink-0 border border-amber-100 shadow-sm"
                          />
                          <div className="min-w-0 flex items-center">
                            <p className="font-bold text-slate-800 text-sm leading-snug">{p.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                          {p.variant}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                        <span className="px-2 py-1 bg-orange-50 text-orange-600 font-bold text-xs rounded-md">
                          Qty: {p.qty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-xs">₹{p.price.toFixed(2)}</span>
                          {p.mrp && p.mrp > p.price ? (
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹{p.mrp.toFixed(2)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">
                            ₹{(p.price * p.qty).toFixed(2)}
                          </span>
                          {p.save && p.save > 0 ? (
                            <span className="text-[10px] font-semibold text-emerald-600">
                              Saved ₹{(p.save * p.qty).toFixed(2)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="flex items-center gap-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide mb-5">
                <FileText size={15} className="text-slate-400" />
                Price Summary
              </h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Amount</span>
                  <span className="font-semibold text-slate-800">
                    ₹{(orderAmounts.totalAmount > 0 ? orderAmounts.totalAmount : subtotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">COD Amount</span>
                  <span className="font-semibold text-amber-600">
                    ₹{orderAmounts.codAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-semibold text-emerald-600">-₹{discount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-baseline pt-4 border-t border-slate-100 mt-6">
              <span className="font-bold text-slate-900 text-sm">Final Amount</span>
              <span className="font-black text-slate-900 text-2xl tracking-tight">
                ₹{(orderAmounts.finalAmount > 0 ? orderAmounts.finalAmount : grandTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6">
            <h2 className="flex items-center gap-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide mb-5">
              <Zap size={15} className="text-slate-400" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                disabled={cancelled}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  cancelled
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-[#d97706] text-white hover:bg-[#b45309] cursor-pointer active:scale-[0.98]"
                }`}
              >
                <CheckCircle2 size={15} />
                {confirmed ? "Confirm / Dispatch Order" : "Confirm Order"}
              </button>

              <button
                onClick={handlePack}
                disabled={!confirmed || packed || cancelled}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  !confirmed || cancelled
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : packed
                    ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                    : "border-[#d97706]/30 text-[#d97706] hover:bg-amber-50/50"
                }`}
              >
                <Box size={15} />
                {packed ? "Order Packed" : "Pack Order"}
              </button>

              <button
                onClick={handleShip}
                disabled={!packed || shipped || cancelled}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  !packed || cancelled
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : shipped
                    ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                    : "border-[#d97706]/30 text-[#d97706] hover:bg-amber-50/50"
                }`}
              >
                <Truck size={15} />
                {shipped ? "Order Shipped" : "Ship Order"}
              </button>

              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#d97706]/30 text-[#d97706] text-xs font-bold hover:bg-amber-50/50 transition-all"
              >
                <PackageCheck size={15} />
                Generate Invoice
              </button>

              <button
                onClick={handleCancel}
                disabled={shipped || cancelled}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  shipped || cancelled
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : "border-red-200 text-red-500 hover:bg-red-50"
                }`}
              >
                <XCircle size={15} />
                {cancelled ? "Order Cancelled" : "Cancel Order"}
              </button>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6">
            <h2 className="flex items-center gap-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide mb-5">
              <Clock size={15} className="text-slate-400" />
              Order Timeline
            </h2>
            <div className="space-y-4">
              {timeline.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  {step.done ? (
                    <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50 shrink-0 mt-0.5" />
                  ) : (
                    <Circle size={16} className="text-slate-200 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 flex items-center justify-between text-xs">
                    <span className={`font-semibold ${step.done ? "text-slate-800" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {step.time ?? "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white rounded-2xl border border-slate-100/80 shadow-sm px-6 py-4">
        <button
          onClick={goPrev}
          disabled={allApiOrders.length === 0 || currentOrderIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
            allApiOrders.length === 0 || currentOrderIndex === 0
              ? "border-slate-100 text-slate-300 cursor-not-allowed"
              : "border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          }`}
        >
          <ArrowLeft size={14} />
          Previous Order
        </button>

        <p className="text-xs font-medium text-slate-400 order-first sm:order-none">
          <span className="font-bold text-slate-800">
            {allApiOrders.length > 0 ? currentOrderIndex + 1 : 1}
          </span>{" "}
          of {allApiOrders.length || 1} Orders
        </p>

        <button
          onClick={goNext}
          disabled={allApiOrders.length === 0 || currentOrderIndex >= allApiOrders.length - 1}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            allApiOrders.length === 0 || currentOrderIndex >= allApiOrders.length - 1
              ? "bg-slate-100 text-slate-300 cursor-not-allowed"
              : "bg-[#d97706] text-white hover:bg-[#b45309]"
          }`}
        >
          Next Order
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Confirm Order & Check Delivery Availability Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              <div className="flex items-center gap-2.5">
                <Truck size={20} className="text-amber-100" />
                <div>
                  <h3 className="font-bold text-base leading-tight">Confirm & Create Order</h3>
                  <p className="text-xs text-amber-100/90 font-medium">Verify pincode and assign shipping carrier</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {modalError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p className="font-semibold leading-normal">{modalError}</p>
                </div>
              )}

              {/* Order Product Preview Card */}
              {productList.length > 0 && (
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200/50">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Box size={14} className="text-amber-600" />
                      Ordered Products ({productList.length})
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      Total: ₹{(orderAmounts.finalAmount > 0 ? orderAmounts.finalAmount : subtotal).toFixed(2)}
                    </span>
                  </div>
                  <div className="divide-y divide-amber-200/50">
                    {productList.map((p, i) => (
                      <div key={i} className="flex items-start gap-3 pt-2.5 first:pt-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover bg-white shrink-0 border border-amber-200 shadow-sm"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="font-bold text-slate-900 text-xs leading-snug">{p.name}</p>
                          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 pt-0.5">
                            <span className="bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-700">
                              {p.variant}
                            </span>
                            <span>•</span>
                            <span className="text-orange-600 font-bold bg-orange-50 px-1.5 py-0.2 rounded">
                              Qty: {p.qty}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-slate-900">₹{(p.price * p.qty).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Group ID */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Order Group ID (<code className="text-orange-600">ordergoupId</code>)
                </label>
                <input
                  type="text"
                  value={orderGroupIdInput}
                  onChange={(e) => setOrderGroupIdInput(e.target.value)}
                  placeholder="e.g. 6a89901e96dc866c22bd6394"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 font-mono text-xs font-bold text-slate-800 outline-none transition-all"
                />
              </div>

              {/* Delivery Pincode */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Delivery Pincode
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin size={15} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value)}
                      placeholder="Enter 6-digit Pincode"
                      maxLength={6}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 font-semibold text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => checkDeliveryAvailability()}
                    disabled={checkingDelivery || !pincodeInput.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 text-white font-bold rounded-xl transition-all shadow-sm shrink-0"
                  >
                    {checkingDelivery ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "Check Availability"
                    )}
                  </button>
                </div>
              </div>

              {/* Available Carriers Custom Dropdown */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Available Carriers / Couriers ({availableCarriers.length})
                </label>
                <div className="relative" ref={carrierDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      if (availableCarriers.length > 0) {
                        setIsCarrierDropdownOpen((prev) => !prev);
                      }
                    }}
                    disabled={checkingDelivery || availableCarriers.length === 0}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-amber-500 font-semibold text-xs text-slate-800 outline-none transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs hover:border-amber-400 disabled:bg-slate-50 disabled:cursor-not-allowed text-left"
                  >
                    <span className="truncate">
                      {availableCarriers.length === 0
                        ? checkingDelivery
                          ? "Checking availability..."
                          : "-- Check Pincode to view carriers --"
                        : availableCarriers.find((c) => c.carrier_id === selectedCarrierId)
                            ?.display_title || "Select Carrier"}
                    </span>
                    <ChevronDown
                      size={15}
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                        isCarrierDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Downward Popover Menu - closes immediately on select */}
                  {isCarrierDropdownOpen && availableCarriers.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-amber-300 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto p-1 divide-y divide-slate-100">
                      {availableCarriers.map((c) => {
                        const isSelected = selectedCarrierId === c.carrier_id;
                        return (
                          <button
                            key={c.carrier_id}
                            type="button"
                            onClick={() => {
                              setSelectedCarrierId(c.carrier_id);
                              setIsCarrierDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-amber-100/80 text-amber-950 font-bold"
                                : "hover:bg-amber-50 text-slate-700"
                            }`}
                          >
                            <span className="truncate pr-2">
                              {c.display_title} (ID: {c.carrier_id})
                            </span>
                            {isSelected && (
                              <Check size={14} className="text-amber-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Package Dimensions & Weight */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Package Dimensions & Weight
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 block mb-1">Length (cm)</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="Length"
                      value={dimensions.length}
                      onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-center font-bold text-slate-800 text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 block mb-1">Breadth (cm)</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="Breadth"
                      value={dimensions.breadth}
                      onChange={(e) => setDimensions({ ...dimensions, breadth: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-center font-bold text-slate-800 text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 block mb-1">Height (cm)</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="Height"
                      value={dimensions.height}
                      onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-center font-bold text-slate-800 text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 block mb-1">Weight (kg)</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="Weight"
                      value={dimensions.weight}
                      onChange={(e) => setDimensions({ ...dimensions, weight: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-center font-bold text-slate-800 text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition-all text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateOrderByAdmin}
                disabled={submittingOrder || !selectedCarrierId || !orderGroupIdInput.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md text-xs"
              >
                {submittingOrder ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Submitting Order...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Confirm & Create Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}