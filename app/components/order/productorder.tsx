"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";

interface Order {
  id: string;
  customer: string;
  phone: string;
  payment: string;
  paymentDot: string;
  status: "Processing" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  products: { name: string; bold?: boolean }[];
  moreCount?: number;
  amount: string;
  date: string;
  time: string;
}

const allOrders: Order[] = [
  {
    id: "#SV10254",
    customer: "Rahul Sharma",
    phone: "9876543210",
    payment: "Paid (UPI)",
    paymentDot: "bg-emerald-500",
    status: "Processing",
    products: [{ name: "Wild Forest Honey (1kg) × 2" }, { name: "Gift Box × 1", bold: true }],
    moreCount: 1,
    amount: "₹1,299",
    date: "31 May 2024",
    time: "10:45 AM",
  },
  {
    id: "#SV10255",
    customer: "Priya Patel",
    phone: "9876512345",
    payment: "Paid (Card)",
    paymentDot: "bg-emerald-500",
    status: "Packed",
    products: [{ name: "Mustard Honey (500g) × 1" }, { name: "Honey Dipper × 1" }],
    amount: "₹699",
    date: "31 May 2024",
    time: "09:30 AM",
  },
  {
    id: "#SV10256",
    customer: "Aman Verma",
    phone: "9876588765",
    payment: "COD",
    paymentDot: "bg-blue-500",
    status: "Shipped",
    products: [{ name: "Gift Box Deluxe × 1" }, { name: "Wild Forest Honey (1kg) × 1" }],
    amount: "₹1,899",
    date: "31 May 2024",
    time: "08:15 AM",
  },
  {
    id: "#SV10257",
    customer: "Sneha Singh",
    phone: "9876522221",
    payment: "Paid (UPI)",
    paymentDot: "bg-emerald-500",
    status: "Delivered",
    products: [{ name: "Raw Honey (1kg) × 3" }],
    amount: "₹2,250",
    date: "31 May 2024",
    time: "06:40 PM",
  },
  {
    id: "#SV10258",
    customer: "Mohit Kumar",
    phone: "9876533332",
    payment: "Refunded",
    paymentDot: "bg-red-500",
    status: "Cancelled",
    products: [{ name: "Tulsi Honey (500g) × 2" }],
    amount: "₹950",
    date: "31 May 2024",
    time: "05:20 PM",
  },
];

const statusStyles: Record<Order["status"], string> = {
  Processing: "bg-orange-50 text-orange-500",
  Packed: "bg-amber-50 text-amber-600",
  Shipped: "bg-blue-50 text-blue-500",
  Delivered: "bg-emerald-50 text-emerald-600",
  Cancelled: "bg-red-50 text-red-500",
};

const statusOptions = ["All Statuses", "Processing", "Packed", "Shipped", "Delivered", "Cancelled"];
const paymentOptions = ["All Payments", "Paid (UPI)", "Paid (Card)", "COD", "Refunded"];
const courierOptions = ["All Couriers", "Delhivery", "Bluedart", "Ekart", "DTDC"];

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
  const [selected, setSelected] = useState<string[]>(["#SV10254"]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [paymentFilter, setPaymentFilter] = useState("All Payments");
  const [courierFilter, setCourierFilter] = useState("All Couriers");
  const [currentPage, setCurrentPage] = useState(1);

  const viewOrder = (orderId: string) => {
    // "#SV10254" -> "10254"
    const numericId = orderId.replace("#SV", "").replace("#", "");
    router.push(`/order/vieworder`);
  };

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const matchesSearch =
        search.trim() === "" ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase()) ||
        order.products.some((p) => p.name.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === "All Statuses" || order.status === statusFilter;
      const matchesPayment = paymentFilter === "All Payments" || order.payment === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [search, statusFilter, paymentFilter]);

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
    setCourierFilter("All Couriers");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) setCurrentPage(page);
  };

  // Page numbers to show (1,2,3,4,5), keeping currentPage visible
  const pageNumbers = useMemo(() => {
    const nums = new Set<number>([1, 2, 3, 4, 5, currentPage]);
    return Array.from(nums)
      .filter((n) => n >= 1 && n <= 5)
      .sort((a, b) => a - b);
  }, [currentPage]);

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
            <FilterDropdown
              label="COURIER"
              value={courierFilter}
              options={courierOptions}
              onSelect={setCourierFilter}
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
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No orders match your filters.
                  </td>
                </tr>
              )}
              {filteredOrders.map((order) => {
                const isChecked = selected.includes(order.id);
                return (
                  <tr
                    key={order.id}
                    onClick={() => viewOrder(order.id)}
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
                      <p className="font-semibold text-gray-800">{order.customer}</p>
                      <p className="text-xs text-gray-400">{order.phone}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            order.payment === "Refunded" ? "" : order.paymentDot
                          }`}
                          style={
                            order.payment === "Refunded"
                              ? { backgroundColor: "#ef4444" }
                              : undefined
                          }
                        />
                        <span
                          className={order.payment === "Refunded" ? "text-red-500" : ""}
                        >
                          {order.payment}
                        </span>
                      </span>
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
                    <td className="px-4 py-4 min-w-[200px]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {order.products.map((p, i) => (
                          <span
                            key={i}
                            className={
                              p.bold
                                ? "font-semibold text-gray-800 text-sm"
                                : "text-gray-500 text-sm"
                            }
                          >
                            {p.name}
                            {i < order.products.length - 1 && !order.moreCount && <br />}
                          </span>
                        ))}
                        {order.moreCount && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md font-medium">
                            +{order.moreCount} more
                          </span>
                        )}
                      </div>
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
                        onClick={() => viewOrder(order.id)}
                        className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors"
                        aria-label={`View ${order.id}`}
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            Showing {filteredOrders.length === 0 ? 0 : 1} to {filteredOrders.length} of{" "}
            {TOTAL_RECORDS.toLocaleString("en-IN")} orders
          </p>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
            <span className="text-gray-400 px-1">...</span>
            <button
              onClick={() => goToPage(TOTAL_PAGES)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                currentPage === TOTAL_PAGES
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {TOTAL_PAGES}
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === TOTAL_PAGES}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}