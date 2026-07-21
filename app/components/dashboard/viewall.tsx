"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  History,
  RotateCcw,
  Download,
  Search,
  Calendar,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  PackageCheck,
  ShieldAlert,
} from "lucide-react";

// ================= Mock Datasets =================

// 1. All Orders Data
const allOrdersData = [
  { id: "ORD-1052", itemsCount: 3, customer: "Priya Sharma", phone: "+91 98765 43210", date: "12 Jul 2026", time: "09:20 AM", method: "UPI", methodType: "upi", paymentStatus: "Paid", amount: "₹2,450.00", orderStatus: "Processing" },
  { id: "ORD-1051", itemsCount: 2, customer: "Amit Kumar", phone: "+91 91234 56789", date: "11 Jul 2026", time: "04:15 PM", method: "COD", methodType: "cod", paymentStatus: "Pending", amount: "₹980.00", orderStatus: "Pending" },
  { id: "ORD-1050", itemsCount: 4, customer: "Neha Singh", phone: "+91 99876 12345", date: "10 Jul 2026", time: "11:30 AM", method: "Card", methodType: "card", paymentStatus: "Paid", amount: "₹1,750.00", orderStatus: "Delivered" },
  { id: "ORD-1049", itemsCount: 2, customer: "Rahul Verma", phone: "+91 88990 11223", date: "09 Jul 2026", time: "02:45 PM", method: "Net Banking", methodType: "bank", paymentStatus: "Paid", amount: "₹1,250.00", orderStatus: "Shipped" },
  { id: "ORD-1048", itemsCount: 1, customer: "Sneha Patel", phone: "+91 77889 33445", date: "09 Jul 2026", time: "10:20 AM", method: "COD", methodType: "cod", paymentStatus: "Pending", amount: "₹890.00", orderStatus: "Delivered" },
  { id: "ORD-1047", itemsCount: 3, customer: "Vikram Mehta", phone: "+91 77665 77889", date: "08 Jul 2026", time: "09:10 PM", method: "UPI", methodType: "upi", paymentStatus: "Paid", amount: "₹3,150.00", orderStatus: "Processing" },
  { id: "ORD-1046", itemsCount: 1, customer: "Anjali Gupta", phone: "+91 88776 65544", date: "08 Jul 2026", time: "01:05 PM", method: "Card", methodType: "card", paymentStatus: "Paid", amount: "₹650.00", orderStatus: "Pending" },
  { id: "ORD-1045", itemsCount: 2, customer: "Manish Jain", phone: "+91 99887 66554", date: "07 Jul 2026", time: "05:40 PM", method: "Net Banking", methodType: "bank", paymentStatus: "Paid", amount: "₹2,100.00", orderStatus: "Delivered" },
];

// 2. Order History Data
const historyOrdersData = [
  { id: "ORD-1052", itemsCount: 1, customer: "Priya Sharma", phone: "+91 98765 43210", date: "12 Jul 2026", time: "09:20 AM", method: "UPI", paymentStatus: "Paid", finalStatus: "Delivered", amount: "₹2,450.00" },
  { id: "ORD-1048", itemsCount: 2, customer: "Rahul Verma", phone: "+91 88990 11223", date: "09 Jul 2026", time: "03:45 PM", method: "Debit/Credit Card", paymentStatus: "Paid", finalStatus: "Cancelled", amount: "₹890.00" },
  { id: "ORD-1045", itemsCount: 3, customer: "Neha Singh", phone: "+91 99876 12345", date: "08 Jul 2026", time: "11:30 AM", method: "Net Banking", paymentStatus: "Paid", finalStatus: "Delivered", amount: "₹1,750.00" },
  { id: "ORD-1040", itemsCount: 1, customer: "Amit Kumar", phone: "+91 91234 56789", date: "06 Jul 2026", time: "10:15 AM", method: "COD", paymentStatus: "Refunded", finalStatus: "Cancelled", amount: "₹980.00" },
  { id: "ORD-1035", itemsCount: 2, customer: "Sneha Patel", phone: "+91 77889 33445", date: "03 Jul 2026", time: "02:20 PM", method: "UPI", paymentStatus: "Paid", finalStatus: "Delivered", amount: "₹3,150.00" },
  { id: "ORD-1030", itemsCount: 2, customer: "Vikram Mehta", phone: "+91 77665 77889", date: "01 Jul 2026", time: "05:40 PM", method: "Debit/Credit Card", paymentStatus: "Paid", finalStatus: "Delivered", amount: "₹650.00" },
  { id: "ORD-1024", itemsCount: 2, customer: "Anjali Gupta", phone: "+91 88776 65544", date: "28 Jun 2026", time: "09:10 AM", method: "Net Banking", paymentStatus: "Paid", finalStatus: "Cancelled", amount: "₹1,250.00" },
  { id: "ORD-1020", itemsCount: 1, customer: "Manish Jain", phone: "+91 99887 66554", date: "26 Jun 2026", time: "04:05 PM", method: "COD", paymentStatus: "Refunded", finalStatus: "Cancelled", amount: "₹1,890.00" },
];

// 3. Returns & Refunds Data
const returnsData = [
  { id: "ORD-1048", itemsCount: 2, customer: "Priya Sharma", phone: "+91 98765 43210", reasonTitle: "Damaged Product", reasonSub: "Product received was damaged", returnStatus: "Return Approved", refundStatus: "Refund Successful", refundAmount: "₹890.00", requestedOn: "12 Jul 2026", requestedTime: "04:15 PM" },
  { id: "ORD-1035", itemsCount: 1, customer: "Amit Kumar", phone: "+91 91234 56789", reasonTitle: "Wrong Product", reasonSub: "Received different product", returnStatus: "Return Approved", refundStatus: "Refund Processing", refundAmount: "₹1,250.00", requestedOn: "11 Jul 2026", requestedTime: "11:30 AM" },
  { id: "ORD-1029", itemsCount: 1, customer: "Neha Singh", phone: "+91 99876 12345", reasonTitle: "Quality Issue", reasonSub: "Taste/quality not as expected", returnStatus: "Return Approved", refundStatus: "Refund Successful", refundAmount: "₹650.00", requestedOn: "10 Jul 2026", requestedTime: "02:20 PM" },
  { id: "ORD-1022", itemsCount: 3, customer: "Rahul Verma", phone: "+91 88990 11223", reasonTitle: "Damaged in Delivery", reasonSub: "Package was damaged during delivery", returnStatus: "Pickup Completed", refundStatus: "Refund Successful", refundAmount: "₹1,750.00", requestedOn: "09 Jul 2026", requestedTime: "10:05 AM" },
  { id: "ORD-1018", itemsCount: 1, customer: "Sneha Patel", phone: "+91 77889 33445", reasonTitle: "Changed My Mind", reasonSub: "No longer needed", returnStatus: "Return Rejected", refundStatus: "Refund Rejected", refundAmount: "₹980.00", requestedOn: "08 Jul 2026", requestedTime: "04:45 PM" },
  { id: "ORD-1012", itemsCount: 3, customer: "Vikram Mehta", phone: "+91 77665 77889", reasonTitle: "Wrong Product", reasonSub: "Size/variant is different", returnStatus: "Pickup Scheduled", refundStatus: "Refund Processing", refundAmount: "₹2,100.00", requestedOn: "07 Jul 2026", requestedTime: "01:15 PM" },
];

export default function OrdersPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"all" | "history" | "returns">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("This Month");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Navigate to Order Details Page
  const handleViewOrder = (orderId: string) => {
    router.push(`/order/vieworder`);
  };

  // Filter Handler
  const handleReset = () => {
    setSearchQuery("");
    setDateRange(activeTab === "history" ? "This Year" : "This Month");
    setStatusFilter("All");
    setPaymentStatusFilter("All");
    setPaymentMethodFilter("All");
    setCurrentPage(1);
  };

  // Tab switch resets
  const handleTabChange = (tab: "all" | "history" | "returns") => {
    setActiveTab(tab);
    setSearchQuery("");
    setStatusFilter("All");
    setPaymentStatusFilter("All");
    setPaymentMethodFilter("All");
    setDateRange(tab === "history" ? "This Year" : "This Month");
    setCurrentPage(1);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    let csvData = "";
    if (activeTab === "all") {
      csvData =
        "Order ID,Customer,Phone,Date,Time,Payment Method,Payment Status,Amount,Order Status\n" +
        allOrdersData
          .map(
            (o) =>
              `"${o.id}","${o.customer}","${o.phone}","${o.date}","${o.time}","${o.method}","${o.paymentStatus}","${o.amount}","${o.orderStatus}"`
          )
          .join("\n");
    } else if (activeTab === "history") {
      csvData =
        "Order ID,Customer,Phone,Completed Date,Time,Payment Method,Payment Status,Final Status,Amount\n" +
        historyOrdersData
          .map(
            (o) =>
              `"${o.id}","${o.customer}","${o.phone}","${o.date}","${o.time}","${o.method}","${o.paymentStatus}","${o.finalStatus}","${o.amount}"`
          )
          .join("\n");
    } else {
      csvData =
        "Order ID,Customer,Phone,Reason,Return Status,Refund Status,Refund Amount,Requested On\n" +
        returnsData
          .map(
            (o) =>
              `"${o.id}","${o.customer}","${o.phone}","${o.reasonTitle}","${o.returnStatus}","${o.refundStatus}","${o.refundAmount}","${o.requestedOn}"`
          )
          .join("\n");
    }

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 text-[#0F172A] font-sans">
      <div className="max-w-[1280px] mx-auto space-y-6">
        
        {/* ---------------- Top Header ---------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A]">
              {activeTab === "all" && "Total Orders"}
              {activeTab === "history" && "Order History"}
              {activeTab === "returns" && "Returns & Refunds"}
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              {activeTab === "all" && "View and manage all orders received from your store."}
              {activeTab === "history" && "View completed and cancelled orders from your store."}
              {activeTab === "returns" && "Manage all return requests and refund transactions."}
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm font-bold text-[#334155] hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>

        {/* ---------------- Navigation Tabs ---------------- */}
        <div className="flex items-center gap-8 border-b border-[#E2E8F0] pt-2">
          <button
            onClick={() => handleTabChange("all")}
            className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === "all" ? "text-[#D97706]" : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <ShoppingBag size={18} />
            <span>All Orders</span>
            {activeTab === "all" && <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#D97706] rounded-t-full" />}
          </button>

          <button
            onClick={() => handleTabChange("history")}
            className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === "history" ? "text-[#D97706]" : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <History size={18} />
            <span>Order History</span>
            {activeTab === "history" && <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#D97706] rounded-t-full" />}
          </button>

          <button
            onClick={() => handleTabChange("returns")}
            className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === "returns" ? "text-[#D97706]" : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <RotateCcw size={18} />
            <span>Returns &amp; Refunds</span>
            {activeTab === "returns" && <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#D97706] rounded-t-full" />}
          </button>
        </div>

        {/* ---------------- Controls & Filters Card ---------------- */}
        <div className="bg-white rounded-3xl border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 md:p-6 space-y-6">
          
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, Customer Name, Phone..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D97706]"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Range Dropdown */}
              <div className="flex flex-col text-[10px] uppercase font-bold text-[#94A3B8]">
                <span>DATE RANGE</span>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="mt-0.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] focus:outline-none cursor-pointer"
                >
                  <option value="This Month">This Month</option>
                  <option value="This Year">This Year</option>
                  <option value="All Time">All Time</option>
                </select>
              </div>

              {/* Dynamic Status Dropdown */}
              <div className="flex flex-col text-[10px] uppercase font-bold text-[#94A3B8]">
                <span>{activeTab === "returns" ? "RETURN STATUS" : "STATUS"}</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-0.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] focus:outline-none cursor-pointer"
                >
                  <option value="All">All</option>
                  {activeTab === "all" && (
                    <>
                      <option value="Processing">Processing</option>
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </>
                  )}
                  {activeTab === "history" && (
                    <>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </>
                  )}
                  {activeTab === "returns" && (
                    <>
                      <option value="Return Approved">Return Approved</option>
                      <option value="Pickup Completed">Pickup Completed</option>
                      <option value="Pickup Scheduled">Pickup Scheduled</option>
                      <option value="Return Rejected">Return Rejected</option>
                    </>
                  )}
                </select>
              </div>

              {/* Payment / Refund Status */}
              <div className="flex flex-col text-[10px] uppercase font-bold text-[#94A3B8]">
                <span>{activeTab === "returns" ? "REFUND STATUS" : "PAYMENT STATUS"}</span>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="mt-0.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] focus:outline-none cursor-pointer"
                >
                  <option value="All">All</option>
                  {activeTab !== "returns" ? (
                    <>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Refunded">Refunded</option>
                    </>
                  ) : (
                    <>
                      <option value="Refund Successful">Refund Successful</option>
                      <option value="Refund Processing">Refund Processing</option>
                      <option value="Refund Rejected">Refund Rejected</option>
                    </>
                  )}
                </select>
              </div>

              {/* Payment Method Dropdown */}
              <div className="flex flex-col text-[10px] uppercase font-bold text-[#94A3B8]">
                <span>PAYMENT METHOD</span>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="mt-0.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] focus:outline-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="UPI">UPI</option>
                  <option value="COD">COD</option>
                  <option value="Card">Card / Debit</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FDE68A] bg-[#FEF3C7]/40 text-xs font-bold text-[#D97706] hover:bg-[#FEF3C7] transition-colors cursor-pointer"
              >
                <RotateCw size={13} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* ---------------- 5 Summary Cards (Only for Returns & Refunds) ---------------- */}
          {activeTab === "returns" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase">TOTAL RETURN REQUESTS</p>
                  <p className="text-xl font-extrabold text-[#0F172A]">24</p>
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase">RETURN APPROVED</p>
                  <p className="text-xl font-extrabold text-[#0F172A]">14</p>
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase">REFUND PROCESSING</p>
                  <p className="text-xl font-extrabold text-[#0F172A]">5</p>
                </div>
              </div>

              <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600">
                  <PackageCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase">REFUND SUCCESSFUL</p>
                  <p className="text-xl font-extrabold text-[#0F172A]">18</p>
                </div>
              </div>

              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 rounded-xl text-rose-600">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase">REFUND REJECTED</p>
                  <p className="text-xl font-extrabold text-[#0F172A]">2</p>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- Dynamic Data Table ---------------- */}
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#F8FAFC] text-[11px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                  <th className="py-3 px-4">ORDER ID</th>
                  <th className="py-3 px-4">PRODUCTS</th>
                  <th className="py-3 px-4">CUSTOMER</th>

                  {activeTab === "all" && (
                    <>
                      <th className="py-3 px-4">DATE &amp; TIME ↑↓</th>
                      <th className="py-3 px-4">PAYMENT METHOD</th>
                      <th className="py-3 px-4">PAYMENT STATUS</th>
                      <th className="py-3 px-4">AMOUNT</th>
                      <th className="py-3 px-4">ORDER STATUS</th>
                      <th className="py-3 px-4 text-center">ACTION</th>
                    </>
                  )}

                  {activeTab === "history" && (
                    <>
                      <th className="py-3 px-4">COMPLETED DATE ↑↓</th>
                      <th className="py-3 px-4">PAYMENT METHOD</th>
                      <th className="py-3 px-4">PAYMENT STATUS</th>
                      <th className="py-3 px-4">FINAL STATUS</th>
                      <th className="py-3 px-4">AMOUNT</th>
                      <th className="py-3 px-4 text-center">ACTION</th>
                    </>
                  )}

                  {activeTab === "returns" && (
                    <>
                      <th className="py-3 px-4">RETURN REASON</th>
                      <th className="py-3 px-4">RETURN STATUS</th>
                      <th className="py-3 px-4">REFUND STATUS</th>
                      <th className="py-3 px-4">REFUND AMOUNT</th>
                      <th className="py-3 px-4">REQUESTED ON</th>
                      <th className="py-3 px-4 text-center">ACTION</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F1F5F9]">
                {/* 1. All Orders View (Added Working Action Button) */}
                {activeTab === "all" &&
                  allOrdersData.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 font-bold text-[#0F172A] text-sm">{order.id}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#D9A74A] to-[#613D0C] shrink-0" />
                          <span className="text-xs font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded">
                            {order.itemsCount} Items
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs font-bold text-[#0F172A]">{order.customer}</div>
                        <div className="text-[11px] text-[#94A3B8]">{order.phone}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs font-bold text-[#334155]">{order.date}</div>
                        <div className="text-[11px] text-[#94A3B8]">{order.time}</div>
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-[#334155]">{order.method}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            order.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#0F172A] text-sm">{order.amount}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                          {order.orderStatus}
                        </span>
                      </td>
                      {/* Action Column Handler */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleViewOrder(order.id)}
                          className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-100 text-[#64748B] hover:text-[#D97706] transition-colors cursor-pointer"
                          title="View Order Details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {/* 2. Order History View */}
                {activeTab === "history" &&
                  historyOrdersData.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 font-bold text-[#0F172A] text-sm">{order.id}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <div className="h-8 w-12 rounded bg-gradient-to-r from-amber-400 via-orange-400 to-amber-600 shrink-0" />
                          {order.itemsCount > 1 && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 rounded">
                              +1
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs font-bold text-[#0F172A]">{order.customer}</div>
                        <div className="text-[11px] text-[#94A3B8]">{order.phone}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs font-bold text-[#334155]">{order.date}</div>
                        <div className="text-[11px] text-[#94A3B8]">{order.time}</div>
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-[#334155]">{order.method}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            order.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            order.finalStatus === "Delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {order.finalStatus === "Delivered" ? "✓ Delivered" : "✕ Cancelled"}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#0F172A] text-sm">{order.amount}</td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleViewOrder(order.id)}
                          className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-100 text-[#64748B] hover:text-[#D97706] transition-colors cursor-pointer"
                          title="View Order Details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {/* 3. Returns & Refunds View */}
                {activeTab === "returns" &&
                  returnsData.map((ret) => (
                    <tr key={ret.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 font-bold text-[#0F172A] text-sm">{ret.id}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <div className="h-8 w-10 rounded bg-gradient-to-r from-amber-500 to-yellow-600 shrink-0" />
                          {ret.itemsCount > 1 && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 rounded">
                              +{ret.itemsCount - 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs font-bold text-[#0F172A]">{ret.customer}</div>
                        <div className="text-[11px] text-[#94A3B8]">{ret.phone}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs font-bold text-[#0F172A]">{ret.reasonTitle}</div>
                        <div className="text-[10px] text-[#94A3B8] max-w-[140px] truncate">
                          {ret.reasonSub}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            ret.returnStatus.includes("Approved")
                              ? "bg-emerald-100 text-emerald-800"
                              : ret.returnStatus.includes("Completed")
                              ? "bg-purple-100 text-purple-800"
                              : ret.returnStatus.includes("Scheduled")
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {ret.returnStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            ret.refundStatus.includes("Successful")
                              ? "bg-emerald-100 text-emerald-800"
                              : ret.refundStatus.includes("Processing")
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {ret.refundStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#0F172A] text-sm">{ret.refundAmount}</td>
                      <td className="py-4 px-4">
                        <div className="text-xs font-bold text-[#334155]">{ret.requestedOn}</div>
                        <div className="text-[10px] text-[#94A3B8]">{ret.requestedTime}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleViewOrder(ret.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#E2E8F0] text-xs font-bold text-[#334155] hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye size={13} className="text-[#D97706]" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* ---------------- Footer Pagination ---------------- */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#F1F5F9]">
            <p className="text-xs font-semibold text-[#64748B]">
              Showing <span className="font-bold text-[#0F172A]">1 to 10</span> of{" "}
              <span className="font-bold text-[#0F172A]">
                {activeTab === "all" ? "1,248" : activeTab === "history" ? "762" : "24"}
              </span>{" "}
              orders/returns
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                    currentPage === p ? "bg-[#D97706] text-white" : "text-[#64748B] hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              ))}

              <span className="text-xs text-[#94A3B8] px-1">...</span>

              <button
                onClick={() => setCurrentPage(77)}
                className="w-8 h-8 rounded-xl text-xs font-bold text-[#64748B] hover:bg-slate-100 transition-colors"
              >
                {activeTab === "returns" ? "3" : "77"}
              </button>

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-2 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}