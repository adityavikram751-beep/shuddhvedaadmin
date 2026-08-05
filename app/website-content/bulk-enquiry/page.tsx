"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/sidebar";
// import BulkEnquiry from "@/app/components/website-content/bulkenquiry";

export default function CustomerQueryPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

      <div className="flex flex-1 flex-col">
        <Header onMenuClick={() => setOpen(true)} />
        <main className="flex-1 p-6" />
        {/* <BulkEnquiry/> */}
      </div>
    </div>
  );
}
