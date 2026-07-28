"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Phone, Mail, MessageCircle, Clock, Globe, Trash2, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface ContactData {
  id?: string;
  phone: string;
  email: string;
  whatsapp: string;
  phone_timing: string;
  email_reply_time: string;
  whatsapp_timing: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  map_embed_url: string;
}

export default function ContactInformationPage() {
  const [contact, setContact] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form States matching API body
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phoneTiming, setPhoneTiming] = useState("");
  const [emailReplyTime, setEmailReplyTime] = useState("");
  const [whatsappTiming, setWhatsappTiming] = useState("");

  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");

  const [mapEmbedUrl, setMapEmbedUrl] = useState("");

  // Fetch Contact Data (GET /api/location/all)
  const fetchContactDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/location/all`, {
        method: "GET",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      
      const data = json.data || json.location || (Array.isArray(json) ? json[0] : json);

      if (data && (data.phone || data.email || data.address)) {
        setContact(data);
        populateForm(data);
      } else {
        setContact(null);
      }
    } catch (error) {
      console.error("Error fetching contact info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchContactDetails();
  }, []);

  const populateForm = (data: ContactData) => {
    setPhone(data.phone || "");
    setEmail(data.email || "");
    setWhatsapp(data.whatsapp || "");
    setPhoneTiming(data.phone_timing || "");
    setEmailReplyTime(data.email_reply_time || "");
    setWhatsappTiming(data.whatsapp_timing || "");

    if (data.address) {
      setLine1(data.address.line1 || "");
      setLine2(data.address.line2 || "");
      setCity(data.address.city || "");
      setState(data.address.state || "");
      setPincode(data.address.pincode || "");
      setCountry(data.address.country || "India");
    }

    setMapEmbedUrl(data.map_embed_url || "");
  };

  // 🛡️ Handler to check if contact exists before opening Add Form
  const handleAddClick = () => {
    if (contact) {
      setErrorMessage("Please delete the existing contact information before adding a new one.");
      return;
    }
    setErrorMessage("");
    setIsAdding(true);
  };

  // Add Contact (POST /api/location/add)
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        phone,
        email,
        whatsapp,
        phone_timing: phoneTiming,
        email_reply_time: emailReplyTime,
        whatsapp_timing: whatsappTiming,
        address: {
          line1,
          line2,
          city,
          state,
          pincode,
          country,
        },
        map_embed_url: mapEmbedUrl,
      };

      const res = await fetch(`${API_BASE_URL}/api/location/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.message || "Failed to save contact information");
      }

      setSuccessMessage("Contact information saved successfully!");
      setIsAdding(false);
      await fetchContactDetails();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Delete Contact (DELETE /api/location/remove)
  const handleDeleteContact = async () => {
    if (!confirm("Are you sure you want to delete contact information?")) return;

    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/location/remove`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to remove contact information");
      }

      setContact(null);
      setPhone("");
      setEmail("");
      setWhatsapp("");
      setPhoneTiming("");
      setEmailReplyTime("");
      setWhatsappTiming("");
      setLine1("");
      setLine2("");
      setCity("");
      setState("");
      setPincode("");
      setCountry("India");
      setMapEmbedUrl("");
      setSuccessMessage("Contact information removed successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <div className="max-w-[1320px] mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1">Dashboard › Website Management › <span className="text-slate-800 font-bold">Contact Information</span></p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Contact Information</h1>
          </div>

          {contact && !isAdding && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDeleteContact()}
                className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trash2 size={15} /> Delete
              </button>
              <button
                onClick={handleAddClick}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer text-xs sm:text-sm"
              >
                <Plus size={16} className="stroke-[3]" /> Add Contact
              </button>
            </div>
          )}
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

        {/* Info Banner when no contact exists */}
        {!contact && !isAdding && (
          <div className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 gap-4">
            <div className="flex items-center gap-3">
              <Clock size={22} className="text-amber-600 shrink-0" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-amber-900">No contact information added yet!</h3>
                <p className="text-[11px] text-amber-700">Click the button below to add details for the website Contact Us page.</p>
              </div>
            </div>
            <button
              onClick={handleAddClick}
              className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-extrabold transition-all shadow-sm cursor-pointer inline-flex items-center gap-2 shrink-0"
            >
              <Plus size={16} className="stroke-[3]" /> Add Contact
            </button>
          </div>
        )}

        {/* ADD / UPDATE FORM */}
        {isAdding || !contact ? (
          <form onSubmit={handleSaveContact} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8">
            <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">
              Add Contact Information
            </h2>

            {/* Contact Details Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Contact Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="hello@shuddhaveda.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="9123456789"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>
            </div>

            {/* Office Address Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Office Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    placeholder="123, Green Hive Road"
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Address Line 2</label>
                  <input
                    type="text"
                    placeholder="Whitefield"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="Karnataka"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="560066"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>
            </div>

            {/* Business Hours & Timings */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Business Hours & Timings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Timing</label>
                  <input
                    type="text"
                    placeholder="Mon - Sat: 9AM - 6PM"
                    value={phoneTiming}
                    onChange={(e) => setPhoneTiming(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Timing</label>
                  <input
                    type="text"
                    placeholder="Mon - Sat: 9AM - 6PM"
                    value={whatsappTiming}
                    onChange={(e) => setWhatsappTiming(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Reply Time</label>
                  <input
                    type="text"
                    placeholder="We reply within 24 hrs"
                    value={emailReplyTime}
                    onChange={(e) => setEmailReplyTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>
            </div>

            {/* Google Map Embed URL */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Google Map</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Google Map Embed URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://maps.app.goo.gl/ymhdKrxW1F5maf517"
                  value={mapEmbedUrl}
                  onChange={(e) => setMapEmbedUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D97706]"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              {contact && (
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-extrabold px-8 py-3 rounded-xl shadow-sm transition-all cursor-pointer text-xs inline-flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Save Contact
              </button>
            </div>
          </form>
        ) : (
          /* VIEW DISPLAY CARD */
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8">
            
            {/* Contact Details Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-2">
                <Phone size={16} /> Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Email Address</p>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">{contact.email}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{contact.email_reply_time}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">WhatsApp Number</p>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">{contact.whatsapp}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{contact.whatsapp_timing}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Phone Number</p>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">{contact.phone}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{contact.phone_timing}</p>
                </div>
              </div>

              {/* Address Box */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Office Address</p>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">
                  {contact.address?.line1}{contact.address?.line2 ? `, ${contact.address.line2}` : ""}, {contact.address?.city}, {contact.address?.state} - {contact.address?.pincode}, {contact.address?.country}
                </p>
              </div>
            </div>

            {/* Google Map Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-2">
                <MapPin size={16} /> Google Map
              </h3>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Google Map URL</p>
                <a href={contact.map_embed_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline break-all">
                  {contact.map_embed_url}
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}