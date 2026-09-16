"use client";

import { useState } from "react";
import Sidebar from "@/app/components/sidebar";
import Header from "@/app/components/Header";
import Stats from "@/app/components/order/stats";
import ProductOrder from "@/app/components/order/productorder";

export default function Order() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      <Sidebar
        isOpen={open}
        onClose={() => setOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        <Header onMenuClick={() => setOpen(true)} />

        <main className="flex-1 p-3.5 sm:p-5 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
          <Stats />
          <ProductOrder />
        </main>
      </div>
    </div>
  );
}