"use client";

import React, { useState, useEffect } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, ArrowLeft, FileText, Info } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface EnquiryItem {
  id: string;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  quantity: string;
  submittedOn: string;
  status: "New" | "Viewed";
  rawDate: string;
}

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" ? (value as ApiRecord) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function formatDate(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + ", " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function GiftQuoteEnquiries() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchQuery] = useState("");
  
  // View Single Enquiry Detail State
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);

  // Pagination (Strictly 5 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/enquiry/all-enquiry`, {
        method: "GET",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      const rawData = Array.isArray(json.data) ? json.data : (Array.isArray(json.enquiries) ? json.enquiries : []);

      const formatted: EnquiryItem[] = rawData.map((item: unknown) => {
        const raw = asRecord(item);
        const isRead = raw.is_read === true || raw.status === "Viewed" || raw.isSeen === true || raw.seen === true;
        const createdAtStr = asString(raw.createdAt) || new Date().toISOString();
        return {
          id: asString(raw.id) || asString(raw._id),
          name: asString(raw.name) || asString(raw.fullName) || "Customer",
          email: asString(raw.email) || asString(raw.businessEmail) || "",
          mobile: asString(raw.mobile) || "",
          subject: asString(raw.subject) || "Product query",
          message: asString(raw.message) || "",
          quantity: asString(raw.quantity) || asString(raw.expectedQuantity) || "50 - 100",
          submittedOn: formatDate(createdAtStr),
          status: isRead ? "Viewed" : "New",
          rawDate: createdAtStr,
        };
      });

      setEnquiries(formatted);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEnquiries();
  }, []);

  // Handle View Click
  const handleViewEnquiry = async (item: EnquiryItem) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/enquiry/seen-enquiry/${item.id}`, {
        method: "PUT",
        credentials: "include",
      });
      
      const json = await res.json().catch(() => ({}));
      const updatedData = json.data || {};

      setEnquiries((prev) =>
        prev.map((enq) => (enq.id === item.id ? { ...enq, status: "Viewed" } : enq))
      );

      setSelectedEnquiry({
        ...item,
        status: "Viewed",
        name: asString(updatedData.name) || item.name,
        email: asString(updatedData.email) || item.email,
        mobile: asString(updatedData.mobile) || item.mobile,
        subject: asString(updatedData.subject) || item.subject,
        message: asString(updatedData.message) || item.message,
      });
    } catch (error) {
      console.error("Error marking enquiry as seen:", error);
      setSelectedEnquiry({ ...item, status: "Viewed" });
    }
  };

  // Search Filter & Sorting Logic (New items on top)
  const filteredEnquiries = enquiries
    .filter((item) => {
      return (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (a.status === "New" && b.status !== "New") return -1;
      if (a.status !== "New" && b.status === "New") return 1;
      return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
    });

  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredEnquiries.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 🔍 VIEW DETAIL PAGE SCREEN
  if (selectedEnquiry) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-8 text-slate-900 font-sans">
        <div className="max-w-[1320px] mx-auto space-y-6">
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">View Enquiry</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">View the details of the quote request submitted from the website.</p>
            </div>
            <button
              onClick={() => setSelectedEnquiry(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-extrabold text-slate-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <ArrowLeft size={16} /> Back to List
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
              <h2 className="text-base font-black text-slate-900">Enquiry Details</h2>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="py-4 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Full Name</span>
                <span className="font-extrabold text-slate-900">{selectedEnquiry.name}</span>
              </div>
              <div className="py-4 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Business Email</span>
                <span className="font-extrabold text-slate-900">{selectedEnquiry.email}</span>
              </div>
              {selectedEnquiry.mobile && (
                <div className="py-4 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Mobile</span>
                  <span className="font-extrabold text-slate-900">{selectedEnquiry.mobile}</span>
                </div>
              )}
              {selectedEnquiry.subject && (
                <div className="py-4 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Subject</span>
                  <span className="font-extrabold text-slate-900">{selectedEnquiry.subject}</span>
                </div>
              )}
              {selectedEnquiry.message && (
                <div className="py-4 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Message</span>
                  <span className="font-extrabold text-slate-900">{selectedEnquiry.message}</span>
                </div>
              )}
              <div className="py-4 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Expected Quantity</span>
                <span className="font-extrabold text-slate-900">{selectedEnquiry.quantity}</span>
              </div>
              <div className="py-4 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Submitted On</span>
                <span className="font-extrabold text-slate-900">{selectedEnquiry.submittedOn}</span>
              </div>
              <div className="py-4 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Viewed
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Info size={20} />
              </div>
              <h2 className="text-base font-black text-slate-900">Additional Information</h2>
            </div>
            
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 flex items-center gap-3 text-xs sm:text-sm font-semibold text-emerald-800">
              <Info size={18} className="text-emerald-600 shrink-0" />
              This enquiry was submitted through the Get a Custom Quote form on the website.
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 📋 ENQUIRY LIST TABLE UI (5 items per page)
  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-[1320px] mx-auto space-y-6">

        {/* Header Section */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Gift Quote Enquiries</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">View all quote requests received from the website.</p>
        </div>

        {/* Search Bar Only */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex items-center">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200/60 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6 w-16">#</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Business Email</th>
                  <th className="py-4 px-6">Expected Quantity</th>
                  <th className="py-4 px-6">Submitted On</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">Loading enquiries...</td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">No enquiries found.</td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-slate-400 font-bold">{startIndex + index + 1}</td>
                      <td className="py-4 px-6 font-extrabold text-slate-900 text-sm">{item.name}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{item.email}</td>
                      <td className="py-4 px-6 text-slate-800 font-bold">{item.quantity}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{item.submittedOn}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold ${
                          item.status === "New" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === "New" ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleViewEnquiry(item)}
                          className="p-2 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="View Enquiry"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer (Strictly 5 items per page) */}
          <div className="py-4 px-6 border-t border-slate-100 flex justify-between items-center text-xs font-medium text-slate-500">
            <span>
              Showing {filteredEnquiries.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredEnquiries.length)} of {filteredEnquiries.length} enquiries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3.5 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#D97706] text-white"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}