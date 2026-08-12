"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Image,
  MessageSquareQuote,
  HelpCircle,
  Tag,
  BarChart3,
  Settings,
  PackageOpen,
  Ticket,
  Gift,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Package },
  { label: "Categories", href: "/categories", icon: Tag },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Bulk Orders", href: "/bulk-orders", icon: PackageOpen },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Banners", href: "/banners", icon: Image },
  { label: "Deals", href: "/deals", icon: Gift },
  { label: "Testimonials", href: "/testimonials", icon: MessageSquareQuote },
  { label: "FAQ", href: "/faq", icon: HelpCircle },
  { label: "Coupons", href: "/coupons", icon: Ticket },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-[72px]" : "w-64"
      } bg-sidebar text-white flex flex-col transition-all duration-300 ease-in-out shrink-0`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/10 shrink-0">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-sm">
              V
            </div>
            <span className="text-lg font-bold tracking-tight">
              Vrateez <span className="text-primary text-xs font-medium ml-1">CMS</span>
            </span>
          </Link>
        ) : (
          <Link href="/" className="mx-auto">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-sm">
              V
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-white/60 hover:text-white hover:bg-sidebar-hover"
              }`}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && (
                <span className="animate-slideIn">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-sidebar-hover transition-colors text-sm"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
