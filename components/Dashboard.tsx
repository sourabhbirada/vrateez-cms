"use client";

import {
  ShoppingCart,
  Users,
  Package,
  ArrowRight,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  image?: string;
  images?: string[];
  price: number;
  discount: string;
  rating: number;
  reviews: number;
}

interface DashboardData {
  stats: {
    totalProducts: number;
    activeProducts: number;
    avgRating: number;
    totalReviews: number;
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalBulkOrders: number;
  };
  products: Product[];
  topProducts: Product[];
  categories: Array<{
    key: string;
    count: number;
    avgPrice: number;
    avgRating: string;
    sampleProduct: Product | null;
  }>;
  recentOrders: Array<{
    _id: string;
    orderId: string;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
    user?: { name: string; email: string };
  }>;
}

const categoryLabels: Record<string, string> = {
  cookie: "Cookies",
  "energy-bar": "Energy Bars",
  "desert-date": "Snacks",
};

// Helper function to get product image
const getProductImage = (product: Product): string => {
  return product.images?.[0] || product.image || "/placeholder.png";
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiFetch<DashboardData>("/dashboard/stats");
        setData(response);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
              <div className="h-10 w-10 bg-surface rounded-lg mb-3"></div>
              <div className="h-8 bg-surface rounded mb-2"></div>
              <div className="h-4 bg-surface rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-sm text-red-600 mt-1">{error || "Failed to load dashboard data"}</p>
        </div>
      </div>
    );
  }

  const { stats, products, topProducts, categories } = data;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Welcome back! Here&apos;s your store overview.</p>
      </div>

      {/* Stats cards - real data from API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Total Products", 
            value: stats.totalProducts.toString(), 
            subtext: `${stats.activeProducts} active`,
            icon: Package, 
            color: "bg-primary/10 text-primary" 
          },
          { 
            label: "Avg. Rating", 
            value: `${stats.avgRating.toFixed(1)}★`, 
            subtext: `${stats.totalReviews} reviews`,
            icon: Star, 
            color: "bg-warning/10 text-warning" 
          },
          { 
            label: "Total Orders", 
            value: stats.totalOrders.toString(), 
            subtext: `₹${stats.totalRevenue.toLocaleString()} revenue`,
            icon: ShoppingCart, 
            color: "bg-info/10 text-info" 
          },
          { 
            label: "Customers", 
            value: stats.totalCustomers.toString(), 
            subtext: `${stats.totalBulkOrders} bulk orders`,
            icon: Users, 
            color: "bg-success/10 text-success" 
          },
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
              {stat.subtext && (
                <p className="text-xs text-muted mt-1">{stat.subtext}</p>
              )}
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
              <div key={product._id} className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-surface border border-border mb-2">
                  <Image
                    src={getProductImage(product)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 200px"
                  />
                  {product.discount && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                      {product.discount}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-stone-800 truncate">{product.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-900">₹{product.price}</span>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Star size={10} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] text-muted">{product.rating}</span>
                    </div>
                  )}
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
              <div key={product._id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 bg-surface">
                  <Image 
                    src={getProductImage(product)} 
                    alt={product.name} 
                    fill 
                    className="object-cover" 
                    sizes="40px" 
                  />
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
          {categories.map((category) => {
            const label = categoryLabels[category.key] || category.key;
            return (
              <div key={category.key} className="border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  {category.sampleProduct && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden relative bg-surface shrink-0">
                      <Image 
                        src={getProductImage(category.sampleProduct)} 
                        alt={label} 
                        fill 
                        className="object-cover" 
                        sizes="48px" 
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">{label}</h3>
                    <p className="text-xs text-muted">{category.count} products</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">
                    Avg. price: <span className="font-medium text-stone-700">₹{category.avgPrice}</span>
                  </span>
                  <span className="text-muted">
                    <Star size={11} className="inline text-yellow-500 fill-yellow-500" />{" "}
                    {category.avgRating}
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
