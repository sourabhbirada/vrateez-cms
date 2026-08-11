"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { apiFetch, uploadFilesToS3 } from "@/lib/api";
import { ImageDropzone } from "@/components/ImageDropzone";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productsCount?: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "", image: "" });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ items: CategoryItem[] }>("/categories/admin");
      setCategories(data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const handleEdit = (cat: CategoryItem) => {
    setEditId(cat._id);
    setFormData({ name: cat.name, slug: cat.slug, description: cat.description, image: cat.image || "" });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditId(null);
    setFormData({ name: "", slug: "", description: "", image: "" });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const payload = { ...formData };
    if (editId) {
      await apiFetch(`/categories/${editId}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await apiFetch("/categories", { method: "POST", body: JSON.stringify(payload) });
    }
    setShowForm(false);
    await loadCategories();
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/categories/${id}`, { method: "DELETE" });
    await loadCategories();
  };

  const onUploadImage = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const [url] = await uploadFilesToS3([files[0]]);
      if (url) setFormData((prev) => ({ ...prev, image: url }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Categories</h1>
          <p className="text-sm text-muted mt-1">Organize your products into categories</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-2 space-y-3">
          {loading && <div className="text-sm text-muted">Loading categories...</div>}
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 hover:shadow-sm transition-shadow group"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0 bg-surface">
                <Image src={cat.image || "/placeholder.png"} alt={cat.name} fill className="object-cover" sizes="48px" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-stone-900">{cat.name}</h3>
                  <span className="text-xs bg-surface px-2 py-0.5 rounded text-muted">/{cat.slug}</span>
                </div>
                <p className="text-sm text-muted mt-0.5 truncate">{cat.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1.5 text-sm text-stone-600 bg-surface px-3 py-1.5 rounded-lg">
                  <Package size={15} /> {cat.productsCount || 0} products
                </span>
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-2 rounded-lg hover:bg-surface text-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(cat._id)} className="p-2 rounded-lg hover:bg-surface text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-card rounded-xl border border-border p-6 h-fit animate-fadeIn">
            <h2 className="text-base font-semibold text-stone-900 mb-4">
              {editId ? "Edit Category" : "New Category"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  placeholder="e.g., Cookies"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="cookies"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://your-s3-url"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <ImageDropzone
                  multiple={false}
                  uploading={uploading}
                  onFiles={onUploadImage}
                  hint="PNG, JPG, WebP up to 5MB"
                />
                {formData.image ? (
                  <div className="relative mt-3 h-32 rounded-lg overflow-hidden border border-border">
                    <img src={formData.image} alt="Category preview" className="h-full w-full object-cover" />
                  </div>
                ) : null}
              </div>
              <div className="flex gap-3">
                <button onClick={handleSubmit} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
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
