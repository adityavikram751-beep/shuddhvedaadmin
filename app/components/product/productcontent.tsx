"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/auth";
import {
  Plus,
  Search,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ---------- Types ----------
interface Category {
  _id: string;
  name: string;
  status?: string; // assuming active by default
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ---------- Fetch Categories ----------
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/category/all-category`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const list = data.data || [];
      setCategories(list);
      setFilteredCategories(list);
    } catch (err) {
      console.error(err);
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ---------- Search Filter ----------
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredCategories(
        categories.filter((cat) => cat.name.toLowerCase().includes(lower))
      );
    }
  }, [searchTerm, categories]);

  // ---------- Toast Helper ----------
  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---------- Add Category ----------
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showToast("Category name is required", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/category/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add category");
      }
      showToast("Category added successfully", "success");
      setNewCategoryName("");
      setShowModal(false);
      fetchCategories(); // refresh list
    } catch (err: any) {
      showToast(err.message || "Error adding category", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Delete Category ----------
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/category/remove/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete");
      }
      showToast(`Category "${name}" deleted`, "success");
      fetchCategories(); // refresh
    } catch (err: any) {
      showToast(err.message || "Error deleting category", "error");
    }
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-[#FDF1E3] text-slate-800 font-sans pb-12">

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
          {toast.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-400" />
          ) : (
            <AlertCircle size={16} className="text-red-400" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Category Management
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Add, edit, and manage product categories (flavours).
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by category name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#d9730d]"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading categories...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-slate-200/80 text-slate-600 font-bold">
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">CATEGORY NAME</th>
                      <th className="p-3 text-left">STATUS</th>
                      <th className="p-3 text-left">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400">
                          No categories found.
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((cat, index) => (
                        <tr key={cat._id} className="border-b border-slate-100 hover:bg-amber-50/30 transition-colors">
                          <td className="p-3 font-semibold text-slate-600">{index + 1}</td>
                          <td className="p-3 font-bold text-slate-800">{cat.name}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleDeleteCategory(cat._id, cat.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete category"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer with pagination (optional) */}
              <div className="border-t border-slate-200/80 px-4 py-3 bg-[#FAF8F5] text-[11px] text-slate-500 flex justify-between items-center">
                <span>
                  Showing {filteredCategories.length} of {categories.length} categories
                </span>
                {/* Pagination controls could go here if needed */}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---------- Add Category Modal ---------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-900">Add New Category</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCategory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#d9730d]"
                    autoFocus
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#d9730d] hover:bg-[#c06509] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-70"
                  >
                    {submitting ? "Adding..." : "Add Category"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}