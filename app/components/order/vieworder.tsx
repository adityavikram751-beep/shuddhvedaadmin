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

type OrderStatus = "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";

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
  orderId?: string;
  orderStatus?: string;
  isCancelled?: boolean;
}

const defaultProducts: Product[] = [

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

  const [orderIdLabel, setOrderIdLabel] = useState<string>("");
  const [orderDateLabel, setOrderDateLabel] = useState<string>("");
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
    name: "",
    phone: "",
    email: "",
    shippingName: "",
    shippingPhone: "",
    shippingAddress: "",
    billingName: "",
    billingPhone: "",
    billingAddress: "",
    customerNote: "",
  });

  const [orderAmounts, setOrderAmounts] = useState<{
    groupId: string;
    totalAmount: number;
    finalAmount: number;
    originalTotalAmount?: number;
    originalFinalAmount?: number;
    codAmount: number;
    couponDiscount: number;
    totalSave: number;
    totalWeight: number;
  }>({
    groupId: "",
    totalAmount: 0,
    finalAmount: 0,
    originalTotalAmount: 0,
    originalFinalAmount: 0,
    codAmount: 0,
    couponDiscount: 0,
    totalSave: 0,
    totalWeight: 0,
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
    subOrderId: "",
    paymentStatus: "",
    paymentMethod: "",
    orderStatus: "",
    inventoryStatus: "",
    trackingNumber: "",
    deliveryMethod: "Standard Delivery",
    deliveryPartner: "",
    deliveryCharge: 0,
    estimatedDelivery: "",
  });

  const [productList, setProductList] = useState<Product[]>([]);
  const [orderCounts, setOrderCounts] = useState<{
    total: number;
    active: number;
    cancelled: number;
  }>({
    total: 0,
    active: 0,
    cancelled: 0,
  });

  const [confirmed, setConfirmed] = useState(false);
  const [packed, setPacked] = useState(false);
  const [shipped, setShipped] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [packedAt, setPackedAt] = useState<string | null>(null);
  const [shippedAt, setShippedAt] = useState<string | null>(null);
  const [deliveredAt, setDeliveredAt] = useState<string | null>(null);
  const [cancelledAt, setCancelledAt] = useState<string | null>(null);
  const [paymentTimeState, setPaymentTimeState] = useState<string | null>(null);

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
  const activeSubtotal = productList.reduce(
    (s, p) => (!p.isCancelled && !p.orderStatus?.toLowerCase().includes("cancel") ? s + p.price * p.qty : s),
    0
  );
  const hasCancelledItem = productList.some(
    (p) => p.isCancelled || p.orderStatus?.toLowerCase().includes("cancel")
  );
  const isMultipleProducts = productList.length > 1;
  const shipping = orderMetaData.deliveryCharge || 0;
  const discount = orderAmounts.couponDiscount || 0;
  const grandTotal =
    orderAmounts.finalAmount > 0
      ? orderAmounts.finalAmount
      : hasCancelledItem && isMultipleProducts && activeSubtotal > 0
      ? activeSubtotal
      : activeSubtotal > 0
      ? activeSubtotal
      : subtotal;

  const populateOrderFromData = (rawItem: any) => {
    if (!rawItem) return;

    let item = rawItem;
    if (item.order && typeof item.order === "object" && !Array.isArray(item.order)) {
      item = item.order;
    } else if (item.data && typeof item.data === "object" && !Array.isArray(item.data)) {
      item = item.data;
    }

    const activeOrders = Array.isArray(item.activeOrders) ? item.activeOrders : [];
    const cancelledOrders = Array.isArray(item.cancelledOrders) ? item.cancelledOrders : [];

    let ordersList: any[] = [];
    if (Array.isArray(item.orders) && item.orders.length > 0) {
      ordersList = item.orders;
    } else if (activeOrders.length > 0 || cancelledOrders.length > 0) {
      ordersList = [...activeOrders, ...cancelledOrders];
    }

    const firstOrder = activeOrders[0] || ordersList[0] || {};

    const totCount = Number(item.totalOrderCount ?? ordersList.length);
    const actCount = Number(item.activeOrderCount ?? activeOrders.length);
    const canCount = Number(item.cancelledOrderCount ?? cancelledOrders.length);
    setOrderCounts({
      total: totCount,
      active: actCount,
      cancelled: canCount,
    });

    const displayId =
      item.group_id ||
      item.groupId ||
      firstOrder.order_id ||
      item.orderId ||
      item.order_id ||
      (item._id ? `#ORD-${item._id.slice(-5).toUpperCase()}` : "");
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
      : "";
    setOrderDateLabel(dateStr ? `Placed on ${dateStr}` : "");

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

    if (!name) name = email ? email.split("@")[0] : phone ? `Customer (${phone.slice(-4)})` : "";

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

    const payMode = (item.payment_mode || firstOrder.payment_mode || item.payment_method || item.payment?.method || "COD").toUpperCase();
    const payStatusRaw = String(item.payment_status || firstOrder.payment_status || item.payment?.status || "pending").toLowerCase();

    const isCod = payMode === "COD" || String(payMode).toLowerCase() === "cod";
    const isPaidOrUpi = payStatusRaw === "paid" || payStatusRaw === "success" || payMode === "UPI" || payMode === "NETBANKING" || String(payMode).toLowerCase() === "upi";

    const cAmt = Number(item.cod_amount ?? item.codAmount ?? firstOrder.cod_amount ?? og.cod_amount ?? 0);

    const couponObj = item.coupon || firstOrder.coupon || null;
    const couponDisc = Number(couponObj?.discountAmount ?? item.couponDiscount ?? item.coupon_discount ?? 0);
    let totalSave = Number(item.totalsave ?? item.total_save ?? item.totalSave ?? 0);
    let weight = Number(item.totalWeight ?? item.total_weight ?? item.weight ?? 0);

    // Parse products list
    let rawProds: any[] = [];
    if (ordersList.length > 0) {
      rawProds = ordersList.flatMap((o: any) => {
        const isCancelledOrder =
          cancelledOrders.some((co: any) => (co._id && co._id === o._id) || (co.order_id && co.order_id === o.order_id)) ||
          String(o.order_status || "").toLowerCase().includes("cancel");
        const orderStatusStr = o.order_status || (isCancelledOrder ? "cancelled" : "processing");
        const orderIdStr = o.order_id || "";

        const itemsArr = Array.isArray(o.items)
          ? o.items
          : Array.isArray(o.products)
            ? o.products
            : Array.isArray(o.order_items)
              ? o.order_items
              : [];

        return itemsArr.map((it: any) => ({
          ...it,
          _parentOrderId: orderIdStr,
          _parentOrderStatus: orderStatusStr,
          _parentIsCancelled: isCancelledOrder,
        }));
      });
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

    let parsedProds: Product[] = [];
    if (rawProds.length > 0) {
      let weightSum = 0;
      let saveSum = 0;
      parsedProds = rawProds.map((p: any) => {
        const pd = p.product_details || {};
        const prod = pd.product || p.product || p;
        const variant = prod.variant || pd.variant || {};

        const pName =
          prod.product_name ||
          prod.name ||
          p.name ||
          "";

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
          "";
        if (typeof image === "object" && image) {
          image = image.image_url || image.url || "";
        }

        const itemOrderStatus =
          p._parentOrderStatus ||
          p.order_status ||
          p.status ||
          firstOrder.order_status ||
          item.order_status ||
          "processing";

        const isItemCancelled =
          Boolean(p._parentIsCancelled) ||
          String(itemOrderStatus).toLowerCase().includes("cancel") ||
          Boolean(p.cancelled || p.isCancelled);

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
          orderId: p._parentOrderId || firstOrder.order_id || "",
          orderStatus: itemOrderStatus,
          isCancelled: isItemCancelled,
        };
      });
      setProductList(parsedProds);

      if (weightSum > 0) weight = weightSum;
      if (saveSum > 0) totalSave = saveSum;
    }

    const allProdsTotal = parsedProds.reduce((sum, p) => sum + p.price * p.qty, 0);
    const activeProds = parsedProds.filter(
      (p) => !p.isCancelled && !p.orderStatus?.toLowerCase().includes("cancel")
    );
    const cancelledProds = parsedProds.filter(
      (p) => p.isCancelled || p.orderStatus?.toLowerCase().includes("cancel")
    );
    const activeProdsTotal = activeProds.reduce((sum, p) => sum + p.price * p.qty, 0);

    const isSingleProdOrder = (parsedProds.length === 1 || (parsedProds.length === 0 && totCount <= 1 && ordersList.length <= 1));
    const isMultipleWithCancellation =
      (parsedProds.length > 1 || totCount > 1 || ordersList.length > 1) &&
      (cancelledProds.length > 0 || canCount > 0);

    const rawOrigFAmt = Number(
      item.original_finalAmount ??
      item.originalFinalAmount ??
      item.finalAmount ??
      firstOrder.finalAmount ??
      item.final_amount ??
      firstOrder.final_amount ??
      og.finalAmount ??
      item.totalAmount ??
      firstOrder.totalAmount ??
      og.totalAmount ??
      item.total_amount ??
      firstOrder.total_amount ??
      og.total_amount ??
      item.amount ??
      firstOrder.amount ??
      item.grandTotal ??
      firstOrder.grandTotal ??
      allProdsTotal ??
      0
    );

    const rawFAmt = Number(
      item.finalAmount ??
      firstOrder.finalAmount ??
      item.final_amount ??
      firstOrder.final_amount ??
      og.finalAmount ??
      item.totalAmount ??
      firstOrder.totalAmount ??
      og.totalAmount ??
      item.total_amount ??
      firstOrder.total_amount ??
      og.total_amount ??
      item.amount ??
      firstOrder.amount ??
      item.grandTotal ??
      firstOrder.grandTotal ??
      rawOrigFAmt ??
      allProdsTotal ??
      0
    );

    const rawRemFAmt =
      item.remaining_amount !== undefined && item.remaining_amount !== null
        ? Number(item.remaining_amount)
        : item.remainingAmount !== undefined && item.remainingAmount !== null
        ? Number(item.remainingAmount)
        : firstOrder.remaining_amount !== undefined && firstOrder.remaining_amount !== null
        ? Number(firstOrder.remaining_amount)
        : firstOrder.remainingAmount !== undefined && firstOrder.remainingAmount !== null
        ? Number(firstOrder.remainingAmount)
        : undefined;

    const rawOrigTAmt = Number(
      item.original_totalAmount ??
      item.originalTotalAmount ??
      item.totalAmount ??
      firstOrder.totalAmount ??
      item.total_amount ??
      firstOrder.total_amount ??
      og.totalAmount ??
      allProdsTotal ??
      rawOrigFAmt
    );

    const rawTAmt = Number(
      item.totalAmount ??
      firstOrder.totalAmount ??
      item.total_amount ??
      firstOrder.total_amount ??
      og.totalAmount ??
      allProdsTotal ??
      rawFAmt ??
      rawOrigTAmt
    );

    let fAmt = 0;
    let tAmt = 0;

    if (isSingleProdOrder) {
      // Single product: ALWAYS show single product final amount (e.g. 449). Never 531, never remaining amount!
      fAmt = rawFAmt > 0 ? rawFAmt : (allProdsTotal > 0 ? allProdsTotal : rawOrigFAmt);
      tAmt = rawTAmt > 0 ? rawTAmt : (allProdsTotal > 0 ? allProdsTotal : rawOrigTAmt);
    } else if (isMultipleWithCancellation) {
      // Multiple products (e.g. 2 items) where 1 is cancelled and 1 is confirmed:
      // In paid orders (isPaidOrUpi), show the remaining amount of the confirmed product!
      const computedRemAmount =
        rawRemFAmt !== undefined && rawRemFAmt > 0
          ? rawRemFAmt
          : activeProdsTotal > 0
          ? activeProdsTotal
          : rawFAmt;

      if (isPaidOrUpi) {
        fAmt = computedRemAmount;
        tAmt = computedRemAmount;
      } else if (isCod) {
        fAmt = computedRemAmount;
        tAmt = rawTAmt > 0 ? rawTAmt : rawOrigTAmt;
      } else {
        fAmt = computedRemAmount;
        tAmt = computedRemAmount;
      }
    } else {
      // Multiple products, none cancelled
      if (isCod) {
        fAmt = rawOrigFAmt > 0 ? rawOrigFAmt : rawFAmt;
        tAmt = rawTAmt > 0 ? rawTAmt : rawOrigTAmt;
      } else {
        fAmt = rawFAmt > 0 ? rawFAmt : (allProdsTotal > 0 ? allProdsTotal : rawOrigFAmt);
        tAmt = rawTAmt > 0 ? rawTAmt : (allProdsTotal > 0 ? allProdsTotal : rawOrigTAmt);
      }
    }

    setOrderAmounts({
      groupId,
      totalAmount: tAmt,
      finalAmount: fAmt,
      originalTotalAmount: rawOrigTAmt,
      originalFinalAmount: rawOrigFAmt,
      codAmount: cAmt,
      couponDiscount: couponDisc,
      totalSave: totalSave,
      totalWeight: weight,
    });

    // Order Meta
    const subOrderId = firstOrder.order_id || item.order_id || "";

    // Find all possible status fields from API response
    const allPossibleStatuses = [
      item.delivery_status,
      item.deliveryStatus,
      firstOrder.delivery_status,
      firstOrder.deliveryStatus,
      item.shipment_status,
      firstOrder.shipment_status,
      item.shipping_status,
      firstOrder.shipping_status,
      item.courier_status,
      firstOrder.courier_status,
      item.tracking_status,
      firstOrder.tracking_status,
      item.order_status,
      item.orderStatus,
      firstOrder.order_status,
      firstOrder.orderStatus,
      item.status,
      firstOrder.status,
      og.delivery_status,
      og.order_status,
      og.status,
    ]
      .filter((s) => s !== null && s !== undefined && String(s).trim().length > 0)
      .map((s) => String(s).trim());

    // Prefer specific/advanced statuses (like Ready_for_pickup, Shipped, etc.) over generic "pending" or "processing"
    const nonPending = allPossibleStatuses.find((s) => {
      const low = s.toLowerCase();
      return low !== "pending" && low !== "processing" && low !== "process";
    });

    const ordStatus = nonPending || allPossibleStatuses[0] || "processing";
    const invStatus = firstOrder.inventory_status || item.inventory_status || "reserved";
    const payStatus = item.payment_status || firstOrder.payment_status || item.payment?.status || "pending";
    const payMethod = (item.payment_mode || firstOrder.payment_mode || item.payment_method || item.payment?.method || "COD").toUpperCase();
    const tracking = item.trackingNumber || firstOrder.trackingNumber || item.tracking_number || "";
    const courier = item.courier || firstOrder.courier || item.delivery_partner || "";
    const shippingCharge = Number(item.shipping_charge || item.shippingCharge || 0);

    setOrderMetaData({
      subOrderId,
      paymentStatus: payStatus.charAt(0).toUpperCase() + payStatus.slice(1).toLowerCase(),
      paymentMethod: payMethod,
      orderStatus: ordStatus,
      inventoryStatus: invStatus.charAt(0).toUpperCase() + invStatus.slice(1).toLowerCase(),
      trackingNumber: tracking,
      deliveryMethod: "Standard Delivery",
      deliveryPartner: courier,
      deliveryCharge: shippingCharge,
      estimatedDelivery: "3-5 Business Days",
    });

    // Status & Timeline synchronization from API data
    const localConfirmedList: string[] = typeof window !== "undefined" ? (() => {
      try {
        const raw = localStorage.getItem("sudhveda_confirmed_orders");
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })() : [];

    const localConfirmedTimes: Record<string, string> = typeof window !== "undefined" ? (() => {
      try {
        const raw = localStorage.getItem("sudhveda_confirmed_times");
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    })() : {};

    const isConfirmedFromLocal = [
      displayId,
      groupId,
      mongoId,
      item._id,
      item.group_id,
      item.groupId,
      firstOrder.order_id,
    ].some((id) => id && localConfirmedList.includes(String(id)));

    let savedConfirmedTime: string | null = null;
    for (const id of [displayId, groupId, mongoId, item._id, item.group_id, item.groupId, firstOrder.order_id]) {
      if (id && localConfirmedTimes[String(id)]) {
        savedConfirmedTime = localConfirmedTimes[String(id)];
        break;
      }
    }

    const hasCarrierOrTracking = Boolean(
      item.carrier_id ||
      item.carrierId ||
      firstOrder.carrier_id ||
      firstOrder.carrierId ||
      og.carrier_id ||
      og.carrierId ||
      item.courier ||
      firstOrder.courier ||
      item.delivery_partner ||
      item.tracking_number ||
      item.trackingNumber ||
      firstOrder.tracking_number ||
      firstOrder.trackingNumber ||
      item.awb ||
      firstOrder.awb
    );

    const allStatuses = allPossibleStatuses.map((s) => s.toLowerCase());

    const hasStatus = (...keywords: string[]) =>
      allStatuses.some((s) => keywords.some((kw) => s.includes(kw)));

    const isCancelledOrder =
      (hasStatus("cancel", "reject", "refund") && activeOrders.length === 0) ||
      item.cancelled === true ||
      firstOrder.cancelled === true;

    const isDeliveredOrder =
      hasStatus("deliver", "completed") ||
      item.delivered === true ||
      firstOrder.delivered === true;

    const isShippedOrder =
      isDeliveredOrder ||
      hasStatus("ship", "dispatch", "transit", "out for delivery", "in_transit", "out_for_delivery") ||
      Boolean(tracking || item.awb || firstOrder.awb);

    const isPackedOrder =
      isShippedOrder ||
      hasStatus("pack", "manifest", "ready_to_ship", "ready to ship", "in packing", "pickup", "ready_for_pickup", "ready_to_pickup", "ready") ||
      item.isPacked === true;

    const isConfirmedOrder =
      isPackedOrder ||
      isShippedOrder ||
      isDeliveredOrder ||
      hasStatus("confirm", "accept", "verified", "pickup", "ready") ||
      item.isConfirmed === true ||
      item.is_confirmed === true ||
      item.confirmed === true ||
      firstOrder.confirmed === true ||
      firstOrder.isConfirmed === true ||
      hasCarrierOrTracking ||
      isConfirmedFromLocal;

    const parseTime = (dateVal: any): string | null => {
      if (!dateVal) return null;
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return null;
      return `${d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} • ${d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    };

    const apiPlacedTime =
      parseTime(item.createdAt || firstOrder.createdAt || item.date || item.orderDate) ||
      dateStr ||
      null;

    const apiUpdatedTime = parseTime(item.updatedAt || firstOrder.updatedAt) || null;

    const apiPaymentTime =
      parseTime(item.payment_time || item.paymentDate || firstOrder.payment_time || item.paidAt || firstOrder.paidAt || item.payment?.created_at) ||
      apiPlacedTime;

    const apiConfirmedTime =
      parseTime(item.confirmedAt || item.confirmed_at || firstOrder.confirmed_at || item.order_confirmed_at || item.confirmedDate) ||
      savedConfirmedTime ||
      (isConfirmedOrder ? apiUpdatedTime || apiPlacedTime : null);

    const apiPackedTime =
      parseTime(item.packedAt || item.packed_at || firstOrder.packed_at || item.order_packed_at || item.packedDate) ||
      (isPackedOrder ? apiUpdatedTime || apiConfirmedTime : null);

    const apiShippedTime =
      parseTime(item.shippedAt || item.shipped_at || firstOrder.shipped_at || item.order_shipped_at || item.shippedDate || item.dispatchedAt || item.dispatched_at) ||
      (isShippedOrder ? apiUpdatedTime || apiPackedTime : null);

    const apiDeliveredTime =
      parseTime(item.deliveredAt || item.delivered_at || firstOrder.delivered_at || item.order_delivered_at || item.deliveredDate) ||
      (isDeliveredOrder ? apiUpdatedTime : null);

    const apiCancelledTime =
      parseTime(item.cancelledAt || item.cancelled_at || firstOrder.cancelled_at || item.order_cancelled_at) ||
      (isCancelledOrder ? apiUpdatedTime : null);

    setCancelled(isCancelledOrder);
    setDelivered(isDeliveredOrder && !isCancelledOrder);
    setShipped(isShippedOrder && !isCancelledOrder);
    setPacked(isPackedOrder && !isCancelledOrder);
    setConfirmed(isConfirmedOrder && !isCancelledOrder);

    setConfirmedAt(apiConfirmedTime);
    setPackedAt(apiPackedTime);
    setShippedAt(apiShippedTime);
    setDeliveredAt(apiDeliveredTime);
    setCancelledAt(apiCancelledTime);
    setPaymentTimeState(apiPaymentTime);
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
    : delivered
      ? "Delivered"
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
        const nowStr = now();
        setConfirmed(true);
        setConfirmedAt(nowStr);
        setOrderMetaData((prev) => ({
          ...prev,
          orderStatus: "Confirmed",
        }));
        setShowConfirmModal(false);

        try {
          const idsToSave = [
            orderGroupIdInput.trim(),
            rawGroupId,
            orderAmounts.groupId,
            queryId,
            orderIdLabel,
          ].filter(Boolean);
          const raw = localStorage.getItem("sudhveda_confirmed_orders");
          const arr: string[] = raw ? JSON.parse(raw) : [];
          idsToSave.forEach((id) => {
            if (id && !arr.includes(String(id))) arr.push(String(id));
          });
          localStorage.setItem("sudhveda_confirmed_orders", JSON.stringify(arr));

          const rawTimes = localStorage.getItem("sudhveda_confirmed_times");
          const timesMap: Record<string, string> = rawTimes ? JSON.parse(rawTimes) : {};
          idsToSave.forEach((id) => {
            if (id && !timesMap[String(id)]) timesMap[String(id)] = nowStr;
          });
          localStorage.setItem("sudhveda_confirmed_times", JSON.stringify(timesMap));
        } catch {}
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

    // 1. Identify active products (only print active items shown on screen)
    const activeProducts = productList.filter(
      (p) => !p.isCancelled && !p.orderStatus?.toLowerCase().includes("cancel")
    );
    const invoiceProducts = activeProducts.length > 0 ? activeProducts : productList;
    const activeSubtotal = invoiceProducts.reduce((sum, p) => sum + p.price * p.qty, 0);

    const dispTotal = orderAmounts.totalAmount > 0 ? orderAmounts.totalAmount : activeSubtotal;
    const dispCod = orderAmounts.codAmount;
    const dispDiscount = orderAmounts.couponDiscount > 0 ? orderAmounts.couponDiscount : discount;
    const dispSave = orderAmounts.totalSave;
    const dispFinal = orderAmounts.finalAmount > 0 ? orderAmounts.finalAmount : (grandTotal > 0 ? grandTotal : dispTotal);
    const currentStatus = confirmed ? "Confirmed" : (orderMetaData.orderStatus || status || "Pending");

    // Brand accent banner
    doc.setFillColor(217, 119, 6);
    doc.rect(0, 0, 595.28, 8, "F");

    // Company Name / Branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(217, 119, 6);
    doc.text("SHUDDHVEDA", 40, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Pure & Natural Products", 40, 62);

    // Invoice Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("TAX INVOICE", 555, 48, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Invoice #${(orderIdLabel || "ORD").replace(/^#/, "")}`, 555, 62, { align: "right" });

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(40, 74, 555, 74);

    // Left Column: Order Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(217, 119, 6);
    doc.text("ORDER DETAILS", 40, 92);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    let leftY = 107;
    doc.text(`Order ID: ${orderIdLabel}`, 40, leftY);
    leftY += 14;
    if (orderAmounts.groupId && orderAmounts.groupId !== orderIdLabel) {
      doc.text(`Group ID: ${orderAmounts.groupId}`, 40, leftY);
      leftY += 14;
    }
    const cleanDate = orderDateLabel.replace("Placed on ", "").trim();
    if (cleanDate) {
      doc.text(`Order Date: ${cleanDate}`, 40, leftY);
      leftY += 14;
    }
    doc.text(`Order Status: ${currentStatus}`, 40, leftY);
    leftY += 14;
    doc.text(`Payment Mode: ${orderMetaData.paymentMethod || "COD"}`, 40, leftY);
    leftY += 14;
    doc.text(`Payment Status: ${orderMetaData.paymentStatus || "Pending"}`, 40, leftY);
    leftY += 14;

    // Right Column: Customer & Shipping Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(217, 119, 6);
    doc.text("CUSTOMER & SHIPPING DETAILS", 330, 92);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    let rightY = 107;
    const custName = customerInfo.shippingName || customerInfo.name || "Customer";
    doc.setFont("helvetica", "bold");
    doc.text(custName, 330, rightY);
    doc.setFont("helvetica", "normal");
    rightY += 14;

    const custPhone = customerInfo.shippingPhone || customerInfo.phone;
    if (custPhone) {
      doc.text(`Phone: ${custPhone}`, 330, rightY);
      rightY += 14;
    }
    if (customerInfo.email) {
      doc.text(`Email: ${customerInfo.email}`, 330, rightY);
      rightY += 14;
    }

    const shipAddr = customerInfo.shippingAddress && customerInfo.shippingAddress !== "-"
      ? customerInfo.shippingAddress
      : customerInfo.billingAddress && customerInfo.billingAddress !== "-"
      ? customerInfo.billingAddress
      : "";

    if (shipAddr) {
      const splitAddr: string[] = doc.splitTextToSize(`Address: ${shipAddr}`, 225);
      splitAddr.slice(0, 3).forEach((line: string) => {
        doc.text(line, 330, rightY);
        rightY += 13;
      });
    }

    const tableStartY = Math.max(leftY, rightY) + 16;

    (doc as any).autoTable({
      startY: tableStartY,
      head: [["#", "Product Name", "Variant", "Qty", "Price", "Total"]],
      body: invoiceProducts.map((p, idx) => [
        String(idx + 1),
        p.name,
        p.variant || "-",
        String(p.qty),
        `Rs. ${p.price.toFixed(2)}`,
        `Rs. ${(p.price * p.qty).toFixed(2)}`,
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 7,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [217, 119, 6],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 25, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 65, halign: "center" },
        3: { cellWidth: 40, halign: "center" },
        4: { cellWidth: 75, halign: "right" },
        5: { cellWidth: 80, halign: "right" },
      },
      margin: { left: 40, right: 40 },
    });

    let finalY = (doc as any).lastAutoTable.finalY + 16;
    if (finalY > 720) {
      doc.addPage();
      finalY = 50;
    }

    const summaryRows: [string, string, boolean][] = [
      ["Total Amount", `Rs. ${dispTotal.toFixed(2)}`, false],
    ];

    if (dispCod > 0 || String(orderMetaData.paymentMethod).toUpperCase() === "COD") {
      summaryRows.push(["COD Amount", `Rs. ${dispCod.toFixed(2)}`, false]);
    }
    if (dispDiscount > 0) {
      summaryRows.push(["Discount", `- Rs. ${dispDiscount.toFixed(2)}`, false]);
    }
    if (dispSave > 0) {
      summaryRows.push(["Total Savings", `Rs. ${dispSave.toFixed(2)}`, false]);
    }
    summaryRows.push([
      "Final Amount",
      `Rs. ${dispFinal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      true,
    ]);

    // Draw Price Summary Card on the right
    const summaryWidth = 220;
    const summaryX = 555 - summaryWidth;
    const rowHeight = 20;
    const boxHeight = summaryRows.length * rowHeight + 12;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(summaryX, finalY, summaryWidth, boxHeight, 4, 4, "FD");

    let currY = finalY + 16;
    summaryRows.forEach(([label, val, isBold]) => {
      if (isBold) {
        doc.setDrawColor(226, 232, 240);
        doc.line(summaryX + 8, currY - 6, summaryX + summaryWidth - 8, currY - 6);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(label, summaryX + 12, currY + 2);
        doc.text(val, summaryX + summaryWidth - 12, currY + 2, { align: "right" });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(label, summaryX + 12, currY);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(val, summaryX + summaryWidth - 12, currY, { align: "right" });
      }
      currY += rowHeight;
    });

    if (customerInfo.customerNote) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      const noteLines: string[] = doc.splitTextToSize(`Note: "${customerInfo.customerNote}"`, 240);
      let noteY = finalY + 14;
      noteLines.forEach((nLine: string) => {
        doc.text(nLine, 40, noteY);
        noteY += 12;
      });
    }

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "Thank you for shopping with Shuddhveda! | Computer generated invoice",
        297.64,
        820,
        { align: "center" }
      );
    }

    return doc;
  };

  const handlePrint = async () => {
    if (!pdfReady) {
      window.print();
      return;
    }
    try {
      const doc = buildInvoiceDoc();
      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank");
    } catch (err) {
      console.error("Print invoice error:", err);
      window.print();
    }
  };

  const handleDownload = async () => {
    if (!pdfReady) {
      showToast("Preparing PDF engine, try again in a moment.");
      return;
    }
    try {
      const doc = buildInvoiceDoc();
      const safeId = (orderIdLabel || orderAmounts.groupId || "order").replace(/[^a-zA-Z0-9-_]/g, "_");
      doc.save(`Invoice-${safeId}.pdf`);
      showToast("Invoice generated & downloaded.");
    } catch (err: any) {
      console.error("Generate invoice error:", err);
      showToast("Failed to generate invoice.");
    }
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

  const isCod = String(orderMetaData.paymentMethod).toUpperCase() === "COD";
  const isPaid =
    orderMetaData.paymentStatus.toLowerCase() === "paid" ||
    orderMetaData.paymentStatus.toLowerCase() === "success" ||
    (!isCod && orderMetaData.paymentStatus.toLowerCase() !== "pending") ||
    delivered;

  const timeline = [
    {
      label: "Order Placed",
      time: orderDateLabel.replace("Placed on ", "").trim() || "-",
      done: true,
      isCancel: false,
    },
    {
      label: "Payment Received",
      time: isPaid
        ? paymentTimeState || orderDateLabel.replace("Placed on ", "").trim() || "-"
        : isCod
        ? "Upon Delivery (COD)"
        : "-",
      done: isPaid,
      isCancel: false,
    },
    {
      label: "Order Confirmed",
      time: confirmed ? confirmedAt || "-" : "-",
      done: confirmed,
      isCancel: false,
    },
    {
      label: "Packed",
      time: packed ? packedAt || "-" : "-",
      done: packed,
      isCancel: false,
    },
    {
      label: "Shipped",
      time: shipped ? shippedAt || "-" : "-",
      done: shipped,
      isCancel: false,
    },
    {
      label: "Delivered",
      time: delivered ? deliveredAt || "-" : "-",
      done: delivered,
      isCancel: false,
    },
  ];

  if (cancelled) {
    timeline.push({
      label: "Order Cancelled",
      time: cancelledAt || "-",
      done: true,
      isCancel: true,
    });
  }

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
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order {orderIdLabel}</h1>
            {loadingOrder && <Loader2 size={16} className="animate-spin text-orange-500" />}
          </div>
          <p className="text-xs text-slate-400 mt-1">{orderDateLabel}</p>
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
                {(() => {
                  const currentStatus =
                    orderMetaData.orderStatus &&
                    orderMetaData.orderStatus.toLowerCase() !== "pending" &&
                    orderMetaData.orderStatus.toLowerCase() !== "processing"
                      ? orderMetaData.orderStatus
                      : status !== "Pending"
                      ? status
                      : orderMetaData.orderStatus || "Pending";

                  const sLow = currentStatus.toLowerCase();
                  const isSuccess =
                    sLow.includes("ready") ||
                    sLow.includes("pickup") ||
                    sLow.includes("confirm") ||
                    sLow.includes("pack") ||
                    sLow.includes("ship") ||
                    sLow.includes("transit") ||
                    sLow.includes("deliver");
                  const isDanger =
                    sLow.includes("cancel") ||
                    sLow.includes("refund") ||
                    sLow.includes("reject") ||
                    sLow.includes("fail");

                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full text-[11px] border transition-all ${
                        isSuccess
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/90"
                          : isDanger
                          ? "bg-red-50 text-red-700 border-red-200/90"
                          : "bg-amber-50 text-amber-700 border-amber-200/90"
                      }`}
                    >
                      {isSuccess ? (
                        <CheckCircle2 size={12} className="shrink-0 text-emerald-600" />
                      ) : isDanger ? (
                        <XCircle size={12} className="shrink-0 text-red-600" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                      {currentStatus}
                    </span>
                  );
                })()}
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Inventory Status</p>
                <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px]">
                  {orderMetaData.inventoryStatus}
                </span>
              </div>
              {orderCounts.total > 0 && (
                <>
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Active Sub-orders</p>
                    <span className="font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-200/60">{orderCounts.active}</span>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Cancelled Sub-orders</p>
                    <span className="font-bold text-rose-600 px-2 py-0.5 bg-rose-50 rounded-md border border-rose-200/60">{orderCounts.cancelled}</span>
                  </div>
                </>
              )}
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
            <div className="p-6 pb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                <Box size={15} className="text-slate-400" />
                Products Ordered ({productList.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50/70 border-y border-slate-100 text-slate-400 font-semibold">
                    <th className="px-6 py-3 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 uppercase tracking-wider">Variant</th>
                    <th className="px-6 py-3 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productList.map((p, i) => {
                    const isCancelled = p.isCancelled || p.orderStatus?.toLowerCase().includes("cancel");
                    return (
                      <tr
                        key={i}
                        className={`transition-colors ${isCancelled ? "bg-rose-50/30 hover:bg-rose-50/50" : "hover:bg-slate-50/50"
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={p.image}
                                alt={p.name}
                                className={`w-12 h-12 rounded-xl object-cover bg-amber-50 border border-amber-100 shadow-sm ${isCancelled ? "opacity-60 grayscale-[30%]" : ""
                                  }`}
                              />
                              {isCancelled && (
                                <span className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow">
                                  <X size={10} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex flex-col justify-center">
                              <p
                                className={`font-bold text-sm leading-snug ${isCancelled ? "text-slate-500 line-through" : "text-slate-800"
                                  }`}
                              >
                                {p.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                            {p.variant}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 font-bold text-xs rounded-md ${isCancelled
                              ? "bg-slate-100 text-slate-500 line-through"
                              : "bg-orange-50 text-orange-600"
                              }`}
                          >
                            Qty: {p.qty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span
                              className={`font-semibold text-xs ${isCancelled ? "text-slate-400 line-through" : "text-slate-800"
                                }`}
                            >
                              ₹{p.price.toFixed(2)}
                            </span>
                            {p.mrp && p.mrp > p.price ? (
                              <span className="text-[11px] text-slate-400 line-through">
                                ₹{p.mrp.toFixed(2)}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isCancelled ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200/80 font-bold text-xs rounded-lg">
                              <XCircle size={13} className="shrink-0 text-rose-600" />
                              Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold text-xs rounded-lg">
                              <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
                              {p.orderStatus
                                ? p.orderStatus.charAt(0).toUpperCase() + p.orderStatus.slice(1)
                                : "Active"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span
                              className={`font-bold text-sm ${isCancelled ? "text-slate-400 line-through" : "text-slate-900"
                                }`}
                            >
                              ₹{(p.price * p.qty).toFixed(2)}
                            </span>
                            {p.save && p.save > 0 && !isCancelled ? (
                              <span className="text-[10px] font-semibold text-emerald-600">
                                Saved ₹{(p.save * p.qty).toFixed(2)}
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  <span className="font-semibold text-emerald-600">
                    -₹{(orderAmounts.couponDiscount > 0 ? orderAmounts.couponDiscount : discount).toFixed(2)}
                  </span>
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
              {(() => {
                const isPendingOrProcessing =
                  orderMetaData.orderStatus.toLowerCase().includes("pend") ||
                  orderMetaData.orderStatus.toLowerCase().includes("process");
                const canConfirm =
                  !confirmed &&
                  !packed &&
                  !shipped &&
                  !cancelled &&
                  isPendingOrProcessing;

                return (
                  <button
                    onClick={canConfirm ? handleConfirm : undefined}
                    disabled={!canConfirm}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      canConfirm
                        ? "bg-[#d97706] text-white hover:bg-[#b45309] cursor-pointer active:scale-[0.98] shadow-sm"
                        : "border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed shadow-none opacity-60 pointer-events-none select-none"
                    }`}
                  >
                    <CheckCircle2 size={15} />
                    Confirm Order
                  </button>
                );
              })()}



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
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${shipped || cancelled
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
            <div className="relative">
              {timeline.map((step, i) => {
                const isLast = i === timeline.length - 1;
                return (
                  <div key={i} className="relative flex items-start gap-3 pb-5 last:pb-0">
                    {!isLast && (
                      <div
                        className={`absolute left-[7px] top-[18px] bottom-0 w-0.5 transition-colors ${
                          step.done && timeline[i + 1]?.done
                            ? "bg-emerald-500"
                            : "bg-slate-100"
                        }`}
                      />
                    )}
                    <div className="relative z-10 shrink-0 mt-0.5">
                      {step.isCancel ? (
                        <XCircle size={16} className="text-rose-500 fill-rose-50" />
                      ) : step.done ? (
                        <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle size={16} className="text-slate-200 fill-white" />
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between text-xs min-w-0 pt-0.5">
                      <span
                        className={`font-semibold truncate ${
                          step.isCancel
                            ? "text-rose-600 font-bold"
                            : step.done
                            ? "text-slate-800"
                            : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </span>
                      <span
                        className={`text-[11px] font-medium shrink-0 ml-2 ${
                          step.isCancel
                            ? "text-rose-500"
                            : step.done
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        {step.time ?? "-"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white rounded-2xl border border-slate-100/80 shadow-sm px-6 py-4">
        <button
          onClick={goPrev}
          disabled={allApiOrders.length === 0 || currentOrderIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${allApiOrders.length === 0 || currentOrderIndex === 0
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
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${allApiOrders.length === 0 || currentOrderIndex >= allApiOrders.length - 1
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
              {(() => {
                const activeProducts = productList.filter((p) => !p.isCancelled);
                if (activeProducts.length === 0) return null;
                const activeSubtotal = activeProducts.reduce((s, p) => s + p.price * p.qty, 0);
                const displayTotal = orderAmounts.finalAmount > 0 ? orderAmounts.finalAmount : activeSubtotal;

                return (
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-200/50">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <Box size={14} className="text-amber-600" />
                        ORDERED PRODUCTS ({activeProducts.length})
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        Total: ₹{displayTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="divide-y divide-amber-200/50">
                      {activeProducts.map((p, i) => (
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
                );
              })()}

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
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${isCarrierDropdownOpen ? "rotate-180" : ""
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
                            className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition flex items-center justify-between cursor-pointer ${isSelected
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