"use client";

import { useState } from "react";
import Sidebar from "@/app/components/sidebar";
import Header from "@/app/components/Header";
import EmailOnlySubscribers from "@/app/components/subscribe/EmailOnlySubscribers";
import DetailedSubscribers from "@/app/components/subscribe/DetailedSubscribers";
import { Mail, Users } from "lucide-react";

export default function SubscribersMainPage() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"detailed" | "email">("detailed");

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

      <div className="flex flex-1 flex-col">
        <Header onMenuClick={() => setOpen(true)} />

        <main className="flex-1 p-6 space-y-6">
          {/* Tab Selection Navigation */}
          <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-2 max-w-md">
            <button
              onClick={() => setActiveTab("detailed")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "detailed"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Users size={16} />
              <span>User Detail</span>
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "email"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Mail size={16} />
              <span>User Email</span>
            </button>
          </div>

          {/* Render Active View */}
          {activeTab === "detailed" ? <DetailedSubscribers /> : <EmailOnlySubscribers />}
        </main>
      </div>
    </div>
  );
}
