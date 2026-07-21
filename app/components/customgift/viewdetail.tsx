"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Gift,
  User,
  Phone,
  Mail,
  MapPin,
  Eye,
  Package,
  Sliders,
  Cake,
  Palette,
  FileText,
  Heart,
  Box,
  MessageSquare,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  Circle,
  Receipt,
  Pencil,
  ChevronRight,
  X,
  Check,
} from "lucide-react";

export default function CustomGiftOrderDetailsPage() {
  const router = useRouter();

  // State Management
  const [currentStatus, setCurrentStatus] = useState<string>("Processing");
  const [showUpdateModal, setShowModal] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>("Packed");
  const [adminNote, setAdminNote] = useState<string>("Gift packed nicely and ready for shipment.");
  const [orderIndex, setOrderIndex] = useState<number>(1052);

  // Status Change Handler
  const handleSaveStatus = () => {
    setCurrentStatus(newStatus);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen  text-slate-800 font-sans p-4 sm:p-8 pb-20">
      <div className="max-w-[1280px] mx-auto space-y-6">
        
        {/* 1. TOP HEADER & META BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <div className="w-10 h-10 rounded-2xl bg-amber-100/70 border border-amber-200 text-[#d9730d] flex items-center justify-center shrink-0">
              <Gift size={20} />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Custom Gift Order Details
              </h1>
              <p className="text-xs font-semibold text-slate-400">
                View complete details of the custom gift order.
              </p>
            </div>
          </div>

          {/* Right Order Meta Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 px-6 shadow-2xs flex items-center gap-8 text-xs">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                ORDER ID
              </p>
              <p className="font-black text-slate-900 mt-0.5 text-sm">CG-1001</p>
            </div>

            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                ORDER DATE
              </p>
              <p className="font-bold text-slate-800 mt-0.5">20 Jul 2026, 11:30 AM</p>
            </div>

            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                CURRENT STATUS
              </p>
              <span className="inline-block mt-0.5 px-3 py-0.5 rounded-full bg-[#e0f2fe] text-[#0284c7] font-black text-[10px]">
                {currentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* 2. TOP GRID (3 CARDS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CARD 1: Customer Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
              <User size={16} className="text-blue-500" />
              <span>Customer Information</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <User size={15} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">CUSTOMER NAME</p>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">Priya Sharma</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={15} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">MOBILE NUMBER</p>
                  <p className="font-bold text-slate-800 mt-0.5">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={15} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">EMAIL ADDRESS</p>
                  <p className="font-bold text-slate-800 mt-0.5">priya.sharma@email.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">DELIVERY ADDRESS</p>
                  <p className="font-bold text-slate-800 mt-0.5 leading-relaxed">
                    Flat 12, Green Valley Apartments, <br />
                    MG Road, Indore, <br />
                    Madhya Pradesh - 452001, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Gift Box Preview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
              <Eye size={16} className="text-purple-500" />
              <span>Gift Box Preview</span>
            </div>

            {/* Box Main Graphic Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 text-center min-h-[160px]">
              <img
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&auto=format&fit=crop&q=80"
                alt="Gift Box"
                className="w-20 h-20 object-contain rounded-xl shadow-xs"
              />
              <span className="text-lg font-black text-slate-800 tracking-wider">iMAGE</span>
            </div>

            {/* 3 Gift Box Tags Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-2.5">
                <Gift size={14} className="text-[#d9730d] mx-auto mb-1" />
                <p className="text-[8px] font-extrabold text-slate-400 uppercase">GIFT BOX TYPE</p>
                <p className="text-[10px] font-extrabold text-slate-800 mt-0.5">Premium Gift Box</p>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-2.5">
                <Box size={14} className="text-[#d9730d] mx-auto mb-1" />
                <p className="text-[8px] font-extrabold text-slate-400 uppercase">BOX SIZE</p>
                <p className="text-[10px] font-extrabold text-slate-800 mt-0.5">Medium</p>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-2.5">
                <Sliders size={14} className="text-[#d9730d] mx-auto mb-1" />
                <p className="text-[8px] font-extrabold text-slate-400 uppercase">PACKAGING STYLE</p>
                <p className="text-[10px] font-extrabold text-slate-800 mt-0.5">Luxury Black Box</p>
              </div>
            </div>
          </div>

          {/* CARD 3: Selected Products Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
                <Package size={16} className="text-emerald-500" />
                <span>Selected Products</span>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider py-2.5 border-b border-slate-100">
                <span className="col-span-6">Product</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-center">Weight</span>
                <span className="col-span-2 text-right">Price</span>
              </div>

              {/* Products List */}
              <div className="divide-y divide-slate-50 text-xs">
                {/* Item 1 */}
                <div className="grid grid-cols-12 items-center py-2.5">
                  <div className="col-span-6 flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=80&auto=format&fit=crop&q=60"
                      alt="Wild Forest Honey"
                      className="w-8 h-8 rounded-lg object-cover border border-slate-100"
                    />
                    <span className="font-extrabold text-slate-800 leading-tight">
                      Wild Forest Honey
                    </span>
                  </div>
                  <span className="col-span-2 text-center font-extrabold text-slate-700">2</span>
                  <span className="col-span-2 text-center font-bold text-slate-500 text-[11px]">500g</span>
                  <span className="col-span-2 text-right font-black text-slate-900">₹850.00</span>
                </div>

                {/* Item 2 */}
                <div className="grid grid-cols-12 items-center py-2.5">
                  <div className="col-span-6 flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=80&auto=format&fit=crop&q=60"
                      alt="Raw Multi Flora Honey"
                      className="w-8 h-8 rounded-lg object-cover border border-slate-100"
                    />
                    <span className="font-extrabold text-slate-800 leading-tight">
                      Raw Multi Flora Honey
                    </span>
                  </div>
                  <span className="col-span-2 text-center font-extrabold text-slate-700">1</span>
                  <span className="col-span-2 text-center font-bold text-slate-500 text-[11px]">250g</span>
                  <span className="col-span-2 text-right font-black text-slate-900">₹450.00</span>
                </div>

                {/* Item 3 */}
                <div className="grid grid-cols-12 items-center py-2.5">
                  <div className="col-span-6 flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=80&auto=format&fit=crop&q=60"
                      alt="Bee Pollen"
                      className="w-8 h-8 rounded-lg object-cover border border-slate-100"
                    />
                    <span className="font-extrabold text-slate-800 leading-tight">
                      Bee Pollen
                    </span>
                  </div>
                  <span className="col-span-2 text-center font-extrabold text-slate-700">1</span>
                  <span className="col-span-2 text-center font-bold text-slate-500 text-[11px]">100g</span>
                  <span className="col-span-2 text-right font-black text-slate-900">₹350.00</span>
                </div>
              </div>
            </div>

            {/* Table Footer Summary */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Total Items: 4</span>
              <span>Total Weight: 1.35kg</span>
            </div>
          </div>

        </div>

        {/* 3. BOTTOM GRID (3 CARDS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CARD 4: Customization Details (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
              <Sliders size={16} className="text-pink-500" />
              <span>Customization Details</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              
              {/* Occasion */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                  <Cake size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">OCCASION</p>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">Birthday</p>
                </div>
              </div>

              {/* Special Packaging */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Box size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">SPECIAL PACKAGING</p>
                  <p className="font-extrabold text-slate-900 text-xs mt-0.5 leading-snug">
                    Yes (Premium Black Box)
                  </p>
                </div>
              </div>

              {/* Ribbon Color */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Palette size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">RIBBON COLOR</p>
                  <p className="font-extrabold text-slate-900 text-xs mt-0.5">Golden</p>
                </div>
              </div>

              {/* Personal Note */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                  <MessageSquare size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">PERSONAL NOTE</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5 leading-snug">
                    Thank you for always being there!
                  </p>
                </div>
              </div>

              {/* Greeting Card Message */}
              <div className="col-span-2 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <FileText size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">GREETING CARD MESSAGE</p>
                  <p className="font-extrabold text-slate-900 text-xs mt-0.5 leading-relaxed">
                    Happy Birthday! Wishing you good health and happiness always.
                  </p>
                </div>
              </div>

              {/* Custom Image / Logo */}
              <div className="col-span-2 flex items-start gap-2.5 pt-1">
                <div className="w-8 h-8 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                  <ImageIcon size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">CUSTOM IMAGE / LOGO</p>
                  <div className="mt-1.5 w-24 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60"
                      alt="Velocity Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Sender Name */}
              <div className="col-span-2 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                  <User size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">SENDER NAME</p>
                  <p className="font-extrabold text-slate-900 text-xs mt-0.5">Amit Sharma</p>
                </div>
              </div>

            </div>
          </div>

          {/* CARD 5: Order Timeline (3 Cols) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
              <Clock size={16} className="text-blue-500" />
              <span>Order Timeline</span>
            </div>

            <div className="relative border-l-2 border-slate-100 ml-3.5 space-y-6 text-xs pl-5 py-1">
              
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white">
                  <Check size={9} className="stroke-[3]" />
                </div>
                <p className="font-extrabold text-slate-900">Order Received</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">20 Jul 2026, 11:30 AM</p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white">
                  <Check size={9} className="stroke-[3]" />
                </div>
                <p className="font-extrabold text-slate-900">Payment Received</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">20 Jul 2026, 11:32 AM</p>
              </div>

              {/* Step 3 (Current) */}
              <div className="relative">
                <div className="absolute -left-[28px] top-0.5 w-4 h-4 rounded-full border-2 border-blue-500 bg-white flex items-center justify-center ring-4 ring-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-blue-600">Processing</p>
                    <p className="text-[10px] font-semibold text-blue-400 mt-0.5">20 Jul 2026, 02:15 PM</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-extrabold">
                    Current Status
                  </span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-200 ring-4 ring-white" />
                <p className="font-extrabold text-slate-400">Packed</p>
                <p className="text-[10px] font-semibold text-slate-300 mt-0.5">-</p>
              </div>

              {/* Step 5 */}
              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-200 ring-4 ring-white" />
                <p className="font-extrabold text-slate-400">Shipped</p>
                <p className="text-[10px] font-semibold text-slate-300 mt-0.5">-</p>
              </div>

              {/* Step 6 */}
              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-200 ring-4 ring-white" />
                <p className="font-extrabold text-slate-400">Delivered</p>
                <p className="text-[10px] font-semibold text-slate-300 mt-0.5">-</p>
              </div>

            </div>
          </div>

          {/* CARD 6: Payment Summary (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
                <Receipt size={16} className="text-emerald-500" />
                <span>Payment Summary</span>
              </div>

              <div className="space-y-3 text-xs pt-2">
                <div className="flex justify-between items-center text-slate-500 font-semibold">
                  <span>Subtotal (4 Items)</span>
                  <span className="font-black text-slate-800">₹1,650.00</span>
                </div>

                <div className="flex justify-between items-center text-slate-500 font-semibold">
                  <span>Packaging Charges</span>
                  <span className="font-black text-slate-800">₹300.00</span>
                </div>

                <div className="flex justify-between items-center text-slate-500 font-semibold">
                  <span>Shipping Charges</span>
                  <span className="font-black text-slate-800">₹150.00</span>
                </div>

                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-₹150.00</span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-slate-900">Total Amount</span>
                  <span className="text-2xl font-black text-slate-900">₹1,950.00</span>
                </div>
              </div>
            </div>

            {/* Inner Light Green Box */}
            <div className="bg-[#f2fcf6] border border-emerald-100 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Payment Method</span>
                <span className="font-black text-slate-900">UPI</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Payment Status</span>
                <span className="font-black text-[#16a34a]">Paid</span>
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold">Transaction ID</span>
                <span className="font-mono font-black text-slate-700">UPI-456789123456</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4. BOTTOM PAGINATION & ACTION BAR */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/60">
          
          <button
            onClick={() => setOrderIndex((p) => Math.max(p - 1, 1000))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={14} />
            <span>Previous Order</span>
          </button>

          <p className="text-xs font-bold text-slate-400">
            <strong className="text-slate-800 font-black">{orderIndex}</strong> of 248 Orders
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Open Update Status Modal Popup Button */}
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Pencil size={14} />
              <span>Update Status</span>
            </button>

            <button
              onClick={() => setOrderIndex((p) => p + 1)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>Next Order</span>
              <ChevronRight size={14} />
            </button>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 5. UPDATE ORDER STATUS MODAL POPUP (MATCHES 4TH IMAGE)  */}
      {/* ======================================================== */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 space-y-6 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Update Order Status
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  Update the status of this custom gift order.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              
              {/* Order ID & Current Status Row */}
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase">ORDER ID</p>
                  <p className="font-black text-slate-900 text-sm mt-0.5">CG-1001</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase">CURRENT STATUS</p>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-[#e0f2fe] text-[#0284c7] font-black text-[10px]">
                    {currentStatus}
                  </span>
                </div>
              </div>

              {/* New Status Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  New Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#d9730d] cursor-pointer appearance-none"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Admin Note Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Admin Note <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Enter note about this status update..."
                  maxLength={200}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#d9730d] placeholder-slate-400 leading-relaxed resize-none"
                />
                <p className="text-[10px] text-slate-400 font-medium text-right mt-1">
                  {adminNote.length}/200
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveStatus}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Check size={15} className="stroke-[3]" />
                <span>Update Status</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}