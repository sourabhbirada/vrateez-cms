"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Eye, Download, ArrowUpDown } from "lucide-react";
import { apiFetch } from "@/lib/api";

type OrderItem = {
  name: string;
  quantity: number;
};

type OrderAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
};

type AdminOrder = {
  _id: string;
  user?: { name?: string; email?: string; phone?: string } | null;
  guestInfo?: { name?: string; email?: string; phone?: string } | null;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  paymentMethod: "card" | "upi" | "netbanking" | "cod" | "razorpay";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  contactPhone?: string;
  createdAt: string;
};

const statusColor: Record<AdminOrder["orderStatus"], string> = {
  placed: "bg-info/10 text-info",
  processing: "bg-warning/10 text-warning",
  shipped: "bg-info/10 text-info",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
};

const paymentColor: Record<AdminOrder["paymentStatus"], string> = {
  paid: "bg-success/10 text-success",
  failed: "bg-danger/10 text-danger",
  pending: "bg-warning/10 text-warning",
  refunded: "bg-info/10 text-info",
};

function toTitle(input: string) {
  return input
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminOrder["orderStatus"]>("all");
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await apiFetch<{ items: AdminOrder[] }>("/orders/admin");
        setOrders(data.items || []);
      } catch {
        setOrders([]);
      }
    }

    void loadOrders();
  }, []);

  const statuses: Array<{ key: "all" | AdminOrder["orderStatus"]; label: string }> = [
    { key: "all", label: "All" },
    { key: "placed", label: "Placed" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const filtered = orders.filter((order) => {
    const customerName = order.user?.name || order.guestInfo?.name || "Guest";
    const customerEmail = order.user?.email || order.guestInfo?.email || "";
    const query = search.toLowerCase();
    const matchSearch =
      order._id.toLowerCase().includes(query) ||
      customerName.toLowerCase().includes(query) ||
      customerEmail.toLowerCase().includes(query);
    const matchStatus = statusFilter === "all" || order.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const orderStats = [
    { label: "All Orders", value: orders.length, color: "text-stone-900", statusKey: "all" as const },
    { label: "Placed", value: orders.filter((o) => o.orderStatus === "placed").length, color: "text-info", statusKey: "placed" as const },
    { label: "Processing", value: orders.filter((o) => o.orderStatus === "processing").length, color: "text-warning", statusKey: "processing" as const },
    { label: "Shipped", value: orders.filter((o) => o.orderStatus === "shipped").length, color: "text-info", statusKey: "shipped" as const },
    { label: "Delivered", value: orders.filter((o) => o.orderStatus === "delivered").length, color: "text-success", statusKey: "delivered" as const },
    { label: "Cancelled", value: orders.filter((o) => o.orderStatus === "cancelled").length, color: "text-danger", statusKey: "cancelled" as const },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Orders</h1>
          <p className="text-sm text-muted mt-1">Manage and track customer orders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors text-stone-600">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Quick stats */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {orderStats.map((s) => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(s.statusKey)}
            className={`flex items-center gap-3 px-5 py-3 bg-card rounded-xl border transition-all shrink-0 ${
              (statusFilter === "all" && s.statusKey === "all") || statusFilter === s.statusKey
                ? "border-primary shadow-sm"
                : "border-border hover:border-stone-300"
            }`}
          >
            <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            <span className="text-sm text-muted">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="pl-9 pr-8 py-2.5 bg-card border border-border rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {statuses.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="text-left bg-surface/50">
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">
                  <input type="checkbox" className="rounded border-border" />
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">
                  <span className="flex items-center gap-1 cursor-pointer hover:text-stone-700">
                    Date <ArrowUpDown size={14} />
                  </span>
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Items</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">
                  <span className="flex items-center gap-1 cursor-pointer hover:text-stone-700">
                    Total <ArrowUpDown size={14} />
                  </span>
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Method</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Address</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order._id} className="border-t border-border hover:bg-surface/30 transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-border" />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-primary">#{order._id.slice(-8)}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{order.user?.name || order.guestInfo?.name || "Guest"}</p>
                      <p className="text-xs text-muted">{order.user?.email || order.guestInfo?.email || ""}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-stone-700">{order.items.length} items</td>
                  <td className="px-6 py-4 text-sm font-semibold text-stone-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${paymentColor[order.paymentStatus]}`}>
                      {toTitle(order.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{toTitle(order.paymentMethod)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[order.orderStatus]}`}>
                      {toTitle(order.orderStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{order.contactPhone || order.user?.phone || order.guestInfo?.phone || "-"}</td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/orders/${order._id}`}
                      className="text-muted hover:text-primary transition-colors"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-muted">Showing {filtered.length} of {orders.length} orders</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-surface transition-colors text-muted">Previous</button>
            <button className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white">1</button>
            <button className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-surface transition-colors text-muted">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
