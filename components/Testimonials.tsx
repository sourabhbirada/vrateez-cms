"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Star, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Testimonial = {
  _id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  productName: string;
  avatar: string;
  isActive: boolean;
  sortOrder: number;
};

type FormState = {
  name: string;
  role: string;
  text: string;
  rating: number;
  productName: string;
  avatar: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  name: "",
  role: "",
  text: "",
  rating: 5,
  productName: "",
  avatar: "",
  sortOrder: 0,
  isActive: true,
});

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [products, setProducts] = useState<Array<{ _id: string; name: string }>>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const load = async () => {
    const [tData, pData] = await Promise.all([
      apiFetch<{ items: Testimonial[] }>("/testimonials/admin"),
      apiFetch<{ items: Array<{ _id: string; name: string }> }>("/products/admin?limit=200").catch(() => ({
        items: [],
      })),
    ]);
    setTestimonials(tData.items);
    setProducts(pData.items || []);
  };

  useEffect(() => {
    void load();
  }, []);

  const avgRating =
    testimonials.length > 0
      ? (
          testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
        ).toFixed(1)
      : "0";

  const save = async () => {
    const payload = { ...form };
    if (editId) {
      await apiFetch(`/testimonials/${editId}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await apiFetch("/testimonials", { method: "POST", body: JSON.stringify(payload) });
    }
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm());
    await load();
  };

  const startEdit = (t: Testimonial) => {
    setEditId(t._id);
    setForm({
      name: t.name,
      role: t.role || "",
      text: t.text,
      rating: t.rating,
      productName: t.productName || "",
      avatar: t.avatar || "",
      sortOrder: t.sortOrder || 0,
      isActive: t.isActive,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Testimonials</h1>
          <p className="text-sm text-muted mt-1">Manage customer reviews displayed on your website</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setForm(emptyForm());
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-primary">{testimonials.length}</p>
          <p className="text-xs text-muted mt-1">Total Reviews</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {testimonials.filter((t) => t.isActive).length}
          </p>
          <p className="text-xs text-muted mt-1">Published</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">{avgRating}★</p>
          <p className="text-xs text-muted mt-1">Avg Rating</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-stone-800">
            {testimonials.filter((t) => t.rating === 5).length}
          </p>
          <p className="text-xs text-muted mt-1">5-Star Reviews</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 animate-fadeIn">
          <h2 className="text-base font-semibold text-stone-900 mb-4">
            {editId ? "Edit Testimonial" : "New Testimonial"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Customer Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Role / City</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Fitness Coach, Mumbai"
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Product</label>
              <select
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select product (optional)</option>
                {products.map((p) => (
                  <option key={p._id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Rating</label>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Stars
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Review Text</label>
              <textarea
                rows={3}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                onClick={() => void save()}
                className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                {editId ? "Update" : "Save"} Testimonial
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors text-stone-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {testimonials.length === 0 && (
          <div className="bg-card rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted">
            No testimonials yet. Add reviews from the CMS — they appear on the homepage automatically.
          </div>
        )}
        {testimonials.map((t) => (
          <div
            key={t._id}
            className="bg-card rounded-xl border border-border p-5 flex items-start gap-4 group hover:shadow-sm transition-shadow"
          >
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-sm shrink-0">
              {t.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-sm font-semibold text-stone-900">{t.name}</h3>
                {t.productName ? (
                  <span className="text-xs bg-surface px-2 py-0.5 rounded text-muted">{t.productName}</span>
                ) : null}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    t.isActive ? "bg-success/10 text-success" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {t.isActive ? "Published" : "Hidden"}
                </span>
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < t.rating ? "text-yellow-500 fill-yellow-500" : "text-stone-200"}
                  />
                ))}
              </div>
              <p className="text-sm text-stone-600">{t.text}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={async () => {
                  await apiFetch(`/testimonials/${t._id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ isActive: !t.isActive }),
                  });
                  await load();
                }}
                className="p-2 rounded-lg hover:bg-surface text-muted hover:text-stone-700 transition-colors"
              >
                {t.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button
                onClick={() => startEdit(t)}
                className="p-2 rounded-lg hover:bg-surface text-muted hover:text-primary transition-colors"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={async () => {
                  await apiFetch(`/testimonials/${t._id}`, { method: "DELETE" });
                  await load();
                }}
                className="p-2 rounded-lg hover:bg-surface text-muted hover:text-danger transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
