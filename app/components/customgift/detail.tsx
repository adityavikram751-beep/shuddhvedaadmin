"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Gift,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Download,
  Search,
  Calendar,
  ChevronDown,
  RotateCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Cake,
  Heart,
  Briefcase,
  Sparkles,
  Check,
} from "lucide-react";

interface CustomGiftOrder {
  id: string;
  previewImg: string;
  customer: string;
  phone: string;
  occasion: string;
  occasionType: "birthday" | "wedding" | "anniversary" | "corporate" | "festival";
  deliveryDate: string;
  deliveryDay: string;
  amount: string;
  paymentStatus: "Paid" | "Pending";
  orderStatus: "Processing" | "Packed" | "Pending" | "Shipped" | "Delivered";
}

const customGiftOrdersData: CustomGiftOrder[] = [
  {
    id: "CG-1001",
    previewImg: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&auto=format&fit=crop&q=60",
    customer: "Priya Sharma",
    phone: "+91 98765 43210",
    occasion: "Birthday",
    occasionType: "birthday",
    deliveryDate: "25 Jul 2026",
    deliveryDay: "Friday",
    amount: "₹2,450.00",
    paymentStatus: "Paid",
    orderStatus: "Processing",
  },
  {
    id: "CG-1002",
    previewImg: "https://images.unsplash.com/photo-1513885535751-8b9238bd4314?w=100&auto=format&fit=crop&q=60",
    customer: "Amit Kumar",
    phone: "+91 91234 56789",
    occasion: "Wedding",
    occasionType: "wedding",
    deliveryDate: "28 Jul 2026",
    deliveryDay: "Monday",
    amount: "₹1,850.00",
    paymentStatus: "Paid",
    orderStatus: "Packed",
  },
  {
    id: "CG-1003",
    previewImg: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=100&auto=format&fit=crop&q=60",
    customer: "Neha Singh",
    phone: "+91 99876 12345",
    occasion: "Anniversary",
    occasionType: "anniversary",
    deliveryDate: "30 Jul 2026",
    deliveryDay: "Wednesday",
    amount: "₹3,250.00",
    paymentStatus: "Pending",
    orderStatus: "Pending",
  },
  {
    id: "CG-1004",
    previewImg: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&auto=format&fit=crop&q=60",
    customer: "Rahul Verma",
    phone: "+91 88990 11223",
    occasion: "Corporate",
    occasionType: "corporate",
    deliveryDate: "02 Aug 2026",
    deliveryDay: "Saturday",
    amount: "₹4,800.00",
    paymentStatus: "Paid",
    orderStatus: "Shipped",
  },
  {
    id: "CG-1005",
    previewImg: "https://images.unsplash.com/photo-1513885535751-8b9238bd4314?w=100&auto=format&fit=crop&q=60",
    customer: "Sneha Patel",
    phone: "+91 77889 33445",
    occasion: "Festival",
    occasionType: "festival",
    deliveryDate: "04 Aug 2026",
    deliveryDay: "Monday",
    amount: "₹2,950.00",
    paymentStatus: "Paid",
    orderStatus: "Processing",
  },
];

// --- 🌟 BEAUTIFUL CUSTOM FLOATING DROPDOWN COMPONENT (NO NATIVE HTML SELECT) ---
function CustomFilterDropdown({
  label,
  value,
  options,
  onSelect,
  icon: Icon,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
  icon?: React.ElementType;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col relative">
      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl border bg-white hover:border-[#d9730d] text-xs font-bold text-slate-700 transition-all shadow-xs cursor-pointer ${
          open ? "border-[#d9730d] ring-2 ring-[#d9730d]/10" : "border-slate-200"
        }`}
      >
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={14} className="text-slate-400 shrink-0" />}
          <span>{value}</span>
        </div>
        <ChevronDown
          size={13}
          className={`text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-[#d9730d]" : ""
          }`}
        />
      </button>

      {/* Floating Modern Popup Menu */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
            {options.map((option) => {
              const isSelected = option === value;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-amber-50 text-[#d9730d] font-extrabold"
                      : "text-slate-600 font-semibold hover:bg-slate-50"
                  }`}
                >
                  <span>{option}</span>
                  {isSelected && <Check size={14} className="text-[#d9730d]" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function CustomGiftOrdersPage() {
  const router = useRouter();

  // Filters State
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("This Month");
  const [giftOccasion, setGiftOccasion] = useState("All");
  const [orderStatus, setOrderStatus] = useState("All");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Navigate to Detail Page
  const handleViewOrder = (orderId: string) => {
    router.push(`/customgift/viewdetail`);
  };

  // Reset Filters
  const handleReset = () => {
    setSearch("");
    setDateRange("This Month");
    setGiftOccasion("All");
    setOrderStatus("All");
    setPaymentStatus("All");
    setCurrentPage(1);
  };

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return customGiftOrdersData.filter((order) => {
      const matchesSearch =
        search.trim() === "" ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase()) ||
        order.phone.toLowerCase().includes(search.toLowerCase());

      const matchesOccasion =
        giftOccasion === "All" || order.occasion === giftOccasion;

      const matchesOrderStatus =
        orderStatus === "All" || order.orderStatus === orderStatus;

      const matchesPaymentStatus =
        paymentStatus === "All" || order.paymentStatus === paymentStatus;

      return (
        matchesSearch &&
        matchesOccasion &&
        matchesOrderStatus &&
        matchesPaymentStatus
      );
    });
  }, [search, giftOccasion, orderStatus, paymentStatus]);

  // Occasion Badge Icon Renderer
  const renderOccasionIcon = (type: CustomGiftOrder["occasionType"]) => {
    switch (type) {
      case "birthday":
        return (
          <div className="w-6 h-6 rounded-md bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
            <Cake size={13} />
          </div>
        );
      case "wedding":
        return (
          <div className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Heart size={13} />
          </div>
        );
      case "anniversary":
        return (
          <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Heart size={13} />
          </div>
        );
      case "corporate":
        return (
          <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Briefcase size={13} />
          </div>
        );
      case "festival":
        return (
          <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles size={13} />
          </div>
        );
      default:
        return null;
    }
  };

  // Status Pill Styling Renderer
  const renderOrderStatusPill = (status: CustomGiftOrder["orderStatus"]) => {
    switch (status) {
      case "Processing":
        return (
          <span className="px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0284c7] font-extrabold text-[10px]">
            Processing
          </span>
        );
      case "Packed":
        return (
          <span className="px-3 py-1 rounded-full bg-[#f3e8ff] text-[#9333ea] font-extrabold text-[10px]">
            Packed
          </span>
        );
      case "Pending":
        return (
          <span className="px-3 py-1 rounded-full bg-[#fff3e6] text-[#d9730d] font-extrabold text-[10px]">
            Pending
          </span>
        );
      case "Shipped":
        return (
          <span className="px-3 py-1 rounded-full bg-[#e0f2fe] text-[#2563eb] font-extrabold text-[10px]">
            Shipped
          </span>
        );
      case "Delivered":
        return (
          <span className="px-3 py-1 rounded-full bg-[#e8f8ee] text-[#16a34a] font-extrabold text-[10px]">
            Delivered
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen  text-slate-800 font-sans p-4 sm:p-8 space-y-6">
      
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100/70 border border-amber-200 text-[#d9730d] flex items-center justify-center shrink-0">
            <Gift size={20} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Custom Gift Orders
            </h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Manage all personalized gift box orders placed by customers.
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-xs font-bold text-[#d9730d] transition-all shadow-xs cursor-pointer"
          >
            <Download size={14} className="text-[#d9730d]" />
            <span>Export</span>
            <ChevronDown size={14} className="text-[#d9730d]" />
          </button>
        </div>
      </div>

      {/* 2. STATS SUMMARY CARDS (CLICKABLE CARDS THAT FILTER THE TABLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1280px] mx-auto">
        
        {/* Card 1: Total Gift Orders */}
        <div
          onClick={() => setOrderStatus("All")}
          className={`rounded-3xl border p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all hover:border-[#d9730d] ${
            orderStatus === "All" ? "bg-amber-50/40 border-[#d9730d]" : "bg-white border-slate-200/80"
          }`}
        >
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              TOTAL GIFT ORDERS
            </p>
            <p className="text-3xl font-black text-slate-900">86</p>
            <p className="text-[10px] font-semibold text-slate-400">All time</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#d9730d] flex items-center justify-center shrink-0">
            <Gift size={22} />
          </div>
        </div>

        {/* Card 2: Processing */}
        <div
          onClick={() => setOrderStatus("Processing")}
          className={`rounded-3xl border p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all hover:border-blue-400 ${
            orderStatus === "Processing" ? "bg-blue-50/40 border-blue-500" : "bg-white border-slate-200/80"
          }`}
        >
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              PROCESSING
            </p>
            <p className="text-3xl font-black text-slate-900">28</p>
            <p className="text-[10px] font-semibold text-blue-500">Orders in progress</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Card 3: Shipped */}
        <div
          onClick={() => setOrderStatus("Shipped")}
          className={`rounded-3xl border p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all hover:border-purple-400 ${
            orderStatus === "Shipped" ? "bg-purple-50/40 border-purple-500" : "bg-white border-slate-200/80"
          }`}
        >
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              SHIPPED
            </p>
            <p className="text-3xl font-black text-slate-900">18</p>
            <p className="text-[10px] font-semibold text-purple-500">On the way</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
            <Truck size={22} />
          </div>
        </div>

        {/* Card 4: Delivered */}
        <div
          onClick={() => setOrderStatus("Delivered")}
          className={`rounded-3xl border p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all hover:border-emerald-400 ${
            orderStatus === "Delivered" ? "bg-emerald-50/40 border-emerald-500" : "bg-white border-slate-200/80"
          }`}
        >
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              DELIVERED
            </p>
            <p className="text-3xl font-black text-slate-900">40</p>
            <p className="text-[10px] font-semibold text-emerald-500">Successfully delivered</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
        </div>

      </div>

      {/* 3. MAIN CONTENT CARD (SEARCH, CUSTOM DROPDOWNS & TABLE) */}
      <div className="max-w-[1280px] mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
        
        {/* Search & Filters Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, Customer Name, Phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#d9730d]"
            />
          </div>

          {/* Clean Custom Filter Dropdowns */}
          <div className="flex items-end gap-3 flex-wrap">
            
            <CustomFilterDropdown
              label="DATE RANGE"
              value={dateRange}
              options={["This Month", "This Year", "All Time"]}
              onSelect={setDateRange}
              icon={Calendar}
            />

            <CustomFilterDropdown
              label="GIFT OCCASION"
              value={giftOccasion}
              options={["All", "Birthday", "Wedding", "Anniversary", "Corporate", "Festival"]}
              onSelect={setGiftOccasion}
            />

            <CustomFilterDropdown
              label="ORDER STATUS"
              value={orderStatus}
              options={["All", "Processing", "Packed", "Pending", "Shipped", "Delivered"]}
              onSelect={setOrderStatus}
            />

            <CustomFilterDropdown
              label="PAYMENT STATUS"
              value={paymentStatus}
              options={["All", "Paid", "Pending"]}
              onSelect={setPaymentStatus}
            />

            <button
              onClick={handleReset}
              className="mb-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#d9730d] hover:underline cursor-pointer"
            >
              <RotateCw size={13} />
              <span>Reset</span>
            </button>

          </div>
        </div>

        {/* 4. ORDERS DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-[#f7f5f2] border-b border-slate-200/60 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">ORDER ID</th>
                <th className="py-3 px-4">GIFT PREVIEW</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">OCCASION</th>
                <th className="py-3 px-4">DELIVERY DATE</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">PAYMENT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-center"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                    No gift orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    <td className="py-3.5 px-4 font-black text-slate-900">{order.id}</td>

                    <td className="py-3.5 px-4">
                      <img
                        src={order.previewImg}
                        alt="Gift Preview"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 shadow-xs"
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-slate-900">{order.customer}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                        {order.phone}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {renderOccasionIcon(order.occasionType)}
                        <span className="font-extrabold text-slate-800">{order.occasion}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-slate-800">{order.deliveryDate}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                        {order.deliveryDay}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      {order.amount}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold ${
                          order.paymentStatus === "Paid"
                            ? "bg-[#e8f8ee] text-[#16a34a]"
                            : "bg-[#fff3e6] text-[#d9730d]"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {renderOrderStatusPill(order.orderStatus)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="w-12 h-7 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-400 hover:text-[#d9730d] hover:border-amber-300 flex items-center justify-center transition-all cursor-pointer mx-auto"
                        title="View Gift Order Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5. PAGINATION FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <p className="font-medium">
            Showing <strong className="text-slate-800">1 to 10</strong> of{" "}
            <strong className="text-slate-800">86</strong> custom gift orders
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
              onClick={() => setCurrentPage(9)}
              className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center justify-center cursor-pointer"
            >
              9
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, 9))}
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