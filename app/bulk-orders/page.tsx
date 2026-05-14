"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, Building2, Package } from "lucide-react";
import { apiFetch } from "@/lib/api";

type BulkInquiry = {
  _id: string;
  companyName: string;
  yourName: string;
  email: string;
  phone: string;
  location: string;
  inquiryType: string;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
};

const statusColor: Record<BulkInquiry["status"], string> = {
  new: "bg-primary/10 text-primary",
  contacted: "bg-info/10 text-info",
  closed: "bg-stone-100 text-stone-500",
};

const statusLabel: Record<BulkInquiry["status"], string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BulkOrdersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<BulkInquiry[]>([]);
  const selected = inquiries.find((i) => i._id === selectedId);

  const loadInquiries = async () => {
    const data = await apiFetch<{ items: BulkInquiry[] }>("/bulk-order/admin");
    setInquiries(data.items);
  };

  useEffect(() => {
    void loadInquiries();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Bulk Order Inquiries</h1>
        <p className="text-sm text-muted mt-1">{inquiries.length} inquiries from businesses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-primary">{inquiries.filter(i => i.status === "new").length}</p>
          <p className="text-xs text-muted mt-1">New</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-info">{inquiries.filter(i => i.status === "contacted").length}</p>
          <p className="text-xs text-muted mt-1">Contacted</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-stone-700">{inquiries.filter(i => i.status === "closed").length}</p>
          <p className="text-xs text-muted mt-1">Closed</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-stone-900">{inquiries.length}</p>
          <p className="text-xs text-muted mt-1">Total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq._id}
              onClick={() => setSelectedId(inq._id)}
              className={`bg-card rounded-xl border p-5 cursor-pointer transition-all ${
                selectedId === inq._id ? "border-primary shadow-sm" : "border-border hover:border-stone-300"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-muted" />
                  <h3 className="text-sm font-semibold text-stone-900">{inq.companyName || "Individual"}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[inq.status]}`}>{statusLabel[inq.status]}</span>
                </div>
                <span className="text-xs text-muted">{formatDate(inq.createdAt)}</span>
              </div>
              <p className="text-sm text-stone-600 mb-2 line-clamp-2">{inq.message}</p>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1"><Package size={13} /> {inq.inquiryType}</span>
                <span>{inq.location || "-"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        {selected && (
          <div className="bg-card rounded-xl border border-border p-6 h-fit animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-stone-900">Inquiry Details</h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[selected.status]}`}>{statusLabel[selected.status]}</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted uppercase mb-1">Company</p>
                <p className="text-sm font-medium text-stone-800">{selected.companyName || "Individual"}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase mb-1">Contact Person</p>
                <p className="text-sm font-medium text-stone-800">{selected.yourName}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-muted uppercase mb-1">Email</p>
                  <p className="text-sm text-primary">{selected.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase mb-1">Phone</p>
                  <p className="text-sm text-stone-700">{selected.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted uppercase mb-1">Product Interest</p>
                <p className="text-sm text-stone-700">{selected.inquiryType}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase mb-1">Location</p>
                <p className="text-sm font-semibold text-stone-900">{selected.location || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase mb-1">Message</p>
                <p className="text-sm text-stone-600 leading-relaxed">{selected.message}</p>
              </div>
              <div className="pt-2 border-t border-border">
                <label className="block text-xs text-muted uppercase mb-1.5">Update Status</label>
                <select
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={selected.status}
                  onChange={async (e) => {
                    await apiFetch(`/bulk-order/${selected._id}/status`, { method: "PATCH", body: JSON.stringify({ status: e.target.value }) });
                    await loadInquiries();
                  }}
                >
                  {(["new", "contacted", "closed"] as BulkInquiry["status"][]).map((s) => (
                    <option key={s} value={s}>{statusLabel[s]}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <a href={`mailto:${selected.email}`} className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                  <Mail size={15} /> Email
                </a>
                <a href={`tel:${selected.phone}`} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors text-stone-600">
                  <Phone size={15} /> Call
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
