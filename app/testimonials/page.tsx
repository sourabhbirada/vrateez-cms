"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Star, Eye, EyeOff } from "lucide-react";
import { products } from "@/data/products";

const initialTestimonials = [
  { id: 1, name: "Rahul M.", rating: 5, text: "Best protein cookies I've ever had! The almond flavor is incredible and they actually taste like real cookies, not chalky protein bars.", product: "Almond Protein Cookie", date: "Mar 5, 2026", status: "Published" },
  { id: 2, name: "Priya S.", rating: 4, text: "Finally a healthy snack that my kids love too! The blueberry cookies are amazing. Will definitely reorder.", product: "Blueberry Protein Cookie", date: "Mar 3, 2026", status: "Published" },
];

const statusColor: Record<string, string> = {
  Published: "bg-success/10 text-success",
  Hidden: "bg-stone-100 text-stone-500",
  Pending: "bg-warning/10 text-warning",
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Testimonials</h1>
          <p className="text-sm text-muted mt-1">Manage customer reviews displayed on your website</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-primary">{testimonials.length}</p>
          <p className="text-xs text-muted mt-1">Total Reviews</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-success">{testimonials.filter(t => t.status === "Published").length}</p>
          <p className="text-xs text-muted mt-1">Published</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">4.7★</p>
          <p className="text-xs text-muted mt-1">Avg Rating</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-stone-800">{testimonials.filter(t => t.rating === 5).length}</p>
          <p className="text-xs text-muted mt-1">5-Star Reviews</p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 animate-fadeIn">
          <h2 className="text-base font-semibold text-stone-900 mb-4">New Testimonial</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Customer Name</label>
              <input type="text" placeholder="e.g., Rahul M." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Product</label>
              <select className="w-full px-4 py-2.5 border border-border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option>Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Rating</label>
              <select className="w-full px-4 py-2.5 border border-border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option>5 Stars</option>
                <option>4 Stars</option>
                <option>3 Stars</option>
                <option>2 Stars</option>
                <option>1 Star</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Status</label>
              <select className="w-full px-4 py-2.5 border border-border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option>Published</option>
                <option>Hidden</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Review Text</label>
              <textarea rows={3} placeholder="Customer review..." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"></textarea>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">Save Testimonial</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors text-stone-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials list */}
      <div className="space-y-4">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-card rounded-xl border border-border p-5 flex items-start gap-4 group hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-sm shrink-0">
              {t.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-stone-900">{t.name}</h3>
                <span className="text-xs bg-surface px-2 py-0.5 rounded text-muted">{t.product}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[t.status]}`}>{t.status}</span>
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < t.rating ? "text-yellow-500 fill-yellow-500" : "text-stone-200"} />
                ))}
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <p className="text-xs text-muted mt-2">{t.date}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 rounded-lg hover:bg-surface text-muted hover:text-stone-700 transition-colors" title="Toggle visibility">
                {t.status === "Published" ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button className="p-2 rounded-lg hover:bg-surface text-muted hover:text-primary transition-colors"><Edit size={16} /></button>
              <button className="p-2 rounded-lg hover:bg-surface text-muted hover:text-danger transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
