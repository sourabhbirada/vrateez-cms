"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Upload, Plus, X, Save, Eye } from "lucide-react";
import { apiFetch, uploadFilesToS3 } from "@/lib/api";

interface ProductResponse {
  _id: string;
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  category: string;
  weight: string;
  price: number;
  originalPrice: number;
  stock: number;
  image: string;
  images: string[];
  benefits: string[];
  nutritionHighlights: string[];
}

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [extraImageInput, setExtraImageInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [nutritionRows, setNutritionRows] = useState<Array<{ label: string; value: string }>>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    ingredients: "",
    category: "",
    weight: "",
    price: 0,
    originalPrice: 0,
    stock: 100,
  });

  useEffect(() => {
    apiFetch<{ items: Array<{ _id: string; name: string; slug: string }> }>("/categories/admin")
      .then((data) => setCategories(data.items))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await apiFetch<{ product: ProductResponse }>(`/products/admin/${id}`);
        const product = data.product;
        const main = product.image || product.images?.[0] || "";
        const extras = (product.images || []).filter((img) => img && img !== main);

        setForm({
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          ingredients: product.ingredients || "",
          category: product.category || "",
          weight: product.weight || "",
          price: product.price || 0,
          originalPrice: product.originalPrice || 0,
          stock: product.stock ?? 100,
        });
        setTags(product.benefits || []);
        setNutritionRows(
          (product.nutritionHighlights || [])
            .map((item) => {
              const [label, ...rest] = item.split(":");
              const value = rest.join(":").trim();
              return { label: label.trim(), value };
            })
            .filter((row) => row.label || row.value)
        );
        setMainImage(main);
        setExtraImages(extras);
        setLoading(false);
      } catch {
        setNotFound(true);
        setLoading(false);
      }
    }

    if (id) {
      void loadProduct();
    }
  }, [id]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addNutritionRow = () => {
    setNutritionRows([...nutritionRows, { label: "", value: "" }]);
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    const urls = await uploadFilesToS3(Array.from(files));
    if (!urls.length) return;
    if (!mainImage) {
      const [first, ...rest] = urls;
      setMainImage(first || "");
      if (rest.length) {
        setExtraImages((prev) => {
          const merged = new Set(prev);
          rest.forEach((url) => {
            if (url && url !== first) merged.add(url);
          });
          return Array.from(merged);
        });
      }
      return;
    }
    setExtraImages((prev) => {
      const merged = new Set(prev);
      urls.forEach((url) => {
        if (url && url !== mainImage) merged.add(url);
      });
      return Array.from(merged);
    });
  };

  const setMainImageUrl = (url: string) => {
    const trimmed = url.trim();
    setMainImage(trimmed);
    if (trimmed) {
      setExtraImages((prev) => prev.filter((img) => img !== trimmed));
    }
  };

  const addExtraImageUrl = () => {
    const trimmed = extraImageInput.trim();
    if (!trimmed) return;
    if (trimmed === mainImage) {
      setExtraImageInput("");
      return;
    }
    setExtraImages((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setExtraImageInput("");
  };

  const removeExtraImage = (url: string) => {
    setExtraImages((prev) => prev.filter((img) => img !== url));
  };

  const updateProduct = async () => {
    const nutritionHighlights = nutritionRows
      .filter((row) => row.label.trim() && row.value.trim())
      .map((row) => `${row.label}: ${row.value}`);
    await apiFetch(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...form,
        image: mainImage,
        images: [mainImage, ...extraImages].filter(Boolean),
        discount:
          form.originalPrice > form.price && form.originalPrice > 0
            ? `${Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)}% OFF`
            : "",
        benefits: tags,
        nutritionHighlights,
      }),
    });
  };

  if (loading) {
    return <div className="text-sm text-muted">Loading product...</div>;
  }

  if (notFound) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-danger">Product not found.</p>
        <Link href="/products" className="text-sm text-primary hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="p-2 rounded-lg hover:bg-card border border-border transition-colors text-muted hover:text-stone-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Edit Product</h1>
            <p className="text-sm text-muted mt-0.5">Update product details and images</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors text-stone-600">
            <Eye size={16} /> Preview
          </button>
          <button
            onClick={() => void updateProduct()}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
          >
            <Save size={16} /> Update
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-stone-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g., Almond Protein Cookies"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Slug</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-surface border border-r-0 border-border rounded-l-lg text-sm text-muted">
                    vrateez.com/product/
                  </span>
                  <input
                    type="text"
                    placeholder="almond-protein-cookies"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-border rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Short Description</label>
                <input
                  type="text"
                  placeholder="Brief product description for cards and listings"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Description</label>
                <textarea
                  rows={5}
                  placeholder="Detailed product description with features and benefits..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Ingredients</label>
                <textarea
                  rows={3}
                  placeholder="Whey Protein Isolate (Grass-fed), Almond Flour, Dark Chocolate, Honey..."
                  value={form.ingredients}
                  onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-stone-900 mb-4">Media</h2>
            <div className="space-y-3 mb-5">
              <label className="block text-sm font-medium text-stone-700">Main Image URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={mainImage}
                onChange={(e) => setMainImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {mainImage ? (
                <div className="relative h-44 rounded-xl overflow-hidden border border-border bg-surface">
                  <img src={mainImage} alt="Main product" className="h-full w-full object-cover" />
                </div>
              ) : null}
              <p className="text-xs text-muted">The first image is used as the main product image.</p>
            </div>
            <div className="space-y-3 mb-5">
              <label className="block text-sm font-medium text-stone-700">Additional Image URLs</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://..."
                  value={extraImageInput}
                  onChange={(e) => setExtraImageInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  onClick={addExtraImageUrl}
                  className="px-3 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-muted">Paste S3 URLs to add extra product images.</p>
            </div>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload size={32} className="mx-auto text-muted mb-3" />
              <p className="text-sm font-medium text-stone-700">Drop images here or click to upload</p>
              <p className="text-xs text-muted mt-1">PNG, JPG, WebP up to 5MB. Recommended: 800x800px</p>
              <input multiple type="file" accept="image/*" className="mt-3 text-xs" onChange={(e) => void uploadImages(e.target.files)} />
            </div>
            {[mainImage, ...extraImages].filter(Boolean).length > 0 && (
              <div className="flex gap-3 mt-4 flex-wrap">
                {[mainImage, ...extraImages].filter(Boolean).map((img, i) => (
                  <div key={i} className="w-20 h-20 bg-surface rounded-lg border border-border relative group overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {i === 0 ? (
                      <span className="absolute left-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Main
                      </span>
                    ) : null}
                    {i > 0 ? (
                      <button
                        onClick={() => removeExtraImage(img)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-stone-900">Nutrition Information</h2>
              <button
                onClick={addNutritionRow}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Plus size={15} /> Add Row
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <span className="text-xs font-semibold text-muted uppercase">Nutrient</span>
                <span className="text-xs font-semibold text-muted uppercase">Per Serving</span>
              </div>
              {nutritionRows.map((row, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => {
                      const updated = [...nutritionRows];
                      updated[i].label = e.target.value;
                      setNutritionRows(updated);
                    }}
                    placeholder="e.g., Protein"
                    className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={row.value}
                      onChange={(e) => {
                        const updated = [...nutritionRows];
                        updated[i].value = e.target.value;
                        setNutritionRows(updated);
                      }}
                      placeholder="e.g., 10g"
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button
                      onClick={() => setNutritionRows(nutritionRows.filter((_, idx) => idx !== i))}
                      className="p-1.5 text-muted hover:text-danger transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-stone-900 mb-4">Pricing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Selling Price (₹)</label>
                <input
                  type="number"
                  placeholder="299"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">MRP / Original Price (₹)</label>
                <input
                  type="number"
                  placeholder="399"
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="bg-success/5 border border-success/20 rounded-lg px-3 py-2">
                <p className="text-xs text-success font-medium">Discount: 25% off</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-stone-900 mb-4">Organization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option>Select category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Weight</label>
                <input
                  type="text"
                  placeholder="e.g., 150g"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-stone-900 mb-4">Tags & Benefits</h2>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a benefit"
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                onClick={addTag}
                className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium text-stone-700"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-muted hover:text-danger">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
