"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Eye,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  UserCheck,
  X,
  Loader2,
  ShieldCheck,
  User,
  Hash,
  Send,
  Package,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

export interface DetailedSubscriber {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
  status?: string;
  planName?: string;
  plan?: any;
}

export interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function DetailedSubscribers() {
  const [subscribers, setSubscribers] = useState<DetailedSubscriber[]>([]);
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

  // Selected subscriber for detail modal
  const [selectedUser, setSelectedUser] = useState<DetailedSubscriber | null>(null);

  // Copy notification state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`${label} copied to clipboard!`);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Fetch Detailed Subscribers API
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

        const url = `${API_BASE_URL}/api/subscribe/subscribers/detailed?page=${pageNum}&limit=${pageLimit}`;
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
          const list: DetailedSubscriber[] = Array.isArray(json)
            ? json
            : Array.isArray(json.data)
            ? json.data
            : json.subscribers || [];

          setSubscribers(list);

          if (json.pagination) {
            setPagination({
              totalCount: json.pagination.totalCount ?? list.length,
              totalPages: json.pagination.totalPages ?? 1,
              currentPage: json.pagination.currentPage ?? pageNum,
              limit: json.pagination.limit ?? pageLimit,
              hasNextPage: !!json.pagination.hasNextPage,
              hasPrevPage: !!json.pagination.hasPrevPage,
            });
          } else {
            setPagination((prev) => ({
              ...prev,
              totalCount: list.length,
              currentPage: pageNum,
              limit: pageLimit,
              totalPages: Math.ceil(list.length / pageLimit) || 1,
            }));
          }
        } else {
          setError(json.message || "Failed to fetch detailed subscribers");
        }
      } catch (err: any) {
        console.error("Failed to fetch detailed subscribers:", err);
        setError(err.message || "Something went wrong while fetching detailed subscribers.");
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
    const nameMatch = user.name?.toLowerCase().includes(term);
    const emailMatch = user.email?.toLowerCase().includes(term);
    const mobileMatch = user.mobile?.toLowerCase().includes(term);
    const idMatch = user._id?.toLowerCase().includes(term);
    return nameMatch || emailMatch || mobileMatch || idMatch;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) {
      showToast("No subscribers data to export!");
      return;
    }

    const headers = ["ID", "Name", "Email", "Mobile", "Subscribed At"];
    const csvRows = [headers.join(",")];

    filteredSubscribers.forEach((user) => {
      const row = [
        `"${user._id || ""}"`,
        `"${user.name || ""}"`,
        `"${user.email || ""}"`,
        `"${user.mobile || ""}"`,
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
      `detailed_subscribers_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported detailed subscribers to CSV file!");
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

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Users size={220} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <UserCheck size={16} />
              <span>Subscriber Management</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">User Details</h1>
            <p className="text-amber-100 text-sm mt-1 max-w-xl">
              Comprehensive list of subscribers with full contact info, names, emails, phones, and join timestamps.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => fetchSubscribers(currentPage, limit)}
              disabled={loading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all border border-white/20 backdrop-blur-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm cursor-pointer"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Subscribers
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {pagination.totalCount || subscribers.length}
            </h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <ShieldCheck size={14} /> Registered User Profiles
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              On Current Page
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {filteredSubscribers.length}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Search Filtered
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {filteredSubscribers.length}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              {searchTerm ? `Matching "${searchTerm}"` : "Showing all detailed records"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Search size={24} />
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
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
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
                className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer"
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
            <Loader2 size={36} className="text-orange-500 animate-spin mb-3" />
            <p className="text-gray-600 font-medium text-sm">Loading subscriber details...</p>
            <p className="text-gray-400 text-xs mt-1">Please wait while we fetch the records.</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <X size={24} />
            </div>
            <h4 className="text-gray-900 font-semibold text-base mb-1">Failed to Load Data</h4>
            <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => fetchSubscribers(currentPage, limit)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4 border border-orange-100">
              <Users size={32} />
            </div>
            <h4 className="text-gray-900 font-semibold text-lg mb-1">No Subscribers Found</h4>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              {searchTerm
                ? `No user matched your search term "${searchTerm}". Try searching for something else.`
                : "There are currently no detailed subscribers in the system."}
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
                  <th className="px-5 py-3.5">Subscriber</th>
                  <th className="px-5 py-3.5">Email Address</th>
                  <th className="px-5 py-3.5">Mobile Number</th>
                  <th className="px-5 py-3.5">Subscribed Date</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredSubscribers.map((user, idx) => {
                  const serialNo = (currentPage - 1) * limit + idx + 1;
                  return (
                    <tr
                      key={user._id || idx}
                      className="hover:bg-orange-50/30 transition-colors group"
                    >
                      <td className="px-5 py-4 font-mono text-xs text-gray-400 font-medium">
                        {serialNo}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm uppercase">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                              <span>{user.name || "Unnamed User"}</span>
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                              <Hash size={10} />
                              <span className="truncate max-w-[120px]">{user._id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {user.email ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${user.email}`}
                              className="text-gray-700 hover:text-orange-600 hover:underline flex items-center gap-1.5 text-sm"
                            >
                              <Mail size={14} className="text-gray-400 shrink-0" />
                              <span>{user.email}</span>
                            </a>
                            <button
                              onClick={() => copyToClipboard(user.email, "Email")}
                              title="Copy Email"
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-orange-600 p-1 rounded-md hover:bg-gray-100 transition-all cursor-pointer"
                            >
                              {copiedField === `Email_${user._id}` ? (
                                <Check size={13} className="text-emerald-500" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Not Provided</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {user.mobile ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${user.mobile}`}
                              className="text-gray-700 hover:text-orange-600 hover:underline flex items-center gap-1.5 text-sm font-medium font-mono"
                            >
                              <Phone size={14} className="text-gray-400 shrink-0" />
                              <span>{user.mobile}</span>
                            </a>
                            <button
                              onClick={() => copyToClipboard(user.mobile, "Mobile")}
                              title="Copy Mobile Number"
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-orange-600 p-1 rounded-md hover:bg-gray-100 transition-all cursor-pointer"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Not Provided</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400 shrink-0" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                            title="View Subscriber Details"
                          >
                            <Eye size={14} />
                            <span>View Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer / Pagination Controls */}
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
              subscribers
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

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white relative">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white text-orange-600 font-extrabold text-xl flex items-center justify-center shadow-md uppercase shrink-0">
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mb-1">
                    Subscriber Profile
                  </span>
                  <h3 className="text-xl font-bold leading-tight">
                    {selectedUser.name || "Unnamed User"}
                  </h3>
                  <p className="text-amber-100 text-xs font-mono mt-0.5">
                    ID: {selectedUser._id}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <User size={14} className="text-orange-500" />
                    <span>Full Name</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedUser.name || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Mail size={14} className="text-orange-500" />
                    <span>Email Address</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {selectedUser.email || "N/A"}
                    </span>
                    {selectedUser.email && (
                      <button
                        onClick={() => copyToClipboard(selectedUser.email, "Email")}
                        className="text-gray-400 hover:text-orange-600 p-1 cursor-pointer"
                        title="Copy Email"
                      >
                        <Copy size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Phone size={14} className="text-orange-500" />
                    <span>Mobile Number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-semibold text-gray-800">
                      {selectedUser.mobile || "N/A"}
                    </span>
                    {selectedUser.mobile && (
                      <button
                        onClick={() => copyToClipboard(selectedUser.mobile, "Mobile")}
                        className="text-gray-400 hover:text-orange-600 p-1 cursor-pointer"
                        title="Copy Mobile"
                      >
                        <Copy size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Calendar size={14} className="text-orange-500" />
                    <span>Subscribed Date</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {formatDate(selectedUser.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {selectedUser.email ? (
                  <a
                    href={`mailto:${selectedUser.email}`}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Mail size={14} />
                    <span>Send Email</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 text-gray-400 rounded-xl text-xs font-semibold cursor-not-allowed"
                  >
                    <Mail size={14} />
                    <span>No Email</span>
                  </button>
                )}

                {selectedUser.mobile ? (
                  <a
                    href={`tel:${selectedUser.mobile}`}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Phone size={14} />
                    <span>Call User</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 text-gray-400 rounded-xl text-xs font-semibold cursor-not-allowed"
                  >
                    <Phone size={14} />
                    <span>No Mobile</span>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
