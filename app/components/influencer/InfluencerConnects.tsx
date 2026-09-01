// "use client";

// import { useState, useEffect } from "react";
// import {
//   Users,
//   Search,
//   Filter,
//   Camera,
//   Video,
//   Globe,
//   CheckCircle,
//   Clock,
//   XCircle,
//   ExternalLink,
//   MessageSquare,
//   Phone,
//   Mail,
//   Calendar,
//   Sparkles,
//   Tag,
//   Trash2,
//   Eye,
//   Send,
//   AlertCircle,
//   RefreshCw,
//   MessageCircle,
//   Download,
//   MapPin,
//   Check,
// } from "lucide-react";
// import { API_BASE_URL } from "@/lib/auth";

// export interface InfluencerInquiry {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   username: string;
//   handle: string;
//   platform: string;
//   numberOfFollowers: number | string;
//   followersStr: string;
//   fullAddress: string;
//   city: string;
//   pinCode: string;
//   influencerGeneric: string;
//   niche: string;
//   message: string;
//   submittedOn: string;
//   isSeen: boolean;
//   status: "New" | "Contacted" | "Approved" | "Rejected";
//   promoCode?: string;
// }

// const LOCAL_SEEN_KEY = "shuddhveda_seen_influencers";

// function getLocalSeenIds(): string[] {
//   if (typeof window === "undefined") return [];
//   try {
//     const raw = localStorage.getItem(LOCAL_SEEN_KEY);
//     return raw ? JSON.parse(raw) : [];
//   } catch {
//     return [];
//   }
// }

// function addLocalSeenId(id: string) {
//   if (typeof window === "undefined" || !id) return;
//   try {
//     const current = getLocalSeenIds();
//     if (!current.includes(id)) {
//       const updated = [...current, id];
//       localStorage.setItem(LOCAL_SEEN_KEY, JSON.stringify(updated));
//     }
//   } catch (err) {
//     console.error("Error saving seen ID to localStorage:", err);
//   }
// }

// export default function InfluencerConnects() {
//   const [inquiries, setInquiries] = useState<InfluencerInquiry[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("All");

//   // Selected Inquiry for Detail Modal
//   const [selectedInquiry, setSelectedInquiry] = useState<InfluencerInquiry | null>(null);
//   const [assignCode, setAssignCode] = useState("");
//   const [actionLoading, setActionLoading] = useState(false);

//   // 1. GET API: Fetch All Influencer Details (/api/influencer/all-details)
//   const fetchInquiries = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/influencer/all-details`, {
//         method: "GET",
//         credentials: "include",
//       });
//       const data = await res.json().catch(() => ({}));

//       if (res.ok) {
//         const rawList = Array.isArray(data.data)
//           ? data.data
//           : Array.isArray(data.influencers)
//             ? data.influencers
//             : Array.isArray(data)
//               ? data
//               : [];

//         const localSeen = getLocalSeenIds();

//         const formatted: InfluencerInquiry[] = rawList.map((item: any, idx: number) => {
//           const id = item._id || item.id || `INF-${101 + idx}`;
//           const count = typeof item.numberOfFollowers === "number" ? item.numberOfFollowers : parseInt(item.numberOfFollowers || "0", 10);
//           const followersStr = count >= 1000000 ? `${(count / 1000000).toFixed(1)}M` : count >= 1000 ? `${(count / 1000).toFixed(0)}K` : count ? String(count) : "10K+";

//           const userHandle = item.username ? (item.username.startsWith("@") ? item.username : `@${item.username}`) : item.handle || "@creator";

//           const isItemSeen = Boolean(
//             item.isSeen ||
//             item.seen ||
//             item.is_seen ||
//             item.status === "Seen" ||
//             item.status === "seen" ||
//             item.status === "Contacted" ||
//             localSeen.includes(id)
//           );

//           return {
//             id,
//             name: item.name || item.fullName || "Inquirer",
//             email: item.email || "",
//             phone: item.phoneNumber || item.phone || item.mobile || "",
//             username: item.username || "",
//             handle: userHandle,
//             platform: item.platform || item.socialPlatform || "Instagram",
//             numberOfFollowers: item.numberOfFollowers || 0,
//             followersStr,
//             fullAddress: item.fullAddress || item.address || "",
//             city: item.city || "",
//             pinCode: item.pinCode || item.pincode || "",
//             influencerGeneric: item.influencerGeneric || item.category || "Creator",
//             niche: item.niche || item.influencerGeneric || "Health & Wellness",
//             message: item.message || item.proposal || "Collaboration Form Submission",
//             submittedOn: item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently",
//             isSeen: isItemSeen,
//             status: isItemSeen ? "Contacted" : "New",
//             promoCode: item.promoCode || "",
//           };
//         });

//         setInquiries(formatted);
//       }
//     } catch (err) {
//       console.error("API fetch error for influencer inquiries:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     void fetchInquiries();
//   }, []);

//   // 2. PATCH API: Mark Inquiry as Seen (/api/influencer/:id/seen)
//   const handleMarkSeen = async (inquiry: InfluencerInquiry) => {
//     setSelectedInquiry(inquiry);
//     setAssignCode(inquiry.promoCode || "");

//     // Save to persistent localStorage cache immediately
//     addLocalSeenId(inquiry.id);

//     // Optimistically update local React state to Seen
//     setInquiries((prev) =>
//       prev.map((i) => (i.id === inquiry.id ? { ...i, isSeen: true, status: "Contacted" } : i))
//     );

//     try {
//       const res = await fetch(`${API_BASE_URL}/api/influencer/${inquiry.id}/seen`, {
//         method: "PATCH",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ isSeen: true, seen: true, status: "Seen" }),
//       });

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) {
//         // Retry secondary PATCH endpoint format
//         await fetch(`${API_BASE_URL}/api/influencer/seen/${inquiry.id}`, {
//           method: "PATCH",
//           credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ isSeen: true, seen: true, status: "Seen" }),
//         }).catch(() => {});
//       }
//     } catch (err) {
//       console.error("Error executing PATCH seen API:", err);
//     }
//   };

//   // 3. DELETE API: Remove Influencer Inquiry (/api/influencer/remove/:id)
//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to remove this influencer inquiry?")) return;

//     setActionLoading(true);
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/influencer/remove/${id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });

//       if (res.ok) {
//         setInquiries((prev) => prev.filter((inq) => inq.id !== id));
//         if (selectedInquiry?.id === id) setSelectedInquiry(null);
//       } else {
//         setInquiries((prev) => prev.filter((inq) => inq.id !== id));
//         if (selectedInquiry?.id === id) setSelectedInquiry(null);
//       }
//     } catch (err) {
//       console.error("Delete error:", err);
//       setInquiries((prev) => prev.filter((inq) => inq.id !== id));
//       if (selectedInquiry?.id === id) setSelectedInquiry(null);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // 4. Export to Native Excel (.xls)
//   const handleExportExcel = () => {
//     if (filteredInquiries.length === 0) {
//       alert("Export karne ke liye koi inquiry records nahi hain!");
//       return;
//     }

//     const tableHtml = `
//       <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
//       <head>
//         <meta charset="utf-8" />
//         <!--[if gte mso 9]>
//         <xml>
//           <x:ExcelWorkbook>
//             <x:ExcelWorksheets>
//               <x:ExcelWorksheet>
//                 <x:Name>Influencer Inquiries</x:Name>
//                 <x:WorksheetOptions>
//                   <x:DisplayGridlines/>
//                 </x:WorksheetOptions>
//               </x:ExcelWorksheet>
//             </x:ExcelWorksheets>
//           </x:ExcelWorkbook>
//         </xml>
//         <![endif]-->
//         <style>
//           table { border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; }
//           th { background-color: #2D3A1B; color: #FFFFFF; font-weight: bold; border: 1px solid #1E2712; padding: 10px; text-align: left; font-size: 13px; }
//           td { border: 1px solid #E5E7EB; padding: 8px 10px; font-size: 12px; color: #1F2937; vertical-align: top; }
//           tr:nth-child(even) { background-color: #FAF6F0; }
//           .header-title { font-size: 16px; font-weight: bold; color: #2D3A1B; padding-bottom: 10px; }
//         </style>
//       </head>
//       <body>
//         <div class="header-title">ShuddhVeda - Influencer Website Form Inquiries Export</div>
//         <table>
//           <thead>
//             <tr>
//               <th style="width:110px">Inquiry ID</th>
//               <th style="width:160px">Full Name</th>
//               <th style="width:200px">Email Address</th>
//               <th style="width:140px">Phone / WhatsApp</th>
//               <th style="width:150px">Username / Handle</th>
//               <th style="width:120px">Followers Count</th>
//               <th style="width:150px">Category / Generic</th>
//               <th style="width:140px">City</th>
//               <th style="width:100px">Pincode</th>
//               <th style="width:280px">Full Address</th>
//               <th style="width:140px">Submitted On</th>
//               <th style="width:100px">Seen Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${filteredInquiries
//         .map(
//           (inq) => `
//               <tr>
//                 <td><b>${inq.id || ""}</b></td>
//                 <td>${(inq.name || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
//                 <td>${(inq.email || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
//                 <td>'${inq.phone || ""}</td>
//                 <td><b>${(inq.handle || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</b></td>
//                 <td>${inq.followersStr || inq.numberOfFollowers || ""}</td>
//                 <td>${(inq.influencerGeneric || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
//                 <td>${(inq.city || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
//                 <td>${inq.pinCode || ""}</td>
//                 <td>${(inq.fullAddress || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
//                 <td>${inq.submittedOn || ""}</td>
//                 <td><b>${inq.isSeen ? "Seen" : "New/Unread"}</b></td>
//               </tr>
//             `
//         )
//         .join("")}
//           </tbody>
//         </table>
//       </body>
//       </html>
//     `;

//     const blob = new Blob([tableHtml], {
//       type: "application/vnd.ms-excel;charset=utf-8;",
//     });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     const dateStr = new Date().toISOString().split("T")[0];
//     link.download = `Influencer_Inquiries_${dateStr}.xls`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   const filteredInquiries = inquiries.filter((inq) => {
//     const matchesSearch =
//       inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       inq.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       inq.phone.includes(searchTerm) ||
//       inq.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       inq.influencerGeneric.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === "All" || (statusFilter === "New" ? !inq.isSeen : inq.isSeen);
//     return matchesSearch && matchesStatus;
//   });

//   const newCount = inquiries.filter((i) => !i.isSeen).length;
//   const seenCount = inquiries.filter((i) => i.isSeen).length;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-[#2F241C] flex items-center gap-2">
//             <Users className="text-[#E69A00]" /> Influencer Collaboration Inquiries
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">
//             Manage submissions from influencers requesting collaboration.
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button
//             onClick={fetchInquiries}
//             className="flex items-center gap-2 px-3.5 py-2.5 bg-[#FAF6F0] text-[#2D3A1B] border border-[#F2E8D9] font-semibold text-xs rounded-xl hover:bg-[#FFF3DF] transition cursor-pointer w-fit"
//           >
//             <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Inquiries
//           </button>
//           <button
//             onClick={handleExportExcel}
//             className="flex items-center gap-2 px-4 py-2.5 bg-[#2D3A1B] text-white font-bold text-xs rounded-xl hover:bg-[#1E2712] transition shadow-md cursor-pointer w-fit"
//           >
//             <Download size={15} /> Export to Excel
//           </button>
//         </div>
//       </div>

//       {/* Metrics Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
//         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
//           <div>
//             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Submissions</p>
//             <h3 className="text-2xl font-bold text-[#2F241C] mt-1">{inquiries.length}</h3>
//           </div>
//           <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#E69A00] flex items-center justify-center font-bold">
//             <Users size={22} />
//           </div>
//         </div>

//         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
//           <div>
//             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unread / New</p>
//             <h3 className="text-2xl font-bold text-rose-600 mt-1">{newCount}</h3>
//           </div>
//           <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
//             <AlertCircle size={22} />
//           </div>
//         </div>

//         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
//           <div>
//             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Seen & Reviewed</p>
//             <h3 className="text-2xl font-bold text-emerald-600 mt-1">{seenCount}</h3>
//           </div>
//           <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
//             <CheckCircle size={22} />
//           </div>
//         </div>
//       </div>

//       {/* Filter and Search Bar */}
//       <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
//         {/* Search Input */}
//         <div className="relative w-full md:w-80">
//           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//           <input
//             type="text"
//             placeholder="Search by name, handle, city or phone..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#E69A00]"
//           />
//         </div>

//         {/* Status Filter */}
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setStatusFilter("All")}
//             className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === "All" ? "bg-[#2D3A1B] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//               }`}
//           >
//             All Inquiries
//           </button>
//           <button
//             onClick={() => setStatusFilter("New")}
//             className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === "New" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-100"
//               }`}
//           >
//             Unread ({newCount})
//           </button>
//         </div>
//       </div>

//       {/* Inquiries Table */}
//       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-[#FAF6F0] text-[11px] font-bold uppercase text-[#2D3A1B] tracking-wider border-b border-[#F2E8D9]">
//                 <th className="p-4">Creator / Name</th>
//                 <th className="p-4">Username & Reach</th>
//                 <th className="p-4">Category</th>
//                 <th className="p-4">City / Location</th>
//                 <th className="p-4">Contact Info</th>
//                 <th className="p-4">Seen Status</th>
//                 <th className="p-4 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 text-xs">
//               {loading ? (
//                 <tr>
//                   <td colSpan={7} className="p-8 text-center text-gray-400">
//                     <RefreshCw className="animate-spin text-[#E69A00] mx-auto mb-2" size={24} />
//                     Fetching submissions from API...
//                   </td>
//                 </tr>
//               ) : filteredInquiries.length > 0 ? (
//                 filteredInquiries.map((inq) => (
//                   <tr
//                     key={inq.id}
//                     className={`hover:bg-[#FFFBF5] transition ${!inq.isSeen ? "bg-amber-50/30 font-semibold" : ""}`}
//                   >
//                     {/* Name */}
//                     <td className="p-4">
//                       <p className="font-bold text-[#2F241C] text-sm">{inq.name}</p>
//                       <p className="text-[11px] text-gray-400 mt-0.5">{inq.submittedOn}</p>
//                     </td>

//                     {/* Username & Followers */}
//                     <td className="p-4">
//                       <span className="font-bold text-amber-700">{inq.handle}</span>
//                       <p className="text-[11px] text-gray-500">{inq.followersStr} Followers</p>
//                     </td>

//                     {/* Category */}
//                     <td className="p-4">
//                       <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md text-[11px] font-bold border border-amber-200">
//                         {inq.influencerGeneric}
//                       </span>
//                     </td>

//                     {/* City */}
//                     <td className="p-4">
//                       <p className="font-bold text-gray-700">{inq.city || "-"}</p>
//                       {inq.pinCode && <p className="text-[10px] text-gray-400">PIN: {inq.pinCode}</p>}
//                     </td>

//                     {/* Contact */}
//                     <td className="p-4">
//                       <p className="text-gray-700">{inq.phone}</p>
//                       <p className="text-[11px] text-gray-400">{inq.email}</p>
//                     </td>

//                     {/* Seen Status */}
//                     <td className="p-4">
//                       {inq.isSeen ? (
//                         <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
//                           <Check size={12} /> Seen
//                         </span>
//                       ) : (
//                         <button
//                           onClick={() => handleMarkSeen(inq)}
//                           className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full text-[10px] font-bold border border-rose-200 animate-pulse cursor-pointer"
//                           title="Click to mark as seen"
//                         >
//                           Unread
//                         </button>
//                       )}
//                     </td>

//                     {/* Actions */}
//                     <td className="p-4 text-right">
//                       <div className="flex items-center justify-end gap-2">
//                         {/* View & Mark Seen */}
//                         <button
//                           onClick={() => handleMarkSeen(inq)}
//                           className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#FFF3DF] text-[#2D3A1B] font-bold text-xs rounded-lg transition border border-[#F2E8D9] flex items-center gap-1 cursor-pointer"
//                           title="View submission details"
//                         >
//                           <Eye size={14} /> View
//                         </button>

//                         {/* Delete Button */}
//                         <button
//                           onClick={() => handleDelete(inq.id)}
//                           className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition border border-rose-200 cursor-pointer"
//                           title="Delete submission"
//                         >
//                           <Trash2 size={15} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={7} className="p-8 text-center text-gray-400">
//                     No influencer submission records found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* DETAIL MODAL */}
//       {selectedInquiry && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
//             {/* Modal Header */}
//             <div className="flex items-center justify-between border-b border-gray-100 pb-4">
//               <div>
//                 <h3 className="text-lg font-bold text-[#2F241C] flex items-center gap-2">
//                   {selectedInquiry.name}
//                   <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
//                     {selectedInquiry.influencerGeneric}
//                   </span>
//                 </h3>
//                 <p className="text-xs text-gray-400 mt-0.5">Submitted: {selectedInquiry.submittedOn}</p>
//               </div>
//               <button
//                 onClick={() => setSelectedInquiry(null)}
//                 className="p-1.5 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 cursor-pointer"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Creator Metrics */}
//             <div className="grid grid-cols-2 gap-3 bg-[#FAF6F0] p-4 rounded-2xl border border-[#F2E8D9]">
//               <div>
//                 <span className="text-[10px] uppercase font-bold text-gray-400">Username / Handle</span>
//                 <p className="font-bold text-amber-800 text-sm">{selectedInquiry.handle}</p>
//               </div>
//               <div>
//                 <span className="text-[10px] uppercase font-bold text-gray-400">Followers Count</span>
//                 <p className="font-bold text-[#2D3A1B] text-sm">{selectedInquiry.followersStr} Followers</p>
//               </div>
//             </div>

//             {/* Address & City */}
//             <div className="space-y-2">
//               <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
//                 <MapPin size={14} className="text-[#E69A00]" /> Address Details
//               </label>
//               <div className="p-3.5 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-700 border border-gray-100">
//                 <p><span className="font-bold">City:</span> {selectedInquiry.city || "-"}</p>
//                 <p><span className="font-bold">PinCode:</span> {selectedInquiry.pinCode || "-"}</p>
//                 <p><span className="font-bold">Full Address:</span> {selectedInquiry.fullAddress || "-"}</p>
//               </div>
//             </div>

//             {/* Modal Close */}
//             <div className="pt-2 border-t border-gray-100 text-right">
//               <button
//                 onClick={() => setSelectedInquiry(null)}
//                 className="px-6 py-2.5 bg-[#2D3A1B] text-white font-bold text-xs rounded-xl hover:bg-[#1E2712] cursor-pointer"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
