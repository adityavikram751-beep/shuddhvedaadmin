"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  Search,
  Calendar,
  RotateCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface OrderItem {
  id: string;
  itemsCount: number;
  customer: string;
  phone: string;
  date: string;
  time: string;
  method: string;
  methodBadge: string;
  paymentStatus: "Paid" | "Pending";
  amount: string;
  orderStatus: string;
}

const deliveredOrdersData: OrderItem[] = [
  {
    id: "ORD-1052",
    itemsCount: 3,
    customer: "Priya Sharma",
    phone: "+91 98765 43210",
    date: "12 Jul 2026",
    time: "09:20 AM",
    method: "UPI",
    methodBadge: "UPI",
    paymentStatus: "Paid",
    amount: "₹2,450.00",
    orderStatus: "Delivered",
  },
  {
    id: "ORD-1051",
    itemsCount: 2,
    customer: "Amit Kumar",
    phone: "+91 91234 56789",
    date: "11 Jul 2026",
    time: "04:15 PM",
    method: "COD",
    methodBadge: "COD",
    paymentStatus: "Pending",
    amount: "₹980.00",
    orderStatus: "Delivered",
  },
  {
    id: "ORD-1050",
    itemsCount: 4,
    customer: "Neha Singh",
    phone: "+91 99876 12345",
    date: "10 Jul 2026",
    time: "11:30 AM",
    method: "Card",
    methodBadge: "CARD",
    paymentStatus: "Paid",
    amount: "₹1,750.00",
    orderStatus: "Delivered",
  },
  {
    id: "ORD-1049",
    itemsCount: 2,
    customer: "Rahul Verma",
    phone: "+91 88990 11223",
    date: "09 Jul 2026",
    time: "02:45 PM",
    method: "Net Banking",
    methodBadge: "BANK",
    paymentStatus: "Paid",
    amount: "₹1,250.00",
    orderStatus: "Delivered",
  },
  {
    id: "ORD-1048",
    itemsCount: 1,
    customer: "Sneha Patel",
    phone: "+91 77889 33445",
    date: "09 Jul 2026",
    time: "10:20 AM",
    method: "COD",
    methodBadge: "COD",
    paymentStatus: "Pending",
    amount: "₹890.00",
    orderStatus: "Delivered",
  },
  {
    id: "ORD-1047",
    itemsCount: 3,
    customer: "Vikram Mehta",
    phone: "+91 77665 77889",
    date: "08 Jul 2026",
    time: "09:10 PM",
    method: "UPI",
    methodBadge: "UPI",
    paymentStatus: "Paid",
    amount: "₹3,150.00",
    orderStatus: "Delivered",
  },
  {
    id: "ORD-1046",
    itemsCount: 1,
    customer: "Anjali Gupta",
    phone: "+91 88776 65544",
    date: "08 Jul 2026",
    time: "01:05 PM",
    method: "Card",
    methodBadge: "CARD",
    paymentStatus: "Paid",
    amount: "₹650.00",
    orderStatus: "Delivered",
  },
  {
    id: "ORD-1045",
    itemsCount: 2,
    customer: "Manish Jain",
    phone: "+91 99887 66554",
    date: "07 Jul 2026",
    time: "05:40 PM",
    method: "Net Banking",
    methodBadge: "BANK",
    paymentStatus: "Paid",
    amount: "₹2,100.00",
    orderStatus: "Delivered",
  },
];

export default function DeliveredOrdersPage() {
  // State Filter Controls
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("This Month");
  const [orderStatus, setOrderStatus] = useState("All");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset Filters
  const handleReset = () => {
    setSearch("");
    setDateRange("This Month");
    setOrderStatus("All");
    setPaymentStatus("All");
    setPaymentMethod("All");
    setCurrentPage(1);
  };

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return deliveredOrdersData.filter((order) => {
      const matchesSearch =
        search.trim() === "" ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase()) ||
        order.phone.toLowerCase().includes(search.toLowerCase());

      const matchesPaymentStatus =
        paymentStatus === "All" || order.paymentStatus === paymentStatus;

      const matchesPaymentMethod =
        paymentMethod === "All" ||
        order.method.toLowerCase().includes(paymentMethod.toLowerCase());

      return matchesSearch && matchesPaymentStatus && matchesPaymentMethod;
    });
  }, [search, paymentStatus, paymentMethod]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Order ID",
      "Items Count",
      "Customer",
      "Phone",
      "Date",
      "Time",
      "Payment Method",
      "Payment Status",
      "Amount",
      "Order Status",
    ];

    const rows = filteredOrders.map((o) => [
      o.id,
      o.itemsCount,
      `"${o.customer}"`,
      `"${o.phone}"`,
      o.date,
      o.time,
      o.method,
      o.paymentStatus,
      `"${o.amount}"`,
      o.orderStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `delivered_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen  text-slate-800 font-sans p-4 sm:p-8 space-y-6">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-[1280px] mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Delivered Orders
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            View and manage all orders received from your store.
          </p>
        </div>

        {/* Download / Export Dropdown Button */}
        <div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-xs font-bold text-[#d9730d] transition-all shadow-sm cursor-pointer"
          >
            <Download size={14} className="text-[#d9730d]" />
            <span>Download / Export</span>
            <ChevronDown size={14} className="text-[#d9730d]" />
          </button>
        </div>
      </div>

      {/* 2. MAIN CARD (SEARCH, FILTERS & TABLE) */}
      <div className="max-w-[1280px] mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-6">
        
        {/* Search Field (Full Width with Right Icon) */}
        <div className="relative w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Customer Name, Phone..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#d9730d] bg-white"
          />
          <Search
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Date Range Selector */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer">
              <Calendar size={14} className="text-slate-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent appearance-none pr-5 focus:outline-none cursor-pointer"
              >
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
                <option value="All Time">All Time</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Order Status Selector */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer">
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="bg-transparent appearance-none pr-5 focus:outline-none cursor-pointer"
              >
                <option value="All">Order Status</option>
                <option value="Delivered">Delivered</option>
                <option value="Shipped">Shipped</option>
                <option value="Pending">Pending</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Payment Status Selector */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer">
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="bg-transparent appearance-none pr-5 focus:outline-none cursor-pointer"
              >
                <option value="All">Payment Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="bg-transparent appearance-none pr-5 focus:outline-none cursor-pointer"
              >
                <option value="All">Payment Method</option>
                <option value="UPI">UPI</option>
                <option value="COD">COD</option>
                <option value="Card">Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#d9730d] hover:underline cursor-pointer"
          >
            <RotateCw size={13} />
            <span>Reset</span>
          </button>
        </div>

        {/* 3. ORDERS DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#f7f5f2] border-b border-slate-200/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">ORDER ID</th>
                <th className="py-3.5 px-4">PRODUCTS</th>
                <th className="py-3.5 px-4">CUSTOMER</th>
                <th className="py-3.5 px-4">DATE &amp; TIME ↑↓</th>
                <th className="py-3.5 px-4">PAYMENT METHOD</th>
                <th className="py-3.5 px-4">PAYMENT STATUS</th>
                <th className="py-3.5 px-4">AMOUNT</th>
                <th className="py-3.5 px-4 text-right">ORDER STATUS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    No delivered orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Order ID */}
                    <td className="py-4 px-4 font-extrabold text-slate-900">{order.id}</td>

                    {/* Products Thumbnail Stack + Pill */}
                    <td className="py-4 px-4">
                      <div className="relative flex items-center">
                        <div className="w-10 h-7 rounded-lg bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 border border-slate-200 shadow-xs shrink-0" />
                        <span className="ml-2 px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px] shrink-0">
                          {order.itemsCount} {order.itemsCount > 1 ? "Items" : "Item"}
                        </span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-slate-900">{order.customer}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                        {order.phone}
                      </p>
                    </td>

                    {/* Date & Time */}
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-slate-800">{order.date}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                        {order.time}
                      </p>
                    </td>

                    {/* Payment Method Badge + Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold text-[9px] uppercase tracking-wider">
                          {order.methodBadge}
                        </span>
                        <span className="font-bold text-slate-700">{order.method}</span>
                      </div>
                    </td>

                    {/* Payment Status Pill */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                          order.paymentStatus === "Paid"
                            ? "bg-[#e8f8ee] text-[#16a34a]"
                            : "bg-[#fff3e6] text-[#d9730d]"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 font-black text-slate-900 text-sm">
                      {order.amount}
                    </td>

                    {/* Order Status Badge (Exact Green Delivered Pill) */}
                    <td className="py-4 px-4 text-right">
                      <span className="px-3.5 py-1 rounded-full bg-[#e8f8ee] text-[#16a34a] font-extrabold text-[10px]">
                        Delivered
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. PAGINATION FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <p className="font-medium">
            Showing <strong className="text-slate-800">1 to 10</strong> of{" "}
            <strong className="text-slate-800">1,248</strong> orders
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              onClick={() => setCurrentPage(1)}
              className="w-7 h-7 rounded-xl bg-[#d9730d] text-white font-extrabold text-xs flex items-center justify-center shadow-xs cursor-pointer"
            >
              1
            </button>

            <button
              onClick={() => setCurrentPage(2)}
              className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center justify-center cursor-pointer"
            >
              2
            </button>

            <button
              onClick={() => setCurrentPage(3)}
              className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center justify-center cursor-pointer"
            >
              3
            </button>

            <button
              onClick={() => setCurrentPage(4)}
              className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center justify-center cursor-pointer"
            >
              4
            </button>

            <button
              onClick={() => setCurrentPage(5)}
              className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center justify-center cursor-pointer"
            >
              5
            </button>

            <span className="px-1 text-slate-400 font-bold">...</span>

            <button
              onClick={() => setCurrentPage(125)}
              className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center justify-center cursor-pointer"
            >
              125
            </button>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}