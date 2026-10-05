"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Search,
  RefreshCw,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Loader2,
  Calendar,
  Sparkles,
  Hash,
  Send,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

export interface EmailOnlySubscriber {
  _id?: string;
  email: string;
  createdAt?: string;
  date?: string;
}

export interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function EmailOnlySubscribers() {
  const [subscribers, setSubscribers] = useState<EmailOnlySubscriber[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Copy states
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const copyToClipboard = (text: string, index?: number) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
    showToast("Email copied to clipboard!");
  };

  // Fetch Email-Only Subscribers API
  const fetchSubscribers = useCallback(
    async (pageNum: number = currentPage, pageLimit: number = limit) => {
      setLoading(true);
      setError(null);
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("admin_token") || localStorage.getItem("sudhveda_token")
            : null;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const url = `${API_BASE_URL}/api/subscribe/subscribers/email-only?page=${pageNum}&limit=${pageLimit}`;
        const response = await fetch(url, {
          method: "GET",
          headers,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();

        if (json.success || Array.isArray(json.data) || Array.isArray(json)) {
          const rawData = Array.isArray(json)
            ? json
            : Array.isArray(json.data)
            ? json.data
            : json.emails || json.subscribers || [];

          // Format items cleanly whether strings or objects
          const formattedList: EmailOnlySubscriber[] = rawData.map((item: any, idx: number) => {
            if (typeof item === "string") {
              return { email: item, _id: `email_${idx}` };
            }
            return {
              _id: item._id || item.id || `email_${idx}`,
              email: item.email || item.emailAddress || "",
              createdAt: item.createdAt || item.date || item.created_at || "",
            };
          });

          setSubscribers(formattedList);

          if (json.pagination) {
            setPagination({
              totalCount: json.pagination.totalCount ?? formattedList.length,
              totalPages: json.pagination.totalPages ?? 1,
              currentPage: json.pagination.currentPage ?? pageNum,
              limit: json.pagination.limit ?? pageLimit,
              hasNextPage: !!json.pagination.hasNextPage,
              hasPrevPage: !!json.pagination.hasPrevPage,
            });
          } else {
            setPagination((prev) => ({
              ...prev,
              totalCount: formattedList.length,
              currentPage: pageNum,
              limit: pageLimit,
              totalPages: Math.ceil(formattedList.length / pageLimit) || 1,
            }));
          }
        } else {
          setError(json.message || "Failed to fetch subscriber emails");
        }
      } catch (err: any) {
        console.error("Failed to fetch email-only subscribers:", err);
        setError(err.message || "Something went wrong while fetching subscriber emails.");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, limit]
  );

  useEffect(() => {
    fetchSubscribers(currentPage, limit);
  }, [currentPage, limit, fetchSubscribers]);

  // Client-side search filtering
  const filteredSubscribers = subscribers.filter((user) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return user.email?.toLowerCase().includes(term);
  });

  // Copy All Filtered Emails as CSV / Comma Separated
  const handleCopyAllEmails = () => {
    const validEmails = filteredSubscribers
      .map((s) => s.email?.trim())
      .filter((e) => e && e.length > 0);

    if (validEmails.length === 0) {
      showToast("No emails available to copy!");
      return;
    }

    const emailListStr = validEmails.join(", ");
    navigator.clipboard.writeText(emailListStr);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
    showToast(`Copied ${validEmails.length} email addresses to clipboard!`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) {
      showToast("No email data to export!");
      return;
    }

    const headers = ["Index", "ID", "Email Address", "Subscribed Date"];
    const csvRows = [headers.join(",")];

    filteredSubscribers.forEach((user, idx) => {
      const row = [
        `"${idx + 1}"`,
        `"${user._id || ""}"`,
        `"${user.email || ""}"`,
        `"${user.createdAt ? new Date(user.createdAt).toLocaleString() : ""}"`,
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `subscriber_emails_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported subscriber emails to CSV file!");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Mail size={220} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles size={16} />
              <span>Email Marketing & Subscribers</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">User Email List</h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              View, copy, and export all email addresses subscribed to ShuddhVeda notifications and newsletters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => fetchSubscribers(currentPage, limit)}
              disabled={loading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all border border-white/20 backdrop-blur-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleCopyAllEmails}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border border-white/30 cursor-pointer"
            >
              {copiedAll ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
              <span>{copiedAll ? "Emails Copied!" : "Copy All Emails"}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm cursor-pointer"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Email Subscribers
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {pagination.totalCount || subscribers.length}
            </h3>
            <p className="text-xs text-indigo-600 font-medium mt-1">
              Registered email contacts
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Showing On Page
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {filteredSubscribers.length}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setLimit(newLimit);
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <Loader2 size={36} className="text-indigo-600 animate-spin mb-3" />
            <p className="text-gray-600 font-medium text-sm">Loading subscriber emails...</p>
            <p className="text-gray-400 text-xs mt-1">Fetching records from backend API.</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <X size={24} />
            </div>
            <h4 className="text-gray-900 font-semibold text-base mb-1">Failed to Load Emails</h4>
            <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => fetchSubscribers(currentPage, limit)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
              <Mail size={32} />
            </div>
            <h4 className="text-gray-900 font-semibold text-lg mb-1">No Email Subscribers Found</h4>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              {searchTerm
                ? `No email matching "${searchTerm}" was found.`
                : "No email subscribers found in the system."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-5 py-3.5">Email Address</th>
                  <th className="px-5 py-3.5">Record ID</th>
                  <th className="px-5 py-3.5">Subscribed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredSubscribers.map((item, idx) => {
                  const serialNo = (currentPage - 1) * limit + idx + 1;
                  return (
                    <tr
                      key={item._id || idx}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="px-5 py-4 font-mono text-xs text-gray-400 font-medium">
                        {serialNo}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Mail size={18} />
                          </div>
                          <div>
                            <a
                              href={`mailto:${item.email}`}
                              className="font-semibold text-gray-900 hover:text-indigo-600 hover:underline transition-colors flex items-center gap-1.5"
                            >
                              <span>{item.email}</span>
                            </a>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          {item._id || "N/A"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400 shrink-0" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer / Pagination */}
        {!loading && !error && filteredSubscribers.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 font-medium">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {Math.min(
                  (pagination.currentPage - 1) * pagination.limit + 1,
                  pagination.totalCount
                )}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-800">
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.totalCount
                )}
              </span>{" "}
              of <span className="font-semibold text-gray-800">{pagination.totalCount}</span>{" "}
              subscriber emails
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage && pagination.currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1 px-2">
                <span className="text-xs font-semibold text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNextPage && pagination.currentPage >= pagination.totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
