"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL, getStoredToken } from "@/lib/auth";

interface LabReport {
  id: string;
  name: string;
  pdfUrl: string;
  fileName?: string;
  fileSize?: string;
  createdAt?: string;
}

function normalizePdfUrl(url: any): string {
  if (!url) return "";
  if (typeof url === "object" && url !== null) {
    if (url.url) return normalizePdfUrl(url.url);
    if (url.secure_url) return normalizePdfUrl(url.secure_url);
    return "";
  }
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  return `${API_BASE_URL}/${trimmed.replace(/^\//, "")}`;
}

export default function LabReportManagement() {
  // Form State: Name and PDF
  const [name, setName] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reports List (GET)
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper for auth headers
  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const token = getStoredToken();
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Tunnel-Skip-Anti-Phishing-Page": "true",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  // GET: Fetch Lab Reports from {{baseUrl}}/api/admin/lab-report/all
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/lab-report/all`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to load reports (Status: ${res.status})`);
      }

      const json = await res.json().catch(() => ({}));
      const rawList = Array.isArray(json)
        ? json
        : json?.data || json?.reports || json?.labReports || [];

      if (Array.isArray(rawList)) {
        const mapped: LabReport[] = rawList.map((item: any) => {
          // Support: item.honeyName (exact backend key), item.name, item.title
          const reportName =
            item.honeyName ||
            item.name ||
            item.productName ||
            item.title ||
            "Lab Report";

          // Support: item.report.url (exact Cloudinary backend key), item.report, item.pdf, item.pdfUrl
          const rawPdf =
            (typeof item.report === "object" && item.report?.url)
              ? item.report.url
              : (typeof item.report === "string" ? item.report : null) ||
                item.pdfUrl ||
                item.pdf_url ||
                item.pdf ||
                item.url ||
                item.fileUrl ||
                item.file ||
                "";

          const url = normalizePdfUrl(rawPdf);

          // Extract file name from url if not provided
          let fileName = item.fileName || item.filename || "";
          if (!fileName && typeof url === "string" && url) {
            try {
              const parts = url.split("/");
              fileName = decodeURIComponent(parts[parts.length - 1].split("?")[0]);
            } catch {
              fileName = `${reportName}.pdf`;
            }
          }

          return {
            id: item._id || item.id || `lr-${Math.random()}`,
            name: reportName,
            pdfUrl: url,
            fileName: fileName || `${reportName}.pdf`,
            createdAt: item.createdAt || item.updatedAt || "",
          };
        });

        setReports(mapped);
      }
    } catch (err: any) {
      console.error("Error fetching lab reports:", err);
      showToast(err.message || "Failed to fetch lab reports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Handle PDF file selection
  const handlePdfChange = (file?: File) => {
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      showToast("Please select a valid PDF file", "error");
      return;
    }

    setPdfFile(file);
    const url = URL.createObjectURL(file);
    setPdfPreview(url);

    // Auto-fill name if empty
    if (!name.trim()) {
      const cleanName = file.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ");
      setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  // POST: Add Lab Report (Upload to {{baseUrl}}/api/admin/lab-report/upload)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Please enter Lab Report / Honey Name", "error");
      return;
    }

    if (!pdfFile) {
      showToast("Please upload a PDF file", "error");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      // Send ONLY honeyName and report (PDF) as required by backend
      formData.append("honeyName", name.trim());
      formData.append("report", pdfFile);

      const res = await fetch(`${API_BASE_URL}/api/admin/lab-report/upload`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.message || `Upload failed with status ${res.status}`);
      }

      showToast("Lab report uploaded successfully!");

      // Reset form
      setName("");
      setPdfFile(null);
      setPdfPreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Re-fetch reports from API to display fresh data
      await fetchReports();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to upload report", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE: Remove Lab Report ({{baseUrl}}/api/admin/lab-report/remove/{{reportId}})
  const handleDelete = async (id: string, reportName: string) => {
    if (!confirm(`Are you sure you want to delete "${reportName}"?`)) return;

    setDeletingId(id);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/lab-report/remove/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.message || `Failed to delete (Status: ${res.status})`);
      }

      // Update UI immediately on success
      setReports((prev) => prev.filter((r) => r.id !== id));
      showToast(data.message || `"${reportName}" removed successfully`);
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast(err.message || "Failed to delete lab report", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold ${
            toast.type === "success"
              ? "bg-emerald-900 text-emerald-100 border border-emerald-700"
              : "bg-red-900 text-red-100 border border-red-700"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Page Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#2D2118]">Lab Report Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload and view honey lab reports (Honey Name & PDF Report).
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchReports()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          title="Refresh Reports"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-amber-600" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 1. POST FORM: Add Lab Report (honeyName & report PDF) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-amber-50/60 border-b border-amber-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#D97706] text-white flex items-center justify-center font-bold">
            <Plus size={16} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#2D2118]">Upload Lab Report</h2>
            <p className="text-[11px] text-slate-500">Enter honey name and upload the PDF lab report</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. NAME (honeyName) */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
              Honey Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mustard Honey or Wild Raw Honey"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#D97706] focus:ring-2 focus:ring-amber-500/20 text-xs font-semibold text-slate-800 outline-none transition-all"
            />
          </div>

          {/* 2. UPLOAD PDF (report) */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
              Lab Report (PDF File) <span className="text-red-500">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => handlePdfChange(e.target.files?.[0])}
            />

            {pdfFile ? (
              /* Selected PDF Card */
              <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-sm">
                    <FileText size={20} />
                    <span className="text-[8px]">PDF</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{pdfFile.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfFile(null);
                      setPdfPreview("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-1.5 rounded-xl text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* PDF Upload Dropzone */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#D97706] flex items-center justify-center mb-2">
                  <Upload size={22} />
                </div>
                <p className="text-xs font-bold text-slate-800">Click to upload PDF</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Accepts .pdf files only</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold shadow-md shadow-amber-600/20 disabled:opacity-60 cursor-pointer transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Uploading to Server...
                </>
              ) : (
                <>
                  <Upload size={14} /> Upload Lab Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. GET LIST: Show Reports from API */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-extrabold text-[#2D2118]">
              All Lab Reports ({reports.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-amber-600" /> Loading lab reports from server...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText size={32} className="mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No Lab Reports Found</p>
            <p className="text-[11px] text-slate-500">
              Upload your first lab report using the form above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-5 flex items-center justify-between gap-4 hover:bg-amber-50/20 transition-colors"
              >
                {/* PDF Icon + Name (Clickable link) */}
                <a
                  href={report.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 min-w-0 group cursor-pointer"
                  title="Open report in new tab"
                >
                  <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex flex-col items-center justify-center font-black shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <FileText size={20} />
                    <span className="text-[7px] uppercase tracking-wider">PDF</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                      {report.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate font-mono">
                      {report.fileName || "LabReport.pdf"}
                      {report.createdAt
                        ? ` • ${new Date(report.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}`
                        : ""}
                    </p>
                  </div>
                </a>

                {/* Actions: Open + Download + Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Open in new tab */}
                  <a
                    href={report.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                    title="Open PDF in new tab"
                  >
                    <ExternalLink size={13} className="text-amber-600" />
                    <span>Open</span>
                  </a>

                  {/* Download */}
                  <a
                    href={report.pdfUrl}
                    download={report.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                    title="Download Report"
                  >
                    <Download size={15} />
                  </a>

                  {/* Delete */}
                  <button
                    type="button"
                    disabled={deletingId === report.id}
                    onClick={() => handleDelete(report.id, report.name)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Report"
                  >
                    {deletingId === report.id ? (
                      <Loader2 size={15} className="animate-spin text-red-600" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
