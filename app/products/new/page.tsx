"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, X, Save, Eye } from "lucide-react";
import { ImageDropzone } from "@/components/ImageDropzone";
import { apiFetch, uploadFilesToS3 } from "@/lib/api";
import ProductCustomizationEditor, {
  emptyCustomization,
  type ProductCustomization,
} from "@/components/ProductCustomizationEditor";

type PackOptionRow = {
  units: number;
  label: string;
  discountPercent: number;
};

export default function NewProductPage() {
  const [mainImage, setMainImage] = useState("");
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [extraImageInput, setExtraImageInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Protein", "Vegetarian", "FSSAI Certified"]);
  const [tagInput, setTagInput] = useState("");
  const [nutritionRows, setNutritionRows] = useState([
    { label: "Calories", value: "" },
    { label: "Protein", value: "" },
    { label: "Total Fat", value: "" },
    { label: "Carbohydrates", value: "" },
    { label: "Dietary Fiber", value: "" },
    { label: "Sugar", value: "" },
  ]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [amazonUrl, setAmazonUrl] = useState("");
  const [packOptions, setPackOptions] = useState<PackOptionRow[]>([
    { units: 10, label: "Pack of 10", discountPercent: 5 },
    { units: 20, label: "Pack of 20", discountPercent: 10 },
    { units: 30, label: "Pack of 30", discountPercent: 15 },
  ]);
  const [customization, setCustomization] = useState<ProductCustomization>(emptyCustomization());
  const [isActive, setIsActive] = useState(true);
  const [freeDelivery, setFreeDelivery] = useState(false);
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
    setUploading(true);
    try {
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
    } finally {
      setUploading(false);
    }
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

  const addPackOption = () => {
    setPackOptions((prev) => [...prev, { units: 0, label: "", discountPercent: 0 }]);
  };

  const updatePackOption = (index: number, field: keyof PackOptionRow, value: string | number) => {
    setPackOptions((prev) =>
      prev.map((pack, i) => (i === index ? { ...pack, [field]: value } : pack))
    );
  };

  const removePackOption = (index: number) => {
    setPackOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const publishProduct = async () => {
    const nutritionHighlights = nutritionRows
      .filter((row) => row.label.trim() && row.value.trim())
      .map((row) => `${row.label}: ${row.value}`);
    await apiFetch("/products", {
      method: "POST",
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
        amazonUrl: amazonUrl.trim(),
        isActive,
        freeDelivery,
        packOptions: packOptions
          .filter((pack) => pack.units > 0)
          .map((pack) => ({
            units: Number(pack.units),
            label: pack.label.trim() || `Pack of ${pack.units}`,
            discountPercent: Number(pack.discountPercent) || 0,
          })),
        customization: {
          enabled: customization.enabled,
          title: customization.title.trim() || "Customize your product",
          options: customization.enabled
            ? customization.options
                .filter((opt) => opt.label.trim() && opt.key.trim())
                .map((opt) => ({
                  ...opt,
                  choices:
                    opt.type === "select"
                      ? opt.choices.filter((c) => c.label.trim() && c.value.trim())
                      : [],
                }))
            : [],
        },
      }),
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="p-2 rounded-lg hover:bg-card border border-border transition-colors text-muted hover:text-stone-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Add New Product</h1>
            <p className="text-sm text-muted mt-0.5">Fill in the product details below</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors text-stone-600">
            <Eye size={16} /> Preview
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors text-stone-600">
            Save Draft
          </button>
          <button onClick={() => void publishProduct()} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm">
            <Save size={16} /> Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-stone-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g., Almond Protein Cookies"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
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

          {/* Media */}
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
            <ImageDropzone multiple uploading={uploading} onFiles={uploadImages} />
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

          {/* Nutrition Table */}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
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

          {/* Category & Organization */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-stone-900 mb-4">Organization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option>Select category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.slug}>{category.name}</option>
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
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Protein per serving</label>
                <input
                  type="text"
                  placeholder="e.g., 10g"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-primary-dark">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-border transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-stone-900 mb-4">Amazon & Pack Pricing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Buy on Amazon link</label>
                <input
                  type="url"
                  placeholder="https://www.amazon.in/dp/..."
                  value={amazonUrl}
                  onChange={(e) => setAmazonUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-muted mt-1">Shows a Buy on Amazon button on the product page.</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-stone-700">Quantity packs</label>
                  <button
                    type="button"
                    onClick={addPackOption}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Plus size={15} /> Add pack
                  </button>
                </div>
                <div className="space-y-3">
                  {packOptions.map((pack, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <input
                        type="number"
                        min={1}
                        placeholder="Units"
                        value={pack.units || ""}
                        onChange={(e) => updatePackOption(index, "units", Number(e.target.value))}
                        className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Discount %"
                        value={pack.discountPercent}
                        onChange={(e) => updatePackOption(index, "discountPercent", Number(e.target.value))}
                        className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => removePackOption(index)}
                        className="p-2 text-muted hover:text-danger transition-colors"
                      >
                        <X size={16} />
                      </button>
                      <input
                        type="text"
                        placeholder={`Pack of ${pack.units || "10"}`}
                        value={pack.label}
                        onChange={(e) => updatePackOption(index, "label", e.target.value)}
                        className="col-span-3 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted mt-2">Example: 10 units with 5% off, 20 units with 10% off.</p>
              </div>
            </div>
          </div>

          <ProductCustomizationEditor value={customization} onChange={setCustomization} />

          {/* Shipping & Inventory */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-stone-900 mb-4">Shipping & Delivery</h2>
            <div className="space-y-4">
              {/* Free Delivery Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="freeDelivery" className="text-sm font-semibold text-stone-900 cursor-pointer">
                      🎁 Free Delivery
                    </label>
                  </div>
                  <p className="text-xs text-muted">
                    Enable free delivery for this product regardless of cart total
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="freeDelivery"
                    checked={freeDelivery}
                    onChange={(e) => setFreeDelivery(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              {/* Visual indicator when enabled */}
              {freeDelivery && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-4 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-green-900 text-sm mb-1">
                        Free Delivery Enabled!
                      </p>
                      <p className="text-xs text-green-700">
                        Orders containing this product will have free delivery. Perfect for promotional campaigns like Rakshabandhan, Diwali, etc.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-stone-900 mb-4">Inventory</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Stock Quantity</label>
                <input
                  type="number"
                  placeholder="100"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Low Stock Alert</label>
                <input
                  type="number"
                  placeholder="10"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Status</label>
                <select
                  value={isActive ? "active" : "disabled"}
                  onChange={(e) => setIsActive(e.target.value === "active")}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="active">Active (visible on store)</option>
                  <option value="disabled">Disabled (hidden from store)</option>
                </select>
                <p className="text-xs text-muted mt-1">Disabled products stay in CMS but are hidden from shop & homepage.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
