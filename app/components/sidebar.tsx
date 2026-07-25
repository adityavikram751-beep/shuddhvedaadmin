"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Archive,
  Gift,
  Tag,
  Monitor,
  Bell,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";

interface SubNavItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  chevron: boolean;
  keyword: string; // used for robust "am I active" matching on nested routes
  subItems?: SubNavItem[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, chevron: false, keyword: "dashboard" },
  { label: "Orders", href: "/order", icon: ShoppingBag, chevron: true, keyword: "order" },
  {
    label: "Products",
    href: "/product",
    icon: Package,
    chevron: true,
    keyword: "product",
    subItems: [
      { label: "Product List", href: "/product" },
      { label: "Add Product", href: "/product/addproduct" },
      { label: "Add Category", href: "/product/productcontent" },

    ],
  },
  { label: "Inventory", href: "/inventory", icon: Archive, chevron: true, keyword: "inventory" },
  { label: "Custom Gift Orders", href: "/customgift", icon: Gift, chevron: false, keyword: "gift" },
  { label: "Promotions", href: "/promotion", icon: Tag, chevron: true, keyword: "promotion" },
  { label: "Website Content", href: "/website-content", icon: Monitor, chevron: true, keyword: "content" },
  { label: "Notifications", href: "/notifications", icon: Bell, chevron: true, keyword: "notification" },
  { label: "Reports", href: "/reports", icon: BarChart3, chevron: true, keyword: "report" },
  { label: "Settings", href: "/settings", icon: Settings, chevron: true, keyword: "setting" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Works for any nested route: /orders/1052, /order-details/1052, etc.
// all correctly match the "Orders" nav item.
function isNavItemActive(pathname: string, item: NavItem): boolean {
  const path = pathname.toLowerCase();
  if (path === item.href) return true;
  return path.includes(item.keyword);
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleLogout = () => {
    // Clear any stored auth/session data here if needed, e.g.:
    // localStorage.removeItem("token");
    onClose();
    router.push("/login");
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto-expand the group that matches the current route (e.g. keep
  // "Products" open when on /product/add) so the dropdown state stays in
  // sync with navigation instead of resetting.
  useEffect(() => {
    const active = navItems.find((item) => item.subItems && isNavItemActive(pathname, item));
    setExpanded(active ? active.label : null);
  }, [pathname]);

  const handleParentClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.subItems && item.subItems.length > 0) {
      e.preventDefault();
      setExpanded((prev) => (prev === item.label ? null : item.label));
    } else {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:sticky
          top-[64px] md:top-0
          left-0
          h-[calc(100vh-64px)] md:h-screen
          w-64
          shrink-0
          bg-white border-r border-gray-100
          z-40
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <Image
              src="/yellow logo.png"
              alt="ShuddhVeda Logo"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />
            <div className="min-w-0">
              <h2 className="text-[18px] font-bold leading-tight text-[#2F241C]">
                ShuddhVeda
              </h2>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#A78B6A]">
                ADMIN PANEL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {navItems.map((item) => {
            const { label, href, icon: Icon, chevron, subItems } = item;
            const isActive = isNavItemActive(pathname, item);
            const isExpanded = expanded === label;
            const hasSubItems = !!subItems && subItems.length > 0;

            return (
              <div key={label}>
                <Link
                  href={href}
                  onClick={(e) => handleParentClick(item, e)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-orange-50 text-orange-500"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} />
                    {label}
                  </span>
                  {chevron &&
                    (hasSubItems ? (
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    ) : (
                      <ChevronRight size={16} className="text-gray-300" />
                    ))}
                </Link>

                {/* Dropdown sub-items */}
                {hasSubItems && (
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${
                      isExpanded ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="ml-6 pl-3 border-l border-gray-100 space-y-1">
                      {subItems!.map((sub) => {
                        const isSubActive = pathname.toLowerCase() === sub.href.toLowerCase();
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={onClose}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors
                              ${
                                isSubActive
                                  ? "text-orange-500 font-medium bg-orange-50"
                                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                              }`}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 px-3 py-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <HelpCircle size={18} />
            Help Center
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}