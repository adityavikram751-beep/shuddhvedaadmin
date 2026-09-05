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
  Loader2,
  UserCheck,
  Users,
} from "lucide-react";
import { API_BASE_URL, clearSession } from "@/lib/auth";

interface SubNavItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  chevron: boolean;
  keyword: string;
  subItems?: SubNavItem[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, chevron: false, keyword: "dashboard" },
  { label: "Orders", href: "/order", icon: ShoppingBag, chevron: false, keyword: "order" },
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
      { label: "Gift Plan", href: "/product/gift-plan" },
    ],
  },
  { label: "Inventory", href: "/inventory", icon: Archive, chevron: false, keyword: "inventory" },
  // { label: "Custom Gift Orders", href: "/customgift", icon: Gift, chevron: false, keyword: "gift" },
  {
    label: "Subscribe",
    href: "/subscribe",
    icon: UserCheck,
    chevron: true,
    keyword: "subscribe",
    subItems: [
      { label: "Subscribe Plan Update", href: "/subscribe" },
      { label: "Subscribe Plan Order", href: "/subscribe/delivery-order" },
    ],
  },
  // { label: "Influencer Connects", href: "/influencer-connects", icon: Users, chevron: false, keyword: "influencer" },
  { label: "Promotions", href: "/promotion", icon: Tag, chevron: false, keyword: "promotion" },
  {
    label: "Website Content",
    href: "/website-content",
    icon: Monitor,
    chevron: true,
    keyword: "content",
    subItems: [
      { label: "Coming Product", href: "/website-content/coming-product" },
      { label: "Health Benefit", href: "/website-content/health-benefit" },
      { label: "Customer Review", href: "/website-content/customer-review" },
      { label: "Customer Query", href: "/website-content/customer-query" },
      { label: "Contactus", href: "/website-content/contactus" },
    ],
  },
  { label: "Notifications", href: "/notifications", icon: Bell, chevron: false, keyword: "notification" },
  { label: "Reports", href: "/reports", icon: BarChart3, chevron: false, keyword: "report" },
  { label: "Settings", href: "/settings", icon: Settings, chevron: false, keyword: "setting" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function isNavItemActive(pathname: string, item: NavItem): boolean {
  const path = pathname.toLowerCase();
  if (path === item.href) return true;
  return path.includes(item.keyword);
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Logout Handler with POST API
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${API_BASE_URL}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      clearSession();
      setIsLoggingOut(false);
      onClose();
      window.location.href = "/";
    }
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

  const activeGroup = navItems.find((item) => item.subItems && isNavItemActive(pathname, item));

  useEffect(() => {
    if (activeGroup?.label) {
      setOpenDropdowns((prev) => {
        if (prev[activeGroup.label] === undefined) {
          return { ...prev, [activeGroup.label]: true };
        }
        return prev;
      });
    }
  }, [pathname, activeGroup?.label]);

  const handleParentClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.subItems && item.subItems.length > 0) {
      e.preventDefault();
      setOpenDropdowns((prev) => {
        const currentlyOpen =
          prev[item.label] !== undefined
            ? prev[item.label]
            : activeGroup?.label === item.label;
        return {
          ...prev,
          [item.label]: !currentlyOpen,
        };
      });
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
        <div className="relative px-5 py-4 border-b border-gray-100 flex flex-col items-center justify-center text-center">
          <Image
            src="/yellow logo.png"
            alt="ShuddhVeda Logo"
            width={80}
            height={80}
            className="h-16 w-auto object-contain"
            priority
          />
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700 absolute right-4 top-4"
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
            const isExpanded =
              openDropdowns[label] !== undefined
                ? openDropdowns[label]
                : activeGroup?.label === label;
            const hasSubItems = !!subItems && subItems.length > 0;

            return (
              <div key={label}>
                <Link
                  href={href}
                  onClick={(e) => handleParentClick(item, e)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
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
                        className={`text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                          }`}
                      />
                    ) : (
                      <ChevronRight size={16} className="text-gray-300" />
                    ))}
                </Link>

                {/* Dropdown sub-items */}
                {hasSubItems && (
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded
                      ? "max-h-64 opacity-100 mt-1 overflow-y-auto"
                      : "max-h-0 opacity-0"
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
                              ${isSubActive
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

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
          >
            {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}