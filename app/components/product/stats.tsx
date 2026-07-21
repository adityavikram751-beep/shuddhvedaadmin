import {
  Package,
  ShoppingCart,
  Gift,
  TriangleAlert,
  ChevronRight,
} from "lucide-react";

const cards = [
  {
    title: "Total Products",
    value: "8",
    desc: "Across all categories",
    icon: Package,
    color: "#FF7A00",
    bg: "#FFF4EB",
  },
  {
    title: "Honey Products",
    value: "6",
    desc: "Honey related items",
    icon: ShoppingCart,
    color: "#22C55E",
    bg: "#ECFDF3",
  },
  {
    title: "Gift Boxes",
    value: "₹8,450",
    desc: "Gift box products",
    icon: Gift,
    color: "#A855F7",
    bg: "#F5EEFF",
  },
  {
    title: "Low Stock Items",
    value: "2",
    desc: "Need attention",
    icon: TriangleAlert,
    color: "#EF4444",
    bg: "#FEF2F2",
  },
];

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 p-6 ">
      {cards.map((item, i) => {
        const Icon = item.icon;

        return (
          <div
            key={i}
            className="rounded-[22px] border border-[#F1F1F1] bg-white px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: item.bg }}
              >
                <Icon size={22} strokeWidth={2} style={{ color: item.color }} />
              </div>

              <div className="text-right">
                <p className="text-[15px] font-medium text-[#6B7280]">
                  {item.title}
                </p>

                <h2 className="mt-1 text-[24px] font-bold leading-none text-[#1F1B2D]">
                  {item.value}
                </h2>
              </div>
            </div>

            <div className="mt-9 flex items-center justify-between">
              <p className="text-sm text-[#98A2B3]">{item.desc}</p>

              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: item.bg }}
              >
                <ChevronRight size={18} style={{ color: item.color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}