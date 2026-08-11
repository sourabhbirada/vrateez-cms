"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Copy, Tag } from "lucide-react";
import { apiFetch } from "@/lib/api";

const statusColor: Record<string, string> = {
  Active: "bg-success/10 text-success",
  Expired: "bg-danger/10 text-danger",
  Scheduled: "bg-info/10 text-info",
  Disabled: "bg-stone-100 text-stone-500",
};

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [formData, setFormData] = useState({ code: "", type: "percentage", value: 10, minOrderAmount: 0, maxDiscount: 0, usageLimit: 0, validFrom: "", validTo: "" });
  const [editId, setEditId] = useState<string | null>(null);

  const loadCoupons = async () => {
    const data = await apiFetch<{ items: any[] }>("/admin/coupons");
    setCoupons(data.items);
  };

  useEffect(() => {
    void loadCoupons();
  }, []);
  const onSubmit = async () => {
    const payload = {
      ...formData,
      code: formData.code.toUpperCase(),
      maxDiscount: Number(formData.maxDiscount) || undefined,
    };
    if (editId) {
      await apiFetch(`/admin/coupons/${editId}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await apiFetch("/admin/coupons", { method: "POST", body: JSON.stringify(payload) });
    }
    setShowForm(false);
    setEditId(null);
    await loadCoupons();
  };


  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Coupons & Promo Codes</h1>
          <p className="text-sm text-muted mt-1">Manage discount codes for your store</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted">Active Coupons</p>
          <p className="text-2xl font-bold text-success mt-1">{coupons.filter(c => c.isActive).length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted">Total Usages</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted">Scheduled</p>
          <p className="text-2xl font-bold text-info mt-1">{coupons.filter(c => c.validFrom && new Date(c.validFrom) > new Date()).length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted">Expired</p>
          <p className="text-2xl font-bold text-danger mt-1">{coupons.filter(c => c.validTo && new Date(c.validTo) < new Date()).length}</p>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 animate-fadeIn">
          <h2 className="text-base font-semibold text-stone-900 mb-4">Create New Coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Coupon Code</label>
              <input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} type="text" placeholder="e.g., SUMMER25" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Discount Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="percentage">Percentage</option>
                <option value="flat">Fixed Amount</option>
                <option value="final_total">Final Total</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Value</label>
              <input value={formData.value} onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })} type="number" placeholder="10" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Min Order (â‚¹)</label>
              <input value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })} type="number" placeholder="499" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Max Discount (â‚¹)</label>
              <input value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })} type="number" placeholder="200" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Usage Limit</label>
              <input value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })} type="number" placeholder="1000" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Valid From</label>
              <input value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} type="date" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Valid Until</label>
              <input value={formData.validTo} onChange={(e) => setFormData({ ...formData, validTo: e.target.value })} type="date" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div className="flex items-end">
              <div className="flex gap-3 w-full">
                <button onClick={onSubmit} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">{editId ? "Update" : "Create"}</button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-surface transition-colors text-stone-600">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupons table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="text-left bg-surface/50">
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Code</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Min Order</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Max Discount</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Validity</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-t border-border hover:bg-surface/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag size={15} className="text-primary" />
                      <span className="text-sm font-mono font-bold text-stone-900">{coupon.code}</span>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className="p-1 rounded hover:bg-surface text-muted hover:text-primary transition-colors"
                        title="Copy code"
                      >
                        <Copy size={14} />
                      </button>
                      {copied === coupon.code && <span className="text-xs text-success">Copied!</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-stone-800">
                    {coupon.type === "percentage" ? `${coupon.value}%` : `â‚¹${coupon.value}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">â‚¹{coupon.minOrderAmount || 0}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">â‚¹{coupon.maxDiscount || 0}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-stone-800 font-medium">{coupon.usedCount || 0}</span>
                    <span className="text-muted"> / {coupon.usageLimit || "-"}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted">
                    {coupon.validFrom?.slice(0, 10) || "-"} â†’ {coupon.validTo?.slice(0, 10) || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${coupon.isActive ? statusColor.Active : statusColor.Disabled}`}>
                      {coupon.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditId(coupon._id); setFormData({ code: coupon.code, type: coupon.type, value: coupon.value, minOrderAmount: coupon.minOrderAmount || 0, maxDiscount: coupon.maxDiscount || 0, usageLimit: coupon.usageLimit || 0, validFrom: coupon.validFrom?.slice(0, 10) || "", validTo: coupon.validTo?.slice(0, 10) || "" }); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-primary transition-colors"><Edit size={16} /></button>
                      <button onClick={async () => { await apiFetch(`/admin/coupons/${coupon._id}`, { method: "DELETE" }); await loadCoupons(); }} className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-danger transition-colors"><Trash2 size={16} /></button>
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
