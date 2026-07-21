"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ================= Mock Datasets =================

const productPerformance = [
  { name: "Raw Honey 250g", revenue: "₹4,20,000", percentage: 95 },
  { name: "Wild Honey 500g", revenue: "₹3,85,000", percentage: 85 },
  { name: "Forest Honey", revenue: "₹2,10,000", percentage: 50 },
  { name: "Organic Honey", revenue: "₹1,80,000", percentage: 42 },
  { name: "Gift Box", revenue: "₹53,500", percentage: 15 },
];

const inventoryData = [
  { name: "In Stock", value: 248, percentage: "75%", color: "#7A5200" },
  { name: "Low Stock", value: 42, percentage: "15%", color: "#EAB308" },
  { name: "Out of Stock", value: 12, percentage: "10%", color: "#C22525" },
];

const promotionPerformance = [
  { code: "FESTIVE20", redemptions: "452 Redemptions", percentage: 85 },
  { code: "SUMMER10", redemptions: "215 Redemptions", percentage: 48 },
  { code: "WELCOME5", redemptions: "188 Redemptions", percentage: 40 },
  { code: "NEWUSER", redemptions: "94 Redemptions", percentage: 22 },
];

export default function PerformanceAnalytics() {
  return (
    // 👈 `min-h-screen` ko hata ke `h-auto w-full` kar diya hai taaki faltu space na bache
    <div className="w-full bg-[#F8FAFC] -mt-6 p-4 md:p-6 text-[#0F172A] font-sans pb-6">
      <div className="max-w-[1300px] mx-auto space-y-6">

        {/* ---------------- Top Grid: Product Performance & Inventory Status ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Block: Product Performance */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">Product Performance</h3>
                <p className="text-xs font-medium text-[#94A3B8] mt-0.5">
                  Top revenue generating products
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-[#F1F5F9] text-xs font-bold text-[#64748B]">
                Top 5
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {productPerformance.map((prod, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-[#334155]">{prod.name}</span>
                    <span className="text-[#0F172A]">{prod.revenue}</span>
                  </div>

                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7A5200] rounded-full transition-all duration-500"
                      style={{ width: `${prod.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Block: Inventory Status */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">Inventory Status</h3>
                <p className="text-xs font-medium text-[#94A3B8] mt-0.5">
                  Real-time stock level distribution
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-[#F1F5F9] text-xs font-bold text-[#64748B]">
                Current
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 pt-2">
              <div className="relative h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {inventoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-[#0F172A]">84%</span>
                  <span className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider">OPTIMAL</span>
                </div>
              </div>

              <div className="space-y-4">
                {inventoryData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full shrink-0 mt-0.5"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="text-xs font-extrabold text-[#0F172A] leading-tight">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] font-semibold mt-0.5">
                        {item.value} items ({item.percentage})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ---------------- Bottom Block: Promotion Performance ---------------- */}
        <div className="bg-white rounded-3xl p-6 border border-[#F1F5F9] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-[#0F172A]">Promotion Performance</h3>
              <p className="text-xs font-medium text-[#94A3B8] mt-0.5">
                Coupon code usage and effectiveness
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#F1F5F9] text-xs font-bold text-[#64748B]">
              Monthly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {promotionPerformance.map((promo, idx) => (
              <div
                key={idx}
                className="bg-[#FFFBF5] border border-[#FDE68A]/60 rounded-2xl p-5 text-center space-y-3"
              >
                <div>
                  <h4 className="text-base font-black text-[#7A5200] tracking-wider">
                    {promo.code}
                  </h4>
                  <p className="text-xs font-semibold text-[#94A3B8] mt-0.5">
                    {promo.redemptions}
                  </p>
                </div>

                <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7A5200] rounded-full"
                    style={{ width: `${promo.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}