"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Download, Eye, Mail } from "lucide-react";
import { apiFetch } from "@/lib/api";

type AdminOrder = {
  _id: string;
  user?: { name?: string; email?: string; phone?: string } | null;
  guestInfo?: { name?: string; email?: string; phone?: string } | null;
  shippingAddress: { city: string };
  totalAmount: number;
  createdAt: string;
};

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  lastOrder: string;
  city: string;
  joined: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function Customers() {
  const [search, setSearch] = useState("");
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

  const customers = useMemo(() => {
    const map = new Map<string, CustomerRow>();
    orders.forEach((order) => {
      const name = order.user?.name || order.guestInfo?.name || "Guest";
      const email = order.user?.email || order.guestInfo?.email || "";
      const phone = order.user?.phone || order.guestInfo?.phone || "";
      const key = email || phone || order._id;
      const existing = map.get(key);
      const createdAt = order.createdAt;
      const city = order.shippingAddress?.city || "";

      if (!existing) {
        map.set(key, {
          id: key,
          name,
          email,
          phone,
          orders: 1,
          spent: order.totalAmount || 0,
          lastOrder: createdAt,
          city,
          joined: createdAt,
        });
        return;
      }

      existing.orders += 1;
      existing.spent += order.totalAmount || 0;
      if (new Date(createdAt) > new Date(existing.lastOrder)) {
        existing.lastOrder = createdAt;
        existing.city = city || existing.city;
      }
      if (new Date(createdAt) < new Date(existing.joined)) {
        existing.joined = createdAt;
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime());
  }, [orders]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Customers</h1>
          <p className="text-sm text-muted mt-1">{customers.length} registered customers</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors text-stone-600">
          <Download size={16} /> Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted">Total Customers</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{customers.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted">Total Orders</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{customers.reduce((sum, c) => sum + c.orders, 0)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted">Cities</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{new Set(customers.map(c => c.city)).size}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search by name, email, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="text-left bg-surface/50">
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">City</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Last Order</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id} className="border-t border-border hover:bg-surface/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-sm">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800">{customer.name}</p>
                        <p className="text-xs text-muted">{customer.email || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">{customer.phone || "-"}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{customer.city || "-"}</td>
                  <td className="px-6 py-4 text-sm font-medium text-stone-800">{customer.orders}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-stone-900">{formatCurrency(customer.spent)}</td>
                  <td className="px-6 py-4 text-sm text-muted">{formatDate(customer.lastOrder)}</td>
                  <td className="px-6 py-4 text-sm text-muted">{formatDate(customer.joined)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-primary transition-colors" title="View details">
                        <Eye size={17} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-info transition-colors" title="Send email">
                        <Mail size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
