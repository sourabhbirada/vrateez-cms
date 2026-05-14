"use client";

import {
  ShoppingCart,
  Users,
  Package,
  ArrowRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { products, categoryLabels } from "@/data/products";

export default function Dashboard() {
  const topProducts = [...products]
    .sort((a, b) => b.reviews * b.rating - a.reviews * a.rating)
    .slice(0, 5);

  const avgRating = (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Welcome back! Here&apos;s your store overview.</p>
      </div>

      {/* Stats cards - derived from product data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: products.length.toString(), icon: Package, color: "bg-primary/10 text-primary" },
          { label: "Avg. Rating", value: `${avgRating}★`, icon: Star, color: "bg-warning/10 text-warning" },
          { label: "Categories", value: Object.keys(categoryLabels).length.toString(), icon: ShoppingCart, color: "bg-info/10 text-info" },
          { label: "Total Reviews", value: products.reduce((sum, p) => sum + p.reviews, 0).toString(), icon: Users, color: "bg-success/10 text-success" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
              <p className="text-sm text-muted mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Product catalog + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product grid */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Product Catalog</h2>
              <p className="text-sm text-muted">{products.length} products in store</p>
            </div>
            <Link href="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
              Manage products <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {products.slice(0, 6).map((product) => (
              <div key={product.id} className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-surface border border-border mb-2">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 200px"
                  />
                  <span className="absolute top-2 left-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {product.discount}
                  </span>
                </div>
                <p className="text-xs font-medium text-stone-800 truncate">{product.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-900">₹{product.price}</span>
                  <span className="text-[10px] text-muted line-through">₹{product.originalPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products by reviews */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-900">Top Products</h2>
            <Link href="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 bg-surface">
                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{product.name}</p>
                  <p className="text-xs text-muted">{product.reviews} reviews</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-semibold text-stone-900">₹{product.price}</span>
                  <div className="flex items-center gap-0.5">
                    <Star size={11} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-muted">{product.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products by Category */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Products by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(categoryLabels).map(([key, label]) => {
            const catProducts = products.filter((p) => p.category === key);
            const catAvgPrice = Math.round(catProducts.reduce((sum, p) => sum + p.price, 0) / catProducts.length);
            return (
              <div key={key} className="border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden relative bg-surface shrink-0">
                    <Image src={catProducts[0].image} alt={label} fill className="object-cover" sizes="48px" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">{label}</h3>
                    <p className="text-xs text-muted">{catProducts.length} products</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Avg. price: <span className="font-medium text-stone-700">₹{catAvgPrice}</span></span>
                  <span className="text-muted">
                    <Star size={11} className="inline text-yellow-500 fill-yellow-500" />{" "}
                    {(catProducts.reduce((s, p) => s + p.rating, 0) / catProducts.length).toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
