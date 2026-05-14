"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Image } from "lucide-react";
import { apiFetch, uploadFilesToS3 } from "@/lib/api";

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", cta: "", ctaLink: "", bgColor: "#FFF7ED", image: "", position: 1 });

  const loadBanners = async () => {
    const data = await apiFetch<{ items: any[] }>("/banners/admin");
    setBanners(data.items);
  };

  useEffect(() => {
    void loadBanners();
  }, []);

  const handleEdit = (b: any) => {
    setEditId(b._id);
    setForm({ title: b.title, subtitle: b.subtitle, cta: b.cta, ctaLink: b.ctaLink, bgColor: b.bgColor, image: b.image, position: b.position || 1 });
    setShowForm(true);
  };

  const saveBanner = async () => {
    if (editId) {
      await apiFetch(`/banners/${editId}`, { method: "PATCH", body: JSON.stringify(form) });
    } else {
      await apiFetch("/banners", { method: "POST", body: JSON.stringify(form) });
    }
    setShowForm(false);
    await loadBanners();
  };

  const onUploadImage = async (files: FileList | null) => {
    if (!files?.length) return;
    const [url] = await uploadFilesToS3([files[0]]);
    if (url) setForm((prev) => ({ ...prev, image: url }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Hero Banners</h1>
          <p className="text-sm text-muted mt-1">Manage homepage carousel slides</p>
        </div>
        <button
          onClick={() => { setEditId(null); setForm({ title: "", subtitle: "", cta: "", ctaLink: "", bgColor: "#FFF7ED", image: "", position: 1 }); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {banners.map((banner) => (
            <div key={banner._id} className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-sm transition-shadow">
              {/* Preview */}
              <div className="p-6 flex items-center gap-5" style={{ backgroundColor: banner.bgColor }}>
                <GripVertical size={18} className="text-stone-300 cursor-grab shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted mb-1">Slide {banner.position}</p>
                  <h3 className="text-lg font-bold text-stone-900 leading-tight">{banner.title}</h3>
                  <p className="text-sm text-stone-600 mt-1">{banner.subtitle}</p>
                  <span className="inline-block mt-2 bg-primary text-white text-xs px-3 py-1.5 rounded-full font-medium">
                    {banner.cta} →
                  </span>
                </div>
                <div className="relative w-24 h-24 bg-white/50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  {banner.image ? (
                    <NextImage src={banner.image} alt={banner.title} fill className="object-cover" sizes="96px" />
                  ) : (
                    <Image size={32} className="text-stone-300" />
                  )}
                </div>
              </div>
              {/* Actions */}
              <div className="px-6 py-3 bg-card border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-success/10 text-success px-2.5 py-1 rounded-full text-xs font-medium">{banner.isActive ? "Active" : "Disabled"}</span>
                  <span className="text-xs text-muted">→ {banner.ctaLink}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={async () => { await apiFetch(`/banners/${banner._id}`, { method: "PATCH", body: JSON.stringify({ isActive: !banner.isActive }) }); await loadBanners(); }} className="p-2 rounded-lg hover:bg-surface text-muted hover:text-stone-700 transition-colors" title="Toggle visibility">
                    {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => handleEdit(banner)} className="p-2 rounded-lg hover:bg-surface text-muted hover:text-primary transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={async () => { await apiFetch(`/banners/${banner._id}`, { method: "DELETE" }); await loadBanners(); }} className="p-2 rounded-lg hover:bg-surface text-muted hover:text-danger transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-6 h-fit animate-fadeIn">
            <h2 className="text-base font-semibold text-stone-900 mb-4">{editId ? "Edit Banner" : "New Banner"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Hero headline..." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Subtitle</label>
                <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Supporting text..." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">CTA Text</label>
                  <input type="text" value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} placeholder="Shop Now" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">CTA Link</label>
                  <input type="text" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} placeholder="/shop" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Background Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                  <input type="text" value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })} className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Image URL</label>
                <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <input type="file" accept="image/*" onChange={(e) => void onUploadImage(e.target.files)} className="mt-2 text-xs" />
                {form.image ? (
                  <div className="relative mt-3 h-24 rounded-lg overflow-hidden border border-border">
                    <NextImage src={form.image} alt="Banner preview" fill className="object-cover" sizes="320px" />
                  </div>
                ) : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Position</label>
                <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={saveBanner} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">{editId ? "Update" : "Create"}</button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors text-stone-600">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
