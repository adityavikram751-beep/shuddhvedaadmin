"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Edit, Loader2, CheckCircle2, Upload } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface AdminProfile {
  username: string;
  email: string;
  fullname: string;
  phone: string;
  role: string;
  image: string;
}

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" ? (value as ApiRecord) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export default function AdminSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<AdminProfile>({
    username: "",
    email: "",
    fullname: "",
    phone: "",
    role: "admin",
    image: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch Profile (GET /api/admin/profile)
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/profile`, {
        method: "GET",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      const raw = asRecord(json.data || json.admin || json);

      // Using your exact response key 'profile_img'
      const rawImg = asString(raw.profile_img) || asString(raw.image) || asString(raw.profile_url) || asString(raw.avatar);

      const fetchedProfile = {
        username: asString(raw.username) || asString(raw.user_name) || "",
        email: asString(raw.email) || asString(raw.business_email) || "",
        fullname: asString(raw.fullname) || asString(raw.full_name) || asString(raw.name) || "",
        phone: asString(raw.phone) || asString(raw.mobile) || "",
        role: asString(raw.role) || "admin",
        image: rawImg,
      };

      setProfile(fetchedProfile);
      setImagePreview(fetchedProfile.image);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProfile();
  }, []);

  const handleImageChange = (file?: File) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Update Profile using FormData (PUT /api/admin/update/admin-profile)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("username", profile.username);
      formData.append("email", profile.email);
      formData.append("fullname", profile.fullname);
      formData.append("phone", profile.phone);
      formData.append("role", profile.role);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/update/admin-profile`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.message || "Failed to update profile");
      }

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      setImageFile(null);
      await fetchProfile();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <div className="max-w-[1320px] mx-auto space-y-6">

        {/* Top Header & Breadcrumb */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
         
        </div>

        {/* Status Banners */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 size={18} /> {successMessage}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-slate-500 font-medium">Loading settings...</div>
        ) : (
          <>
            {/* Top Profile Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-amber-50 border-2 border-amber-200 flex items-center justify-center shrink-0 shadow-inner">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-amber-500" />
                  )}
                  {isEditing && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer text-white text-[10px] font-bold"
                    >
                      <Upload size={18} />
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files?.[0])} className="hidden" />

                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{profile.fullname || "Admin User"}</h2>
                  <p className="text-xs sm:text-sm font-bold text-slate-500 capitalize">{profile.role}</p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Mail size={14} className="text-slate-400" /> {profile.email}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 hover:bg-amber-100/60 text-amber-700 font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Edit size={16} /> Edit
                </button>
              )}
            </div>

            {/* Personal Information Section / Form */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <User size={18} />
                  </div>
                  <h3 className="text-base font-black text-slate-900">Personal Information</h3>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 hover:bg-amber-100/60 text-amber-700 font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Edit size={16} /> Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Full Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!isEditing}
                      value={profile.fullname}
                      onChange={(e) => setProfile({ ...profile, fullname: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 disabled:bg-slate-50 disabled:text-slate-700 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Email Address <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      disabled={!isEditing}
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 disabled:bg-slate-50 disabled:text-slate-700 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Phone Number <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!isEditing}
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 disabled:bg-slate-50 disabled:text-slate-700 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Username <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!isEditing}
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 disabled:bg-slate-50 disabled:text-slate-700 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profile.role}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 text-xs sm:text-sm font-semibold cursor-not-allowed"
                    />
                  </div>

                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        void fetchProfile();
                      }}
                      className="px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-extrabold px-8 py-3 rounded-xl shadow-sm transition-all cursor-pointer text-xs inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {updating && <Loader2 size={16} className="animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                )}
              </form>

            </div>
          </>
        )}

      </div>
    </div>
  );
}