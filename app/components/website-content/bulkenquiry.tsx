"use client";

import React, { useState, useEffect } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, ArrowLeft, FileText, Info } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface EnquiryItem {
  id: string;
  fullName: string;
  businessEmail: string;
  expectedQuantity: string;
  submittedOn: string;
  status: "pending" | "contacted" | "confirmed" | "rejected";
  adminNotes: string;
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

export default function BulkEnquiries() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchQuery] = useState("");
  
  // View Detail & Status Update States
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [newStatus, setNewStatus] = useState<"pending" | "contacted" | "confirmed" | "rejected">("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  // Pagination (Strictly 5 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bulkorder/enquiry/all-enquiry`, {
        method: "GET",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      const rawData = Array.isArray(json.data) ? json.data : (Array.isArray(json.enquiries) ? json.enquiries : []);

      const formatted: EnquiryItem[] = rawData.map((item: unknown) => {
        const raw = asRecord(item);
        const createdAtStr = asString(raw.createdAt) || new Date().toISOString();
        const statusVal = asString(raw.status).toLowerCase();
        const validStatus = ["pending", "contacted", "confirmed", "rejected"].includes(statusVal) 
          ? (statusVal as EnquiryItem["status"]) 
          : "pending";

        return {
          id: asString(raw.id) || asString(raw._id),
          fullName: asString(raw.full_name) || asString(raw.name) || asString(raw.fullName) || "Customer",
          businessEmail: asString(raw.business_email) || asString(raw.email) || "",
          expectedQuantity: asString(raw.expected_quantity) || asString(raw.quantity) || "50 - 100",
          submittedOn: formatDate(createdAtStr),
          status: validStatus,
          adminNotes: asString(raw.admin_notes) || "",
          rawDate: createdAtStr,
        };
      });

      setEnquiries(formatted);
    } catch (error) {
      console.error("Error fetching bulk enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEnquiries();
  }, []);

  // Open Detail View
  const handleViewEnquiry = (item: EnquiryItem) => {
    setSelectedEnquiry(item);
    setNewStatus(item.status);
    setAdminNotes(item.adminNotes);
  };

  // Update Status & Admin Notes via PUT API -> Redirects to list page on success
  const handleUpdateEnquiry = async () => {
    if (!selectedEnquiry) return;
    setUpdating(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bulkorder/enquiry/update-enquiry/${selectedEnquiry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
          admin_notes: adminNotes,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.message || "Failed to update enquiry");
      }

      setEnquiries((prev) =>
        prev.map((enq) => (enq.id === selectedEnquiry.id ? { ...enq, status: newStatus, adminNotes } : enq))
      );

      setUpdating(false);
      // Automatically go back to the list page after saving changes
      setSelectedEnquiry(null);
    } catch (error) {
      console.error("Error updating enquiry:", error);
      alert(error instanceof Error ? error.message : "Something went wrong");
      setUpdating(false);
    }
  };

  // Search Filter & Sorting Logic (Pending items on top)
  const filteredEnquiries = enquiries
    .filter((item) => {
      return (
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.businessEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
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
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">View Bulk Enquiry</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">View the details of the bulk quote request submitted from the website.</p>
            </div>
            <button
              onClick={() => setSelectedEnquiry(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-extrabold text-slate-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <ArrowLeft size={16} /> Back to List
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/65 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
              <h2 className="text-base font-black text-slate-900">Enquiry Details</h2>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="py-4 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Full Name</span>
                <span className="font-extrabold text-slate-900">{selectedEnquiry.fullName}</span>
              </div>
              <div className="py-4 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Business Email</span>
                <span className="font-extrabold text-slate-900">{selectedEnquiry.businessEmail}</span>
              </div>
              <div className="py-4 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Expected Quantity</span>
                <span className="font-extrabold text-slate-900">{selectedEnquiry.expectedQuantity}</span>
              </div>
              <div className="py-4 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Submitted On</span>
                <span className="font-extrabold text-slate-900">{selectedEnquiry.submittedOn}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/65 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Info size={20} />
              </div>
              <h2 className="text-base font-black text-slate-900">Update Enquiry Status & Notes</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#D97706] cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Admin Notes</label>
                <input
                  type="text"
                  placeholder="Enter admin notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#D97706]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleUpdateEnquiry}
                disabled={updating}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-extrabold px-6 py-3 rounded-xl shadow-sm transition-all cursor-pointer text-xs sm:text-sm disabled:opacity-50"
              >
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 📋 BULK ENQUIRY LIST TABLE UI
  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-[1320px] mx-auto space-y-6">

        {/* Header Section */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Bulk Enquiry</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">View and manage all bulk quote requests received from the website.</p>
        </div>

        {/* Search Bar Only */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/65 shadow-xs flex items-center">
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
        <div className="bg-white rounded-3xl border border-slate-200/65 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200/65 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
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
                    <td colSpan={7} className="text-center py-12 text-slate-500">Loading bulk enquiries...</td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">No bulk enquiries found.</td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-slate-400 font-bold">{startIndex + index + 1}</td>
                      <td className="py-4 px-6 font-extrabold text-slate-900 text-sm">{item.fullName}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{item.businessEmail}</td>
                      <td className="py-4 px-6 text-slate-800 font-bold">{item.expectedQuantity}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{item.submittedOn}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold capitalize ${
                          item.status === "pending" ? "bg-emerald-50 text-emerald-700" :
                          item.status === "confirmed" ? "bg-blue-50 text-blue-700" :
                          item.status === "contacted" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === "pending" ? "bg-emerald-500" :
                            item.status === "confirmed" ? "bg-blue-500" :
                            item.status === "contacted" ? "bg-amber-500" : "bg-red-500"
                          }`} />
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

          {/* Pagination Footer (5 items per page) */}
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