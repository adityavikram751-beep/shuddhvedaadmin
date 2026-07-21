"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RotateCcw,
  Calendar,
  Info,
  Check,
  Search,
  ShoppingCart,
  ShoppingBag,
  Tag,
  User,
  Users,
} from "lucide-react";

// Mock Products Dataset
const mockProducts = [
  {
    id: "prod-1",
    name: "Raw Honey 250g",
    sku: "SKU: RH250",
    price: "₹299",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "prod-2",
    name: "Raw Honey 500g",
    sku: "SKU: RH500",
    price: "₹499",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "prod-3",
    name: "Wild Honey 1kg",
    sku: "SKU: WH1000",
    price: "₹799",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "prod-4",
    name: "Premium Gift Box",
    sku: "SKU: PGB01",
    price: "₹999",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=200",
  },
];

export default function CreatePromotionPage() {
  const router = useRouter();

  // Dynamic Form States
  const [promoName, setPromoName] = useState("Summer Special Offer");
  const [promoType, setPromoType] = useState<"Percentage" | "Fixed" | "FreeShipping" | "BOGO">("Percentage");
  const [couponCode, setCouponCode] = useState("HONEY20");
  const [discountValue, setDiscountValue] = useState("20");
  const [minOrderValue, setMinOrderValue] = useState("500");
  const [maxDiscount, setMaxDiscount] = useState("300");
  const [startDate, setStartDate] = useState("12 Jul 2026");
  const [endDate, setEndDate] = useState("31 Jul 2026");
  const [totalLimit, setTotalLimit] = useState("500");
  const [perCustomerLimit, setPerCustomerLimit] = useState("1");
  const [applicableScope, setApplicableScope] = useState<"All" | "Selected">("Selected");

  // Selected Products State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([
    "prod-1",
    "prod-2",
    "prod-3",
    "prod-4",
  ]);

  const [productSearch, setProductSearch] = useState("");

  // Handler: Generate Coupon Code
  const handleGenerateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "HONEY";
    for (let i = 0; i < 3; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponCode(code);
  };

  // Handler: Toggle Product Selection
  const toggleProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((pId) => pId !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  // Handler: Select / Deselect All
  const toggleSelectAll = () => {
    if (selectedProductIds.length === mockProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(mockProducts.map((p) => p.id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 text-[#0F172A] font-sans">
      <div className="max-w-[1280px] mx-auto space-y-6">

        {/* ---------------- Top Header ---------------- */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
              Create Promotion
            </h1>
            <p className="text-xs md:text-sm text-[#64748B] font-medium mt-0.5">
              Create a new coupon, discount or promotional offer.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              alert("Draft Saved!");
              router.push("/promotions");
            }}
            className="px-6 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            Save Draft
          </button>
        </div>

        {/* ---------------- Main Grid Layout ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* LEFT 2 COLUMNS: Form Inputs */}
          <div className="lg:col-span-2 space-y-6">

            {/* Block 1: Promotion Information */}
            <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
              <h3 className="text-sm font-extrabold text-[#0F172A]">Promotion Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Promotion Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155]">
                    Promotion Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={promoName}
                    onChange={(e) => setPromoName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                {/* Promotion Type Pills */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155]">
                    Promotion Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                    {[
                      { id: "Percentage", label: "Percentage" },
                      { id: "Fixed", label: "Fixed Amount" },
                      { id: "FreeShipping", label: "Free Shipping" },
                      { id: "BOGO", label: "BOGO" },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setPromoType(type.id as any)}
                        className={`px-3.5 py-2 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                          promoType === type.id
                            ? "border-[#D97706] bg-amber-50/60 text-[#D97706] ring-1 ring-[#D97706]"
                            : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full border ${
                            promoType === type.id
                              ? "border-[#D97706] bg-[#D97706]"
                              : "border-slate-300 bg-white"
                          }`}
                        />
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coupon Code Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#334155]">
                  Coupon Code <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold uppercase tracking-wider text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <RotateCcw size={13} className="text-[#64748B]" />
                    <span>Generate Code</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Block 2: Discount Details & Validity Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Discount Details Card */}
              <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                <h3 className="text-sm font-extrabold text-[#0F172A]">Discount Details</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#334155]">
                      Discount (%) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        className="w-full pl-3 pr-7 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#94A3B8]">%</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#334155]">Minimum Order Value (₹)</label>
                    <input
                      type="number"
                      value={minOrderValue}
                      onChange={(e) => setMinOrderValue(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#334155]">Maximum Discount (₹)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100/80 flex items-start gap-2.5 text-[11px] text-amber-800 font-medium">
                  <Info size={15} className="text-[#D97706] shrink-0 mt-0.5" />
                  <span>This discount will be applied based on the cart value.</span>
                </div>
              </div>

              {/* Validity & Usage Card */}
              <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                <h3 className="text-sm font-extrabold text-[#0F172A]">Validity & Usage</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#334155]">
                      Start Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                      />
                      <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#334155]">
                      End Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                      />
                      <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#334155]">Usage Limit (Total)</label>
                    <input
                      type="number"
                      value={totalLimit}
                      onChange={(e) => setTotalLimit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#334155]">Usage Limit (Per Customer)</label>
                    <input
                      type="number"
                      value={perCustomerLimit}
                      onChange={(e) => setPerCustomerLimit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>

                {/* Applicable Scope Radio Group */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-[#334155]">
                    Applicable On <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-6 text-xs font-bold text-[#334155]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scope"
                        checked={applicableScope === "All"}
                        onChange={() => setApplicableScope("All")}
                        className="accent-[#D97706]"
                      />
                      <span>All Products</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scope"
                        checked={applicableScope === "Selected"}
                        onChange={() => setApplicableScope("Selected")}
                        className="accent-[#D97706]"
                      />
                      <span>Selected Products</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT 1 COLUMN: Real-Time Ticket Preview */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-[#0F172A]">Promotion Preview</h3>

            {/* Ticket Card Container */}
            <div className="bg-white rounded-3xl p-4 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">

              {/* 🎟️ GOLDEN AMBER TICKET WITH EXACT SIDE NOTCHES */}
              <div className="rounded-2xl bg-[#D97706] text-white p-6 shadow-md relative overflow-hidden space-y-5">
                
                {/* Left Side Semi-Circle Notch */}
                <div className="absolute -left-3 top-[48%] h-6 w-6 rounded-full bg-white shadow-inner" />
                {/* Right Side Semi-Circle Notch */}
                <div className="absolute -right-3 top-[48%] h-6 w-6 rounded-full bg-white shadow-inner" />

                {/* Coupon Top Info */}
                <div className="text-center space-y-1">
                  <p className="text-[11px] font-extrabold tracking-widest text-amber-100 uppercase">
                    {couponCode || "COUPON"}
                  </p>
                  <h2 className="text-4xl font-black tracking-tight text-white">
                    {promoType === "FreeShipping" ? "FREE SHIPPING" : `${discountValue || "0"}% OFF`}
                  </h2>
                  {maxDiscount && (
                    <p className="text-[11px] font-bold text-amber-100">
                      Max. Discount ₹{maxDiscount}
                    </p>
                  )}
                </div>

                {/* Dashed Cut Line */}
                <div className="border-b border-dashed border-amber-300/60 my-2" />

                {/* Ticket Details */}
                <div className="space-y-2 text-[11px] font-semibold text-amber-50 px-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="shrink-0 text-amber-200" />
                    <span>Valid from {startDate} to {endDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShoppingBag size={13} className="shrink-0 text-amber-200" />
                    <span>Min. order value: ₹{minOrderValue}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag size={13} className="shrink-0 text-amber-200" />
                    <span>
                      Applies on {applicableScope === "All" ? "all products" : `${selectedProductIds.length} selected products`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users size={13} className="shrink-0 text-amber-200" />
                    <span>Total usage limit: {totalLimit}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User size={13} className="shrink-0 text-amber-200" />
                    <span>Per customer usage limit: {perCustomerLimit}</span>
                  </div>
                </div>

              </div>

              {/* Shopping Cart Bottom Graphic */}
              <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100/60 flex items-center justify-center min-h-[130px] relative overflow-hidden">
                <div className="relative flex items-center justify-center">
                  <ShoppingCart size={68} className="text-[#D97706]/75 stroke-[1.5]" />
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-[#D97706] text-white flex items-center justify-center font-black text-xs shadow-md">
                    %
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ---------------- Applicable Products Section ---------------- */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              Applicable Products <span className="text-[#64748B] font-semibold">({selectedProductIds.length} selected)</span>
            </h3>

            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors cursor-pointer"
            >
              <div className={`h-4 w-4 rounded border flex items-center justify-center ${selectedProductIds.length === mockProducts.length ? "bg-[#D97706] border-[#D97706] text-white" : "border-slate-300"}`}>
                {selectedProductIds.length === mockProducts.length && <Check size={11} />}
              </div>
              <span>Select All</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D97706]"
            />
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          </div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockProducts
              .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
              .map((product) => {
                const isSelected = selectedProductIds.includes(product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`bg-white rounded-3xl p-4 border transition-all cursor-pointer relative space-y-3 ${
                      isSelected
                        ? "border-[#D97706] shadow-sm ring-1 ring-[#D97706]"
                        : "border-[#F1F5F9] hover:border-slate-300"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`absolute top-3 left-3 h-5 w-5 rounded-lg flex items-center justify-center transition-all ${
                      isSelected ? "bg-[#D97706] text-white" : "border border-slate-300 bg-white"
                    }`}>
                      {isSelected && <Check size={12} />}
                    </div>

                    {/* Image */}
                    <div className="h-32 w-full rounded-2xl bg-slate-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="text-center space-y-0.5">
                      <p className="text-xs font-extrabold text-[#0F172A] line-clamp-1">{product.name}</p>
                      <p className="text-[10px] text-[#94A3B8] font-bold">{product.sku}</p>
                    </div>

                    {/* Footer Price & Status */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-xs font-black text-[#0F172A]">{product.price}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100/80 text-emerald-700">
                        {product.status}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* ---------------- Footer Action Bar ---------------- */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                alert("Saved as Draft!");
                router.push("/promotions");
              }}
              className="px-6 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#334155] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => {
                alert("Promotion Created Successfully!");
                router.push("/promotions");
              }}
              className="px-6 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold transition-colors shadow-md active:scale-95 cursor-pointer"
            >
              Create Promotion
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}