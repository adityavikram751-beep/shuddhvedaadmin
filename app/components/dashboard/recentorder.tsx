"use client";
import Link from "next/link";
import {
  ShoppingCart,
  Calendar,
  Gift,
  AlertTriangle,
} from "lucide-react";

// ---------- Recent Orders Data ----------
const recentOrders = [
  { id: "#ORD-1028", customer: "Priya sharma", amount: "₹1,250", status: "New", time: "10 min ago" },
  { id: "#ORD-1028", customer: "Anjali Mehta", amount: "₹950", status: "New", time: "35 MIN AGO" },
  { id: "#ORD-1028", customer: "Anjali Mehta", amount: "₹2,100", status: "Processing", time: "1 hours ago" },
  { id: "#ORD-1028", customer: "Neha Kapoor", amount: "₹1,750", status: "Processing", time: "2 hours ago" },
  { id: "#ORD-1028", customer: "Arjun Singh", amount: "₹680", status: "Pending", time: "3 hours ago" },
];

// ---------- Scheduled Products Data ----------
const scheduledProducts = [
  { name: "Tulsi Honey (500g)", date: "Jun 7, 2025", time: "10:00 AM" },
  { name: "Wild Honey Gift Box", date: "Jun 8, 2025", time: "09:00 AM" },
  { name: "Wild Honey Gift Box", date: "Jun 8, 2025", time: "09:00 AM" },
];

// ---------- Notifications Data ----------
const notifications = [
  { text: "New custom gift request received", time: "15 min ago", icon: Gift, color: "#A855F7", bg: "#F5EEFF" },
  { text: "Order #ORD-1028 has been placed", time: "20 min ago", icon: ShoppingCart, color: "#22C55E", bg: "#ECFDF3" },
  { text: "Low stock alert for 7 items", time: "1 hour ago", icon: AlertTriangle, color: "#EAB308", bg: "#FEF9E7" },
  { text: "Your product Tulsi Honey is scheduled", time: "2 hours ago", icon: Calendar, color: "#3B82F6", bg: "#EFF6FF" },
];

// ---------- Status Badge Helper ----------
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    New: "bg-[#ECFDF3] text-[#22C55E]",
    Processing: "bg-[#EFF6FF] text-[#3B82F6]",
    Pending: "bg-[#FFF4EB] text-[#FF7A00]",
  };
  return (
    <span
      className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function RecentOrdersSection() {
  return (
    // ⬇️ No fixed width, no extra margin-top.
    // This row now inherits the exact same width as the
    // Chart + Quick Actions row above, from the shared parent container.
    <div className="mt-16 grid grid-cols-1 w-[1120px] gap-6 lg:grid-cols-3 items-stretch">

      {/* Left Column: Recent Orders Table — matches Chart width */}
      <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#1E293B]">Recent Orders</h3>
            <a href="/dashboard/viewall" className="text-sm font-bold text-[#0F172A] hover:opacity-70 transition-opacity">
              View All
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest border-b border-gray-100">
                  <th className="pb-5">ORDER ID</th>
                  <th className="pb-5">CUSTOMER</th>
                  <th className="pb-5">AMOUNT</th>
                  <th className="pb-5">STATUS</th>
                  <th className="pb-5 text-right">TIME</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0">
                    <td className="py-5 font-bold text-[#0F172A] text-sm">{order.id}</td>
                    <td className="py-5 text-[#64748B] text-sm font-medium">{order.customer}</td>
                    <td className="py-5 font-bold text-[#0F172A] text-sm">{order.amount}</td>
                    <td className="py-5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-5 text-right text-[#94A3B8] text-xs font-medium uppercase tracking-wider">
                      {order.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
         
          <Link 
            href="/dashboard/viewall" 
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F8F9FA] text-xs font-bold text-[#0F172A] hover:bg-gray-100 transition-colors">
          
            View All Orders →
          </Link>
        </div>
      </div>

      {/* Right Column: Scheduled Products + Notifications — matches Quick Actions width */}
      <div className="lg:col-span-1 flex flex-col justify-between w-[465px] gap-6 h-full">

        {/* Scheduled Products Block */}
        <div className="flex-1 bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#1E293B]">Scheduled Products</h3>
            <a href="#" className="text-sm font-bold text-[#0F172A] hover:opacity-70 transition-opacity">
              View All
            </a>
          </div>

          <div className="space-y-8 my-auto">
            {scheduledProducts.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-[#D9A74A] via-[#A16A1F] to-[#613D0C] shadow-inner" />
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] leading-tight">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#94A3B8] font-medium mt-1">Scheduled for</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 text-xs font-bold text-[#64748B]">
                    <Calendar size={13} className="text-[#94A3B8]" />
                    <span>{item.date}</span>
                  </div>
                  <p className="text-[11px] font-medium text-[#94A3B8] mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Block */}
        <div className="flex-1 rounded-[22px] bg-white border border-[#F1F1F1] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-7 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#1E293B]">Notifications</h3>
            <a href="#" className="text-sm font-bold text-[#0F172A] hover:opacity-70 transition-opacity">
              View All
            </a>
          </div>

          <div className="space-y-5 my-auto">
            {notifications.map((notif, idx) => {
              const NotifIcon = notif.icon;
              return (
                <div key={idx} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: notif.bg }}
                    >
                      <NotifIcon size={18} style={{ color: notif.color }} />
                    </div>
                    <p className="text-sm font-semibold text-[#334155] leading-snug max-w-[180px] md:max-w-xs">
                      {notif.text}
                    </p>
                  </div>
                  <p className="text-xs font-medium text-[#94A3B8] shrink-0 text-right">
                    {notif.time}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}