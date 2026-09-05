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
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

type OrderStatus = "Pending" | "Confirmed" | "Packed" | "Shipped" | "Cancelled";

interface Product {
  name: string;
  variant: string;
  qty: number;
  price: number;
  image: string;
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
  const queryId = searchParams.get("id");

  const [loadingOrder, setLoadingOrder] = useState<boolean>(false);
  const [allApiOrders, setAllApiOrders] = useState<any[]>([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number>(0);

  const [orderIdLabel, setOrderIdLabel] = useState<string>("#ORD-1052");
  const [orderDateLabel, setOrderDateLabel] = useState<string>("07 Jul 2026 • 10:15 AM");
  const [customerInfo, setCustomerInfo] = useState<{
    name: string;
    phone: string;
    email: string;
    shippingAddress: string;
    billingAddress: string;
  }>({
    name: "Priya Sharma",
    phone: "+91 98765 43210",
    email: "priyasharma@email.com",
    shippingAddress: "12, Green Park, Andheri West, Mumbai, Maharashtra 400058, India",
    billingAddress: "12, Green Park, Andheri West, Mumbai, Maharashtra 400058, India",
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
    paymentStatus: string;
    paymentMethod: string;
    trackingNumber: string;
    deliveryMethod: string;
    deliveryPartner: string;
    deliveryCharge: number;
    estimatedDelivery: string;
  }>({
    paymentStatus: "Paid",
    paymentMethod: "Online Payment",
    trackingNumber: "123456789012",
    deliveryMethod: "Standard Delivery",
    deliveryPartner: "Delhivery",
    deliveryCharge: 60,
    estimatedDelivery: "10 Jul 2026",
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

    const displayId =
      item.orderId ||
      item.order_id ||
      (item._id ? `#ORD-${item._id.slice(-5).toUpperCase()}` : "#ORD-1052");
    setOrderIdLabel(displayId);

    const dateObj = new Date(item.createdAt || item.date || item.orderDate || Date.now());
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

    // Customer details extraction (prioritize userId account details first)
    const u = typeof item.userId === "object" && item.userId
      ? item.userId
      : typeof item.user === "object" && item.user
      ? item.user
      : typeof item.user_id === "object" && item.user_id
      ? item.user_id
      : {};
    const c = typeof item.customer === "object" && item.customer ? item.customer : {};
    const sa = typeof item.shipping_address === "object" && item.shipping_address ? item.shipping_address : typeof item.shippingAddress === "object" && item.shippingAddress ? item.shippingAddress : {};
    const ba = typeof item.billing_address === "object" && item.billing_address ? item.billing_address : typeof item.billingAddress === "object" && item.billingAddress ? item.billingAddress : {};

    let name =
      u.name ||
      u.full_name ||
      u.fullName ||
      (u.first_name ? `${u.first_name} ${u.last_name || ""}`.trim() : "") ||
      c.name ||
      c.full_name ||
      c.fullName ||
      (c.first_name ? `${c.first_name} ${c.last_name || ""}`.trim() : "") ||
      (typeof item.customer === "string" && item.customer.trim() && item.customer !== "Customer" ? item.customer : "") ||
      sa.full_name ||
      sa.name ||
      sa.fullName ||
      (sa.first_name ? `${sa.first_name} ${sa.last_name || ""}`.trim() : "") ||
      ba.full_name ||
      ba.name ||
      item.customer_name ||
      item.customerName ||
      item.full_name ||
      item.fullName ||
      "";

    let phone =
      u.mobile ||
      u.phone ||
      u.contact ||
      u.phone_number ||
      u.phoneNumber ||
      c.mobile ||
      c.phone ||
      c.contact ||
      c.phone_number ||
      c.phoneNumber ||
      sa.phone ||
      sa.mobile ||
      sa.contact ||
      ba.phone ||
      ba.mobile ||
      item.customer_phone ||
      item.customerPhone ||
      item.mobile ||
      item.phone ||
      "";

    let email =
      u.email ||
      u.email_address ||
      u.emailAddress ||
      c.email ||
      c.email_address ||
      sa.email ||
      ba.email ||
      item.customer_email ||
      item.customerEmail ||
      item.email ||
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

    setCustomerInfo({
      name,
      phone,
      email,
      shippingAddress: shippingAddrStr,
      billingAddress: billingAddrStr,
    });

    const og = typeof item.order_group_id === "object" && item.order_group_id ? item.order_group_id : {};

    const groupId = og.group_id || item.group_id || item.groupId || "";

    const tAmt = Number(og.totalAmount ?? item.totalAmount ?? item.total_amount ?? item.subtotal ?? item.amount ?? 0);
    const fAmt = Number(og.finalAmount ?? item.finalAmount ?? item.final_amount ?? item.grandTotal ?? item.total ?? 0);
    const cAmt = Number(og.cod_amount ?? og.codAmount ?? item.cod_amount ?? item.codAmount ?? item.cod_charge ?? item.cod_fee ?? 0);

    const couponDisc = Number(item.couponDiscount ?? item.coupon_discount ?? item.discount ?? 0);
    const totalSave = Number(item.totalsave ?? item.total_save ?? item.totalSave ?? item.savings ?? 0);
    const weight = Number(item.totalWeight ?? item.total_weight ?? item.weight ?? 0);

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
    const payStatus = item.payment_status || item.payment?.status || "Paid";
    const payMethod = item.payment_mode || item.payment_method || item.payment?.method || "Online Payment";
    const tracking = item.trackingNumber || item.tracking_number || item.tracking_id || "123456789012";
    const courier = item.courier || item.delivery_partner || "Delhivery";
    const shippingCharge = Number(item.shipping_charge || item.shippingCharge || 60);

    setOrderMetaData({
      paymentStatus: payStatus,
      paymentMethod: payMethod,
      trackingNumber: tracking,
      deliveryMethod: "Standard Delivery",
      deliveryPartner: courier,
      deliveryCharge: shippingCharge,
      estimatedDelivery: "3-5 Business Days",
    });

    // Products list
    const rawProds = Array.isArray(item.products)
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

    if (rawProds.length > 0) {
      const parsedProds: Product[] = rawProds.map((p: any) => {
        const pName =
          p.name ||
          p.product_name ||
          p.product_details?.product?.product_name ||
          p.product?.product_name ||
          "Honey Jar";
        const variant = p.variant || p.unit || p.quantityUnit || "250g";
        const qty = Number(p.quantity || p.qty || 1);
        const price = Number(p.price || p.sellingPrice || p.product_details?.product?.variant?.price || 249);
        const image =
          p.image ||
          p.product_details?.product?.image?.image_url ||
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60";
        return { name: pName, variant, qty, price, image };
      });
      setProductList(parsedProds);
    }

    // Status sync
    const st = String(item.status || item.order_status || "Processing").toLowerCase();
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
    } else if (st.includes("confirm") || st.includes("process") || st.includes("active")) {
      setConfirmed(true);
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

      // Try GET API for single order detail: /api/admin/order-dashboard/orders/${id}
      if (queryId) {
        try {
          const detailRes = await fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders/${queryId}`, {
            method: "GET",
            credentials: "include",
            headers,
          });
          const detailJson = await detailRes.json().catch(() => ({}));
          if (detailRes.ok && (detailJson.data || detailJson.order || detailJson._id || detailJson.id)) {
            const singleOrder = detailJson.data?.order || detailJson.order || detailJson.data || detailJson;
            populateOrderFromData(singleOrder);
            setLoadingOrder(false);
            return;
          }
        } catch (detailErr) {
          console.log("Direct order ID API call failed, falling back to list:", detailErr);
        }
      }

      // Fallback: GET /api/admin/order-dashboard/orders
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

  const handleConfirm = () => {
    setConfirmed(true);
    setConfirmedAt(now());
    showToast("Order confirmed successfully.");
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
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#fef9c3] text-[#a16207]">
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
                  Customer Details
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
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {customerInfo.shippingAddress}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Billing Address
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {customerInfo.billingAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Order Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6">
            <h2 className="flex items-center gap-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide mb-5">
              <ClipboardList size={15} className="text-slate-400" />
              Order Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-6 text-xs">
              <div>
                <p className="text-slate-400 font-medium mb-1">Order ID</p>
                <p className="font-bold text-slate-900">{orderIdLabel}</p>
              </div>
              {orderAmounts.groupId && (
                <div>
                  <p className="text-slate-400 font-medium mb-1">Group ID</p>
                  <p className="font-bold text-slate-900">{orderAmounts.groupId}</p>
                </div>
              )}
              <div>
                <p className="text-slate-400 font-medium mb-1">Payment Status</p>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {orderMetaData.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Tracking Number</p>
                <p className="font-bold text-slate-900">{orderMetaData.trackingNumber}</p>
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
                <p className="text-slate-400 font-medium mb-1">Delivery Method</p>
                <p className="font-bold text-slate-900">{orderMetaData.deliveryMethod}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Estimated Delivery</p>
                <p className="font-bold text-slate-900">{orderMetaData.estimatedDelivery}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Payment Method</p>
                <p className="font-bold text-slate-900">{orderMetaData.paymentMethod}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Delivery Partner</p>
                <p className="font-bold text-slate-900">{orderMetaData.deliveryPartner}</p>
              </div>
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
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-11 h-11 rounded-lg object-cover bg-amber-50 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{p.name}</p>
                            <p className="text-[11px] text-slate-400">Glass Jar</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">{p.variant}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{p.qty}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">₹{p.price.toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ₹{(p.price * p.qty).toFixed(2)}
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
                disabled={confirmed || cancelled}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  confirmed || cancelled
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-[#d97706] text-white hover:bg-[#b45309]"
                }`}
              >
                <CheckCircle2 size={15} />
                {confirmed ? "Order Confirmed" : "Confirm Order"}
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
    </div>
  );
}