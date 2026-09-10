"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  RotateCcw,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Box,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";
import { io, Socket } from "socket.io-client";

interface Order {
  rawId?: string;
  groupId?: string;
  id: string;
  customer: string;
  phone: string;
  email: string;
  payment: string;
  paymentStatus: string;
  paymentMode: string;
  paymentDot: string;
  status: "Processing" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  products: {
    name: string;
    variant?: string;
    qty: number;
    image?: string;
    bold?: boolean;
  }[];
  orderCount?: number;
  moreCount?: number;
  amount: string;
  codAmount?: number;
  date: string;
  time: string;
  raw?: any;
}

function extractCustomerDetails(rawItem: any, index: number): { name: string; phone: string; email: string } {
  if (!rawItem) {
    const fallbackNames = ["Rahul Sharma", "Priya Patel", "Aman Verma", "Sneha Singh", "Mohit Kumar"];
    const fallbackMobiles = ["98765 43210", "98765 12345", "98765 88765", "98765 22221", "98765 33332"];
    const fallbackEmails = [
      "rahul.sharma@example.com",
      "priya.patel@example.com",
      "aman.verma@example.com",
      "sneha.singh@example.com",
      "mohit.kumar@example.com",
    ];
    const idx = index % 5;
    return { name: fallbackNames[idx], phone: fallbackMobiles[idx], email: fallbackEmails[idx] };
  }

  let item = rawItem;
  if (item.order && typeof item.order === "object" && !Array.isArray(item.order)) {
    item = item.order;
  } else if (item.data && typeof item.data === "object" && !Array.isArray(item.data)) {
    item = item.data;
  }

  const u = typeof item.userId === "object" && item.userId
    ? item.userId
    : typeof item.user === "object" && item.user
    ? item.user
    : typeof item.user_id === "object" && item.user_id
    ? item.user_id
    : {};
  const c = typeof item.customer === "object" && item.customer ? item.customer : {};
  const s = typeof item.shipping_address === "object" && item.shipping_address ? item.shipping_address : typeof item.shippingAddress === "object" && item.shippingAddress ? item.shippingAddress : {};
  const b = typeof item.billing_address === "object" && item.billing_address ? item.billing_address : typeof item.billingAddress === "object" && item.billingAddress ? item.billingAddress : {};

  let name =
    u.name ||
    u.full_name ||
    u.fullName ||
    (u.first_name ? `${u.first_name} ${u.last_name || ""}`.trim() : "") ||
    c.name ||
    c.full_name ||
    c.fullName ||
    (c.first_name ? `${c.first_name} ${c.last_name || ""}`.trim() : "") ||
    (typeof item.customer === "string" && item.customer.trim() && item.customer !== "Customer" ? item.customer : "") ||
    s.full_name ||
    s.name ||
    s.fullName ||
    (s.first_name ? `${s.first_name} ${s.last_name || ""}`.trim() : "") ||
    b.full_name ||
    b.name ||
    item.customer_name ||
    item.customerName ||
    item.full_name ||
    item.fullName ||
    (typeof item.name === "string" && !item.name.toLowerCase().includes("order") ? item.name : "") ||
    "";

  let phone =
    u.mobile ||
    u.phone ||
    u.contact ||
    u.phone_number ||
    u.phoneNumber ||
    c.mobile ||
    c.phone ||
    c.contact ||
    c.phone_number ||
    c.phoneNumber ||
    s.phone ||
    s.mobile ||
    s.contact ||
    b.phone ||
    b.mobile ||
    item.customer_phone ||
    item.customerPhone ||
    item.mobile ||
    item.phone ||
    item.phone_number ||
    item.phoneNumber ||
    item.contact ||
    "";

  let email =
    u.email ||
    u.email_address ||
    u.emailAddress ||
    c.email ||
    c.email_address ||
    c.emailAddress ||
    s.email ||
    b.email ||
    item.customer_email ||
    item.customerEmail ||
    item.email ||
    item.email_address ||
    item.emailAddress ||
    "";

  if ((!name || name === "Customer") || !phone) {
    for (const key of Object.keys(item)) {
      const val = item[key];
      if (val && typeof val === "object" && !Array.isArray(val)) {
        if ((!name || name === "Customer") && (val.name || val.full_name || val.fullName)) {
          name = val.name || val.full_name || val.fullName;
        }
        if (!phone && (val.phone || val.mobile || val.contact || val.phone_number)) {
          phone = val.phone || val.mobile || val.contact || val.phone_number;
        }
        if (!email && (val.email || val.email_address)) {
          email = val.email || val.email_address;
        }
      }
    }
  }

  if (!name || name === "Customer") {
    if (email) {
      name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
    } else if (phone) {
      name = `Customer (${phone.slice(-4)})`;
    } else {
      const fallbackNames = ["Rahul Sharma", "Priya Patel", "Aman Verma", "Sneha Singh", "Mohit Kumar"];
      name = fallbackNames[index % 5];
    }
  }

  return { name, phone, email };
}

function mapApiOrderToUiOrder(item: any, index: number): Order {
  const mongoId = String(item._id || item.id || item.group_id || item.orderId || item.order_id || item.purchase_id || `order-${index}`);
  const groupId = String(item.group_id || item.groupId || item.order_group_id || "");
  const displayId = String(item.group_id || item.orderId || item.order_id || (item._id ? `#SV${item._id.slice(-5).toUpperCase()}` : `#SV${10254 + index}`));

  const { name: customerName, phone: customerPhone, email: customerEmail } = extractCustomerDetails(item, index);

  const payMode = String(item.payment_mode || item.payment_method || item.payment?.method || item.paymentMethod || "COD").toUpperCase();
  const payStatusRaw = String(item.payment_status || item.payment?.status || item.paymentStatus || "pending").toLowerCase();
  const payStatus = payStatusRaw.charAt(0).toUpperCase() + payStatusRaw.slice(1);
  
  let paymentText = `${payStatus} (${payMode})`;
  if (payMode === "COD") {
    paymentText = "COD";
  } else if (payStatusRaw === "refunded") {
    paymentText = "Refunded";
  }

  let paymentDot = "bg-[#d97706]";
  if (payStatusRaw === "refunded") {
    paymentDot = "bg-red-500";
  } else if (payStatusRaw === "paid" || payStatusRaw === "success") {
    paymentDot = "bg-emerald-500";
  } else if (payMode === "COD" || payStatusRaw === "pending") {
    paymentDot = "bg-amber-500";
  }

  const st = String(item.status || item.order_status || item.delivery_status || "Processing").toLowerCase();
  let status: Order["status"] = "Processing";
  if (st.includes("pack")) status = "Packed";
  else if (st.includes("ship") || st.includes("dispatch")) status = "Shipped";
  else if (st.includes("deliver")) status = "Delivered";
  else if (st.includes("cancel") || st.includes("refund")) status = "Cancelled";
  else if (st.includes("process") || st.includes("active") || st.includes("pending")) status = "Processing";

  const ordersArr = Array.isArray(item.orders) ? item.orders : [];
  const itemsFromOrders = ordersArr.flatMap((o: any) =>
    Array.isArray(o.items) ? o.items : Array.isArray(o.products) ? o.products : []
  );

  const rawProducts = Array.isArray(item.products)
    ? item.products
    : Array.isArray(item.items)
    ? item.items
    : Array.isArray(item.order_items)
    ? item.order_items
    : Array.isArray(item.product_details)
    ? item.product_details
    : itemsFromOrders;

  const orderCount = Number(item.orderCount ?? item.order_count ?? ordersArr.length ?? (rawProducts.length > 0 ? 1 : 0));

  let productsList: Order["products"] = [];
  if (rawProducts.length > 0) {
    productsList = rawProducts.slice(0, 2).map((p: any, idx: number) => {
      const pObj = p.product_details?.product || p.product || p;
      const pName =
        pObj.product_name ||
        pObj.name ||
        p.name ||
        "Wild Forest Multiflora Honey";

      const weight = pObj.variant?.weight || p.variant || p.weight || p.quantityUnit || p.unit || "";
      const unit = pObj.variant?.unit || p.unit || p.quantityUnit || "";
      const variantStr = weight ? (typeof weight === "number" ? `${weight}${unit || "g"}` : String(weight)) : "";

      const qty = Number(p.quantity || p.qty || 1);

      let rawImg =
        pObj.image?.image_url ||
        p.image ||
        p.image_url ||
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60";

      if (typeof rawImg === "object" && rawImg) {
        rawImg = rawImg.image_url || rawImg.url || "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60";
      }

      return {
        name: pName,
        variant: variantStr,
        qty,
        image: String(rawImg),
        bold: idx === 1,
      };
    });
  }

  const moreCount = rawProducts.length > 2 ? rawProducts.length - 2 : undefined;

  const og = typeof item.order_group_id === "object" && item.order_group_id ? item.order_group_id : {};
  const numAmount = item.finalAmount ?? og.finalAmount ?? item.totalAmount ?? og.totalAmount ?? item.total_amount ?? item.amount ?? item.grandTotal ?? 0;
  const amountStr =
    typeof numAmount === "number"
      ? `₹${numAmount.toLocaleString("en-IN")}`
      : String(numAmount).startsWith("₹")
      ? String(numAmount)
      : `₹${numAmount}`;

  const codAmount = Number(item.cod_amount ?? item.codAmount ?? og.cod_amount ?? 0);

  const dateObj = new Date(item.date || item.createdAt || item.orderDate || Date.now());
  const dateStr = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "";
  const timeStr = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    : "";

  return {
    rawId: mongoId,
    groupId,
    id: displayId,
    customer: customerName,
    phone: customerPhone,
    email: customerEmail,
    payment: paymentText,
    paymentStatus: payStatus,
    paymentMode: payMode,
    paymentDot,
    status,
    products: productsList,
    orderCount,
    moreCount,
    amount: amountStr,
    codAmount,
    date: dateStr,
    time: timeStr,
    raw: item,
  };
}

const allOrders: Order[] = [
  {
    id: "#SV10254",
    customer: "Rahul Sharma",
    phone: "9876543210",
    email: "",
    payment: "Paid (UPI)",
    paymentStatus: "Paid",
    paymentMode: "UPI",
    paymentDot: "bg-emerald-500",
    status: "Processing",
    products: [
      {
        name: "Wild Forest Multiflora Honey",
        variant: "1kg",
        qty: 2,
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
      },
      {
        name: "Gift Box Deluxe",
        variant: "Pack of 1",
        qty: 1,
        image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
        bold: true,
      },
    ],
    moreCount: 1,
    amount: "₹1,299",
    date: "31 May 2024",
    time: "10:45 AM",
  },
  {
    id: "#SV10255",
    customer: "Priya Patel",
    phone: "9876512345",
    email: "",
    payment: "Paid (Card)",
    paymentStatus: "Paid",
    paymentMode: "Card",
    paymentDot: "bg-emerald-500",
    status: "Packed",
    products: [
      {
        name: "Mustard Honey",
        variant: "500g",
        qty: 1,
        image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
      },
    ],
    amount: "₹699",
    date: "31 May 2024",
    time: "09:30 AM",
  },
  {
    id: "#SV10256",
    customer: "Aman Verma",
    phone: "9876588765",
    email: "",
    payment: "COD",
    paymentStatus: "Pending",
    paymentMode: "COD",
    paymentDot: "bg-blue-500",
    status: "Shipped",
    products: [
      {
        name: "Gift Box Deluxe",
        variant: "Pack of 1",
        qty: 1,
        image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=100&auto=format&fit=crop&q=60",
      },
    ],
    amount: "₹1,899",
    date: "31 May 2024",
    time: "08:15 AM",
  },
  {
    id: "#SV10257",
    customer: "Sneha Singh",
    phone: "9876522221",
    email: "",
    payment: "Paid (UPI)",
    paymentStatus: "Paid",
    paymentMode: "UPI",
    paymentDot: "bg-emerald-500",
    status: "Delivered",
    products: [
      {
        name: "Raw Sidr Honey",
        variant: "1kg",
        qty: 3,
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
      },
    ],
    amount: "₹2,250",
    date: "31 May 2024",
    time: "06:40 PM",
  },
  {
    id: "#SV10258",
    customer: "Mohit Kumar",
    phone: "9876533332",
    email: "",
    payment: "Refunded",
    paymentStatus: "Refunded",
    paymentMode: "UPI",
    paymentDot: "bg-red-500",
    status: "Cancelled",
    products: [
      {
        name: "Tulsi Honey",
        variant: "500g",
        qty: 2,
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=60",
      },
    ],
    amount: "₹950",
    date: "31 May 2024",
    time: "05:20 PM",
  },
];

const statusStyles: Record<string, string> = {
  Processing: "bg-amber-50 text-amber-700 border border-amber-200 font-bold",
  Pending: "bg-amber-50 text-amber-700 border border-amber-200 font-bold",
  Confirmed: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold",
  Packed: "bg-blue-50 text-blue-700 border border-blue-200 font-bold",
  Shipped: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold",
  Delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold",
  Cancelled: "bg-red-50 text-red-700 border border-red-200 font-bold",
};

const statusOptions = ["All Statuses", "Processing", "Packed", "Shipped", "Delivered", "Cancelled"];
const paymentOptions = ["All Payments", "Paid (UPI)", "Paid (Card)", "COD", "Refunded"];

const TOTAL_RECORDS = 1248;
const TOTAL_PAGES = 125;

function FilterDropdown({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-col items-start px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors min-w-[140px] text-left"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          {value}
          <ChevronDown
            size={14}
            className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-20 max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                  opt === value ? "text-orange-500 font-medium" : "text-gray-600"
                }`}
              >
                {opt}
                {opt === value && <Check size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrdersTable() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(allOrders);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRecords, setTotalRecords] = useState<number>(TOTAL_RECORDS);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [paymentFilter, setPaymentFilter] = useState("All Payments");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sudhveda_token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/order-dashboard/orders`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const rawList: any[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.orders)
          ? json.orders
          : Array.isArray(json)
          ? json
          : Array.isArray(json.data?.orders)
          ? json.data.orders
          : [];

        if (rawList.length > 0) {
          const mapped = rawList.map((item, idx) => mapApiOrderToUiOrder(item, idx));
          setOrders(mapped);
          setTotalRecords(json.total || json.pagination?.totalRecords || mapped.length);
        }
      }
    } catch (err) {
      console.error("Error fetching orders from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();

    const socket: Socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("join-admin-room");
    });

    const handleSocketNewOrder = (data: any) => {
      console.log("Socket new-order received in OrdersTable:", data);
      const rawItem = data?.order || data?.data || data;
      if (rawItem && typeof rawItem === "object") {
        const mapped = mapApiOrderToUiOrder(rawItem, 0);
        setOrders((prev) => {
          const exists = prev.some((o) => o.rawId === mapped.rawId || o.id === mapped.id);
          if (exists) return prev;
          return [mapped, ...prev];
        });
      }
      void fetchOrders();
    };

    socket.on("new-order", handleSocketNewOrder);
    socket.on("newOrder", handleSocketNewOrder);
    socket.on("order-created", handleSocketNewOrder);

    return () => {
      socket.disconnect();
    };
  }, []);

  const viewOrder = (orderId: string, rawId?: string) => {
    const targetId = rawId || orderId;
    router.push(`/order/vieworder?id=${encodeURIComponent(targetId)}`);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        search.trim() === "" ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase()) ||
        order.products.some((p) => p.name.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === "All Statuses" || order.status === statusFilter;
      const matchesPayment = paymentFilter === "All Payments" || order.payment === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length);

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, startIndex, endIndex]);

  const allSelected =
    filteredOrders.length > 0 && filteredOrders.every((o) => selected.includes(o.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !filteredOrders.some((o) => o.id === id)));
    } else {
      setSelected((prev) => [
        ...prev,
        ...filteredOrders.map((o) => o.id).filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setSearch("");
    setStatusFilter("All Statuses");
    setPaymentFilter("All Payments");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Dynamic page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="w-full mt-6 space-y-4">
      {/* Filters bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search order ID, customer, product..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 shrink-0">
            <FilterDropdown
              label="STATUS"
              value={statusFilter}
              options={statusOptions}
              onSelect={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            />
            <FilterDropdown
              label="PAYMENT"
              value={paymentFilter}
              options={paymentOptions}
              onSelect={(v) => {
                setPaymentFilter(v);
                setCurrentPage(1);
              }}
            />
            <button className="flex flex-col items-start px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors col-span-2 sm:col-span-1 min-w-[170px] text-left">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Date Range
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Calendar size={13} className="text-gray-400 shrink-0" />
                01 May - 31 May 2024
              </span>
            </button>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="mt-3.5 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="w-12 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 accent-orange-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Order ID
                </th>
                <th className="px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Customer
                </th>
                <th className="px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Payment
                </th>
                <th className="px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Products
                </th>
                <th className="px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Date
                </th>
                <th className="px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin text-orange-500" />
                      <span>Loading orders from server...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No orders match your filters.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isChecked = selected.includes(order.id);
                  return (
                    <tr
                      key={order.rawId || order.id}
                      onClick={() => viewOrder(order.id, order.rawId)}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(order.id)}
                          className="w-4 h-4 rounded border-gray-300 accent-orange-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="font-semibold text-gray-800 text-sm leading-snug">{order.customer}</p>
                        {order.email && (
                          <p className="text-xs text-gray-400 font-medium truncate max-w-[190px]">
                            {order.email}
                          </p>
                        )}
                        {order.phone && (
                          <p className="text-xs text-gray-400 font-medium">{order.phone}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5 text-xs font-semibold">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                order.paymentStatus.toLowerCase() === "refunded"
                                  ? "bg-red-500"
                                  : order.paymentStatus.toLowerCase() === "pending"
                                  ? "bg-blue-500"
                                  : "bg-emerald-500"
                              }`}
                            />
                            <span
                              className={
                                order.paymentStatus.toLowerCase() === "refunded"
                                  ? "text-red-500"
                                  : "text-gray-800"
                              }
                            >
                              {order.paymentStatus}
                            </span>
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {order.paymentMode}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            statusStyles[order.status]
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 min-w-[240px]">
                        {order.products.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {order.products.map((p, i) => (
                              <div key={i} className="flex items-center gap-2.5">
                                {p.image && (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-9 h-9 rounded-lg object-cover bg-amber-50 shrink-0 border border-amber-100 shadow-sm"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-800 text-xs leading-snug">
                                    {p.name}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5 font-medium">
                                    {p.variant && <span>{p.variant}</span>}
                                    {p.variant && <span>•</span>}
                                    <span className="text-orange-600 font-semibold bg-orange-50 px-1.5 py-0.2 rounded">
                                      Qty: {p.qty}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {order.moreCount && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] rounded-md font-medium w-fit">
                                +{order.moreCount} more item{order.moreCount > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-semibold text-xs rounded-lg border border-amber-200/60 inline-flex items-center gap-1.5">
                              <Box size={14} className="text-amber-500 shrink-0" />
                              {order.orderCount || 1} {(order.orderCount || 1) === 1 ? "Order" : "Orders"}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">
                        {order.amount}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="text-gray-700">{order.date}</p>
                        <p className="text-xs text-gray-400">{order.time}</p>
                      </td>
                      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => viewOrder(order.id, order.rawId)}
                          className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors"
                          aria-label={`View ${order.id}`}
                        >
                          <Eye size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            Showing {filteredOrders.length === 0 ? 0 : startIndex + 1} to {endIndex} of{" "}
            {totalRecords.toLocaleString("en-IN")} orders
          </p>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  page === currentPage
                    ? "bg-orange-500 text-white font-bold shadow-xs"
                    : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
            {totalPages > pageNumbers[pageNumbers.length - 1] && (
              <>
                {totalPages > pageNumbers[pageNumbers.length - 1] + 1 && (
                  <span className="text-gray-400 px-1">...</span>
                )}
                <button
                  onClick={() => goToPage(totalPages)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentPage === totalPages
                      ? "bg-orange-500 text-white font-bold shadow-xs"
                      : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}