"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  ArrowUpDown,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<{ items: any[] }>("/products/admin")
      .then((data) => setProducts(data.items))
      .catch(() => setProducts([]));
    apiFetch<{ items: any[] }>("/categories/admin")
      .then((data) => {
        const map: Record<string, string> = {};
        data.items.forEach((c) => {
          map[c.slug] = c.name;
        });
        setCategoriesMap(map);
      })
      .catch(() => setCategoriesMap({}));
  }, []);

  const categories = ["All", ...Object.values(categoriesMap)];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || categoriesMap[p.category] === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Products</h1>
          <p className="text-sm text-muted mt-1">Manage your product catalog</p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-card border border-border rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="text-left bg-surface/50">
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">
                  <input type="checkbox" className="rounded border-border" />
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">
                  <span className="flex items-center gap-1 cursor-pointer hover:text-stone-700">
                    Product <ArrowUpDown size={14} />
                  </span>
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Category</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">
                  <span className="flex items-center gap-1 cursor-pointer hover:text-stone-700">
                    Price <ArrowUpDown size={14} />
                  </span>
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Weight</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">
                  <span className="flex items-center gap-1 cursor-pointer hover:text-stone-700">
                    Reviews <ArrowUpDown size={14} />
                  </span>
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr
                  key={product._id}
                  className="border-t border-border hover:bg-surface/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-border" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 bg-surface">
                        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800">{product.name}</p>
                        <p className="text-xs text-muted">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-stone-600 bg-stone-100 px-2 py-1 rounded-md">
                      {categoriesMap[product.category] || product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-semibold text-stone-900">₹{product.price}</span>
                      <span className="text-xs text-muted line-through ml-1.5">₹{product.originalPrice}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">{product.weight}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-stone-700">{product.reviews}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-sm text-stone-700">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      {product.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      {product.discount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === product._id ? null : product._id)}
                        className="p-1.5 rounded-lg hover:bg-surface transition-colors text-muted hover:text-stone-700"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenu === product._id && (
                        <div className="absolute right-0 top-8 w-40 bg-card rounded-lg shadow-xl border border-border py-1 z-50 animate-fadeIn">
                          <Link
                            href={`/products/${product._id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface transition-colors text-stone-700"
                          >
                            <Eye size={15} /> View
                          </Link>
                          <Link
                            href={`/products/${product._id}/edit`}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface transition-colors text-stone-700"
                          >
                            <Edit size={15} /> Edit
                          </Link>
                          <button onClick={async () => { await apiFetch(`/products/${product._id}`, { method: "PATCH", body: JSON.stringify({ isActive: false }) }); const data = await apiFetch<{ items: any[] }>("/products/admin"); setProducts(data.items); }} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface transition-colors text-danger w-full text-left">
                            <Trash2 size={15} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-muted">
            Showing {filtered.length} of {products.length} products
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-surface transition-colors text-muted">
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white">1</button>
            <button className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-surface transition-colors text-muted">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
