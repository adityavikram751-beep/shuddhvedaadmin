"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  Printer,
  Download,
  MoreVertical,
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
  MessageSquare,
  Gift,
  Truck,
  XCircle,
  PackageCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

type OrderStatus = "Pending" | "Confirmed" | "Packed" | "Shipped" | "Cancelled";

interface Product {
  name: string;
  variant: string;
  qty: number;
  price: number;
  image: string;
}

const products: Product[] = [
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

const subtotal = products.reduce((s, p) => s + p.price * p.qty, 0);
const shipping = 60;
const discount = 50;
const gstRate = 0.05;
const gst = Math.round(subtotal * gstRate);
const grandTotal = subtotal + shipping - discount + gst;

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
  const [orderNum, setOrderNum] = useState(1052);
  const totalOrders = 248;

  const [confirmed, setConfirmed] = useState(false);
  const [packed, setPacked] = useState(false);
  const [shipped, setShipped] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const [confirmedAt, setConfirmedAt] = useState<string | null>("07 Jul 2026 • 10:20 AM");
  const [packedAt, setPackedAt] = useState<string | null>(null);
  const [shippedAt, setShippedAt] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const pdfLoadStarted = useRef(false);

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
    doc.text(`Order #ORD-${orderNum}`, 40, 70);
    doc.text(`Status: ${status}`, 40, 84);
    doc.text("Placed on 07 Jul 2026, 10:15 AM", 40, 98);

    doc.text("Bill To:", 400, 70);
    doc.text("Priya Sharma", 400, 84);
    doc.text("12, Green Park, Andheri West,", 400, 98);
    doc.text("Mumbai, Maharashtra 400058, India", 400, 112);

    (doc as any).autoTable({
      startY: 130,
      head: [["Product", "Variant", "Qty", "Price", "Total"]],
      body: products.map((p) => [
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
    doc.save(`Invoice-ORD-${orderNum}.pdf`);
    showToast("Invoice downloaded.");
  };

  const goPrev = () => {
    if (orderNum > 1001) {
      setOrderNum((n) => n - 1);
      resetOrderState();
    }
  };
  const goNext = () => {
    if (orderNum < 1001 + totalOrders - 1) {
      setOrderNum((n) => n + 1);
      resetOrderState();
    }
  };
  const resetOrderState = () => {
    setConfirmed(false);
    setPacked(false);
    setShipped(false);
    setCancelled(false);
    setConfirmedAt("07 Jul 2026 • 10:20 AM");
    setPackedAt(null);
    setShippedAt(null);
  };

  const timeline = [
    { label: "Order Placed", time: "07 Jul 2026 • 10:15 AM", done: true },
    { label: "Payment Received", time: "07 Jul 2026 • 10:16 AM", done: true },
    { label: "Order Confirmed", time: confirmedAt, done: true },
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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order #ORD-{orderNum}</h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#fef9c3] text-[#a16207]">
              {status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Placed on 07 Jul 2026 • 10:15 AM</p>
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
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            aria-label="More options"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-44 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-20">
              <button
                onClick={() => {
                  showToast("Duplicate order created.");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Duplicate Order
              </button>
              <button
                onClick={() => {
                  showToast("Refund initiated.");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Refund Order
              </button>
              <button
                onClick={() => {
                  showToast("Order deleted.");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50"
              >
                Delete Order
              </button>
            </div>
          )}
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
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Priya Sharma"
                  className="w-14 h-14 rounded-full object-cover shadow-inner"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-base">Priya Sharma</p>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                      <CheckCircle2 size={11} />
                      Verified
                    </span>
                  </div>
                  <p className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Phone size={12} className="text-slate-400" />
                    +91 98765 43210
                  </p>
                  <p className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <Mail size={12} className="text-slate-400" />
                    priyasharma@email.com
                  </p>
                </div>
              </div>

              <div className="flex-1 sm:max-w-[260px]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Delivery Address
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  12, Green Park, Andheri West, Mumbai, Maharashtra 400058, India
                </p>
              </div>

              <button
                onClick={() => showToast("Calling Priya Sharma...")}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm"
                aria-label="Call customer"
              >
                <Phone size={15} />
              </button>
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
                <p className="font-bold text-slate-900">#ORD-{orderNum}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Payment Status</p>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Paid
                </span>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Tracking Number</p>
                <p className="font-bold text-slate-900">123456789012</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Order Date</p>
                <p className="font-bold text-slate-900">07 Jul 2026 • 10:15 AM</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Delivery Method</p>
                <p className="font-bold text-slate-900">Standard Delivery</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Estimated Delivery</p>
                <p className="font-bold text-slate-900">10 Jul 2026</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Payment Method</p>
                <p className="font-bold text-slate-900">Online Payment</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Delivery Partner</p>
                <p className="font-bold text-slate-900">Delhivery</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Delivery Charge</p>
                <p className="font-bold text-slate-900">₹60.00</p>
              </div>
            </div>
          </div>

          {/* Products Ordered Card */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
            <h2 className="flex items-center gap-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide p-6 pb-4">
              <Box size={15} className="text-slate-400" />
              Products Ordered ({products.length})
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
                  {products.map((p, i) => (
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

          {/* Price Summary & Order Timeline Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Price Summary */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <h2 className="flex items-center gap-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide mb-5">
                  <FileText size={15} className="text-slate-400" />
                  Price Summary
                </h2>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shipping Charge</span>
                    <span className="font-semibold text-slate-800">₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Discount</span>
                    <span className="font-semibold text-emerald-600">-₹{discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GST (5%)</span>
                    <span className="font-semibold text-slate-800">₹{gst.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-baseline pt-4 border-t border-slate-100 mt-6">
                <span className="font-bold text-slate-900 text-sm">Grand Total</span>
                <span className="font-black text-slate-900 text-2xl tracking-tight">
                  ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
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

          {/* Customer Notes */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6">
            <h2 className="flex items-center gap-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
              <MessageSquare size={15} className="text-slate-400" />
              Customer Notes
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Please deliver between 10 AM – 6 PM.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">
              Customer is expecting the order on preferred date.
            </p>
          </div>

          {/* Gift Message */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6">
            <h2 className="flex items-center gap-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
              <Gift size={15} className="text-slate-400" />
              Gift Message
            </h2>
            <div className="bg-slate-50 border-l-4 border-[#d97706] rounded-r-xl p-4">
              <p className="text-xs text-slate-600 italic font-medium leading-relaxed">
                Happy Birthday! Have a sweet day ahead.
              </p>
              <p className="text-xs font-bold text-slate-700 mt-2">— Rahul &amp; Family</p>
            </div>
          </div>

          {/* Shipping Status */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6">
            <h2 className="flex items-center gap-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
              <Truck size={15} className="text-slate-400" />
              Shipping Status
            </h2>
            <div className="bg-[#fef9c3]/60 rounded-xl p-4 border border-amber-100">
              <span className="text-xs font-bold text-[#a16207] bg-[#fef9c3] px-2.5 py-0.5 rounded-full inline-block mb-2">
                {status}
              </span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {cancelled
                  ? "This order has been cancelled."
                  : shipped
                  ? "The order is on its way to the customer."
                  : packed
                  ? "The order is packed and awaiting pickup."
                  : "The order is confirmed and awaiting packing."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white rounded-2xl border border-slate-100/80 shadow-sm px-6 py-4">
        <button
          onClick={goPrev}
          disabled={orderNum <= 1001}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
            orderNum <= 1001
              ? "border-slate-100 text-slate-300 cursor-not-allowed"
              : "border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          }`}
        >
          <ArrowLeft size={14} />
          Previous Order
        </button>

        <p className="text-xs font-medium text-slate-400 order-first sm:order-none">
          <span className="font-bold text-slate-800">{orderNum}</span> of {totalOrders} Orders
        </p>

        <button
          onClick={goNext}
          disabled={orderNum >= 1001 + totalOrders - 1}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            orderNum >= 1001 + totalOrders - 1
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