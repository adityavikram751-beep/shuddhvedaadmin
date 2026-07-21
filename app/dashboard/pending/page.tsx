"use client";

import { useState } from "react";
import Sidebar from "@/app/components/sidebar";
import Header from "@/app/components/Header";
import Pending from "@/app/components/dashboard/pending";

export default function Dashboard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar
        isOpen={open}
        onClose={() => setOpen(false)}
      />

      <div className="flex flex-1 flex-col">
        <Header onMenuClick={() => setOpen(true)} />

        <main className="flex-1 p-6">
          <Pending/>
        </main>
      </div>
    </div>
  );
}