"use client";

import {
  IndianRupee,
  ShoppingCart,
  Users,
  TrendingUp,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { products } from "@/data/products";

const monthlyRevenue = [
  { month: "Feb", revenue: 24500, orders: 41 },
  { month: "Mar", revenue: 32100, orders: 52 },
];

const topCities = [
  { city: "Mumbai", orders: 89, revenue: "₹58,200", pct: 34 },
  { city: "Delhi", orders: 72, revenue: "₹47,100", pct: 28 },
];

const trafficSources = [
  { source: "Google Search", visits: 2850, pct: 42 },
  { source: "Instagram", visits: 1560, pct: 23 },
];

export default function AnalyticsPage() {
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Analytics</h1>
        <p className="text-sm text-muted mt-1">Store performance overview for the past 6 months</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "₹2,45,890", change: "+12.5%", trend: "up", icon: IndianRupee, color: "bg-primary/10 text-primary" },
          { label: "Total Orders", value: "384", change: "+8.2%", trend: "up", icon: ShoppingCart, color: "bg-info/10 text-info" },
          { label: "Conversion Rate", value: "3.2%", change: "+0.4%", trend: "up", icon: TrendingUp, color: "bg-success/10 text-success" },
          { label: "Page Views", value: "24,560", change: "+22%", trend: "up", icon: Eye, color: "bg-warning/10 text-warning" },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.color}`}>
                  <Icon size={20} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${m.trend === "up" ? "text-success" : "text-danger"}`}>
                  {m.trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {m.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-stone-900">{m.value}</p>
              <p className="text-sm text-muted mt-0.5">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart + Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-1">Monthly Revenue</h2>
          <p className="text-sm text-muted mb-6">Revenue trend over the last 6 months</p>
          <div className="flex items-end gap-4 h-52">
            {monthlyRevenue.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-muted">₹{(m.revenue / 1000).toFixed(1)}k</span>
                <div className="w-full rounded-t-lg bg-primary/20 relative overflow-hidden transition-all" style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg" style={{ height: `${(m.revenue / maxRevenue) * 70 + 30}%` }}></div>
                </div>
                <span className="text-xs text-muted">{m.month}</span>
                <span className="text-xs text-stone-500">{m.orders} orders</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-1">Traffic Sources</h2>
          <p className="text-sm text-muted mb-4">Where your visitors come from</p>
          <div className="space-y-4">
            {trafficSources.map((s) => (
              <div key={s.source}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-stone-700">{s.source}</span>
                  <span className="text-sm font-medium text-stone-900">{s.pct}%</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${s.pct}%` }}></div>
                </div>
                <p className="text-xs text-muted mt-0.5">{s.visits.toLocaleString()} visits</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Performance + Top Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Performance */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-semibold text-stone-900">Product Performance</h2>
            <p className="text-sm text-muted">Revenue and units sold by product</p>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr className="text-left bg-surface/50 border-t border-border">
                  <th className="px-6 py-3 text-xs font-semibold text-muted uppercase">Product</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted uppercase">Price</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted uppercase">Reviews</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted uppercase">Discount</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-stone-800">{p.name}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-stone-900">₹{p.price}</td>
                    <td className="px-6 py-3 text-sm text-stone-600">{p.reviews}</td>
                    <td className="px-6 py-3">
                      <span className="flex items-center gap-1 text-sm font-medium text-success">
                        <ArrowUpRight size={14} />
                        {p.discount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-1">Top Cities</h2>
          <p className="text-sm text-muted mb-4">Orders by city</p>
          <div className="space-y-4">
            {topCities.map((c) => (
              <div key={c.city} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-stone-800">{c.city}</span>
                    <span className="text-xs text-muted">{c.orders} orders</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-primary/70 rounded-full" style={{ width: `${c.pct}%` }}></div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-stone-900 w-16 text-right">{c.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
