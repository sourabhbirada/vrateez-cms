"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import { Plus, Edit, Trash2, Eye, EyeOff, Gift, X } from "lucide-react";
import { apiFetch, uploadFilesToS3 } from "@/lib/api";
import { ImageDropzone } from "@/components/ImageDropzone";

type DealForm = {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  cta: string;
  ctaLink: string;
  image: string;
  video: string;
  price: number;
  originalPrice: number;
  items: string[];
  productSlug: string;
  placement: "homepage" | "landing";
  bgFrom: string;
  bgTo: string;
  position: number;
};

const emptyForm = (): DealForm => ({
  title: "",
  subtitle: "",
  description: "",
  badge: "Limited Time Offer",
  cta: "Order Now",
  ctaLink: "/shop",
  image: "",
  video: "",
  price: 0,
  originalPrice: 0,
  items: [],
  productSlug: "",
  placement: "homepage",
  bgFrom: "#FFF5E6",
  bgTo: "#FFE8CC",
  position: 1,
});

export default function Deals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<DealForm>(emptyForm());
  const [itemInput, setItemInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadDeals = async () => {
    const data = await apiFetch<{ items: any[] }>("/deals/admin");
    setDeals(data.items);
  };

  useEffect(() => {
    void loadDeals();
  }, []);

  const handleEdit = (d: any) => {
    setEditId(d._id);
    setForm({
      title: d.title || "",
      subtitle: d.subtitle || "",
      description: d.description || "",
      badge: d.badge || "Limited Time Offer",
      cta: d.cta || "Order Now",
      ctaLink: d.ctaLink || "/shop",
      image: d.image || "",
      video: d.video || "",
      price: d.price || 0,
      originalPrice: d.originalPrice || 0,
      items: d.items || [],
      productSlug: d.productSlug || "",
      placement: d.placement || "homepage",
      bgFrom: d.bgFrom || "#FFF5E6",
      bgTo: d.bgTo || "#FFE8CC",
      position: d.position || 1,
    });
    setShowForm(true);
  };

  const saveDeal = async () => {
    if (editId) {
      await apiFetch(`/deals/${editId}`, { method: "PATCH", body: JSON.stringify(form) });
    } else {
      await apiFetch("/deals", { method: "POST", body: JSON.stringify(form) });
    }
    setShowForm(false);
    setEditId(null);
    await loadDeals();
  };

  const onUploadImage = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const [url] = await uploadFilesToS3([files[0]]);
      if (url) setForm((prev) => ({ ...prev, image: url }));
    } finally {
      setUploading(false);
    }
  };

  const addItem = () => {
    const trimmed = itemInput.trim();
    if (!trimmed) return;
    setForm((prev) => ({ ...prev, items: [...prev.items, trimmed] }));
    setItemInput("");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Deals & Offers</h1>
          <p className="text-sm text-muted mt-1">
            Manage festive banners, videos, and offer sections (Rakhi hampers, etc.)
          </p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setForm(emptyForm());
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Deal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {deals.length === 0 && (
            <div className="bg-card rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted">
              No deals yet. Create a Rakhi / festive offer with image or video.
            </div>
          )}
          {deals.map((deal) => (
            <div
              key={deal._id}
              className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-sm transition-shadow"
            >
              <div
                className="p-6 flex items-center gap-5"
                style={{
                  background: `linear-gradient(135deg, ${deal.bgFrom}, ${deal.bgTo})`,
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted mb-1">
                    {deal.placement} · Position {deal.position}
                  </p>
                  <h3 className="text-lg font-bold text-stone-900 leading-tight truncate">
                    {deal.title}
                  </h3>
                  <p className="text-sm text-stone-600 mt-1 line-clamp-2">{deal.subtitle}</p>
                  {deal.price > 0 && (
                    <p className="text-sm font-semibold text-stone-800 mt-2">
                      ₹{deal.price}
                      {deal.originalPrice > deal.price ? (
                        <span className="text-stone-400 line-through ml-2 font-normal">
                          ₹{deal.originalPrice}
                        </span>
                      ) : null}
                    </p>
                  )}
                </div>
                <div className="relative w-28 h-20 bg-white/50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  {deal.video ? (
                    <video src={deal.video} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                  ) : deal.image ? (
                    <NextImage src={deal.image} alt={deal.title} fill className="object-cover" sizes="112px" />
                  ) : (
                    <Gift size={28} className="text-stone-300" />
                  )}
                </div>
              </div>
              <div className="px-6 py-3 bg-card border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      deal.isActive ? "bg-success/10 text-success" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {deal.isActive ? "Active" : "Disabled"}
                  </span>
                  <span className="text-xs text-muted">→ {deal.ctaLink}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={async () => {
                      await apiFetch(`/deals/${deal._id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ isActive: !deal.isActive }),
                      });
                      await loadDeals();
                    }}
                    className="p-2 rounded-lg hover:bg-surface text-muted hover:text-stone-700 transition-colors"
                    title="Toggle visibility"
                  >
                    {deal.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleEdit(deal)}
                    className="p-2 rounded-lg hover:bg-surface text-muted hover:text-primary transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      await apiFetch(`/deals/${deal._id}`, { method: "DELETE" });
                      await loadDeals();
                    }}
                    className="p-2 rounded-lg hover:bg-surface text-muted hover:text-danger transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-6 h-fit animate-fadeIn">
            <h2 className="text-base font-semibold text-stone-900 mb-4">
              {editId ? "Edit Deal" : "New Deal"}
            </h2>
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Raksha Bandhan Gift Hamper"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Subtitle</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Celebrate the bond of love..."
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Badge</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Placement</label>
                  <select
                    value={form.placement}
                    onChange={(e) =>
                      setForm({ ...form, placement: e.target.value as "homepage" | "landing" })
                    }
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="homepage">Homepage</option>
                    <option value="landing">Landing</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">CTA Text</label>
                  <input
                    type="text"
                    value={form.cta}
                    onChange={(e) => setForm({ ...form, cta: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">CTA Link</label>
                  <input
                    type="text"
                    value={form.ctaLink}
                    onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                    placeholder="/raksha-bandhan or /product/slug"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Linked product slug (for customization)
                </label>
                <input
                  type="text"
                  value={form.productSlug}
                  onChange={(e) => setForm({ ...form, productSlug: e.target.value })}
                  placeholder="raksha-bandhan-hamper"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-muted mt-1">
                  Optional. If set, storefront can deep-link to that product&apos;s customize options.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Price ₹</label>
                  <input
                    type="number"
                    value={form.price || ""}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Original ₹
                  </label>
                  <input
                    type="number"
                    value={form.originalPrice || ""}
                    onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Bundle items
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={itemInput}
                    onChange={(e) => setItemInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
                    placeholder="e.g. Traditional Rakhi"
                    className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-surface"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.items.map((item, i) => (
                    <span
                      key={`${item}-${i}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium text-stone-700"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            items: prev.items.filter((_, idx) => idx !== i),
                          }))
                        }
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Image</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-2"
                />
                <ImageDropzone multiple={false} uploading={uploading} onFiles={onUploadImage} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Video URL (optional)
                </label>
                <input
                  type="text"
                  value={form.video}
                  onChange={(e) => setForm({ ...form, video: e.target.value })}
                  placeholder="https://...mp4 or /rakhevideo.mp4"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">BG From</label>
                  <input
                    type="color"
                    value={form.bgFrom}
                    onChange={(e) => setForm({ ...form, bgFrom: e.target.value })}
                    className="w-full h-10 rounded-lg border border-border cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">BG To</label>
                  <input
                    type="color"
                    value={form.bgTo}
                    onChange={(e) => setForm({ ...form, bgTo: e.target.value })}
                    className="w-full h-10 rounded-lg border border-border cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Position</label>
                <input
                  type="number"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => void saveDeal()}
                  className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  {editId ? "Update" : "Create"}
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
      </div>
    </div>
  );
}
