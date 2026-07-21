"use client";

import { Bell, Search, ChevronDown, Menu, X, Pencil } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onMenuClick: () => void;
}

// route → title mapping (sidebar ke href se match karega)
// order matters: longer/more-specific routes checked first if needed
const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/order": "Order",
  "/product": "Product",
  "/inventory": "Inventory",
  "/custom-gift-orders": "Custom Gift Orders",
  "/promotions": "Promotions",
  "/website-content": "Website Content",
  "/notifications": "Notifications",
  "/reports": "Reports",
  "/settings": "Settings",
};

function getTitleForPath(pathname: string): string {
  const path = pathname.toLowerCase();

  // exact/known top-level routes first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // fallback: match by keyword anywhere in the path, so it works
  // regardless of nesting or prefix (e.g. /orders/1052, /order-details/1052,
  // /admin/orders/1052 all resolve correctly)
  if (path.includes("order")) return "Order";
  if (path.includes("product")) return "Product";
  if (path.includes("inventory")) return "Inventory";
  if (path.includes("gift")) return "Custom Gift Orders";
  if (path.includes("promotion")) return "Promotions";
  if (path.includes("website") || path.includes("content")) return "Website Content";
  if (path.includes("notification")) return "Notifications";
  if (path.includes("report")) return "Reports";
  if (path.includes("setting")) return "Settings";
  if (path.includes("dashboard")) return "Dashboard";

  return "Dashboard";
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const pathname = usePathname();

  const currentTitle = getTitleForPath(pathname);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 px-3 sm:px-5 md:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm">
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors shrink-0"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-base sm:text-xl md:text-2xl lg:text-[26px] font-bold text-gray-900 truncate max-w-[120px] sm:max-w-xs">
            {currentTitle}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          <div className="hidden sm:block relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-24 sm:w-36 md:w-48 lg:w-64 pl-9 pr-3 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 hidden md:inline-block">⌘K</kbd>
          </div>

          <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="sm:hidden p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
            <Search size={18} className="text-gray-500" />
          </button>

          <button className="p-1.5 sm:p-2 text-gray-500 hover:text-orange-500 transition-colors hidden xs:flex">
            <Pencil size={18} className="sm:w-5 sm:h-5" />
          </button>

          <button className="relative p-1 text-gray-500 hover:text-gray-700 transition-colors shrink-0">
            <Bell size={20} className="sm:w-[22px] sm:h-[22px]" />
            <span className="absolute -top-1 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-amber-500 text-white text-[10px] font-semibold rounded-full">4</span>
          </button>

          <div className="hidden sm:block h-7 w-px bg-gray-200" />

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 cursor-pointer group shrink-0">
            <img src="https://i.pravatar.cc/150?img=12" alt="Admin" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-orange-200 transition-all" />
            <div className="hidden md:block leading-tight min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">Admin</p>
              <p className="text-xs text-gray-400 truncate">Owner</p>
            </div>
            <ChevronDown size={16} className="hidden sm:block text-gray-400 group-hover:text-gray-600" />
          </div>
        </div>
      </header>

      {mobileSearchOpen && (
        <div className="sm:hidden sticky top-[60px] z-40 bg-white px-4 py-3 border-b border-gray-100 shadow-sm">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search anything..." className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400" autoFocus />
            <button onClick={() => setMobileSearchOpen(false)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100">
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}