"use client";

import { useState, useEffect } from "react";
import {
	IndianRupee,
	ShoppingCart,
	Users,
	TrendingUp,
	Eye,
	ArrowUpRight,
	ArrowDownRight,
	MousePointer,
	Clock,
	Globe,
	Monitor,
	Smartphone,
	Tablet,
	Chrome,
	Activity,
} from "lucide-react";
import { products } from "@/data/products";
import { apiFetch } from "@/lib/api";

const monthlyRevenue = [
	{ month: "Feb", revenue: 24500, orders: 41 },
	{ month: "Mar", revenue: 32100, orders: 52 },
];

const topCities = [
	{ city: "Mumbai", orders: 89, revenue: "₹58,200", pct: 34 },
	{ city: "Delhi", orders: 72, revenue: "₹47,100", pct: 28 },
];

interface AnalyticsData {
	summary: {
		uniqueVisitors: number;
		totalPageViews: number;
		totalProductViews: number;
		cookieAccepted: number;
		cookieRejected: number;
	};
	deviceBreakdown: Array<{ _id: string; count: number }>;
	browserBreakdown: Array<{ _id: string; count: number }>;
	referrerBreakdown: Array<{ _id: string; count: number }>;
	topProducts: Array<{
		_id: string;
		productSlug: string;
		views: number;
		product: { name: string; slug: string; images: string[] };
	}>;
	topPages: Array<{ _id: string; pageTitle: string; views: number }>;
	timeline: Array<{ date: string; pageViews: number; productViews: number; uniqueVisitors: number }>;
}

export default function AnalyticsPage() {
	const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [dateRange, setDateRange] = useState(30); // Default 30 days
	const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

	useEffect(() => {
		fetchAnalytics();
	}, [dateRange]);

	const fetchAnalytics = async () => {
		try {
			setLoading(true);
			const endDate = new Date();
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - dateRange);

			const response = await apiFetch<AnalyticsData>(
				`/activity/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
			);

			setAnalyticsData(response);
		} catch (error) {
			console.error("Failed to fetch analytics:", error);
		} finally {
			setLoading(false);
		}
	};

	const getDeviceIcon = (device: string) => {
		switch (device.toLowerCase()) {
			case "mobile":
				return Smartphone;
			case "tablet":
				return Tablet;
			case "desktop":
				return Monitor;
			default:
				return Monitor;
		}
	};

	const cookieConsentRate = analyticsData
		? ((analyticsData.summary.cookieAccepted / (analyticsData.summary.cookieAccepted + analyticsData.summary.cookieRejected)) * 100).toFixed(1)
		: 0;

	return (
		<div className="space-y-6 animate-fadeIn">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-stone-900">Analytics & User Activity</h1>
					<p className="text-sm text-muted mt-1">Store performance and visitor insights</p>
				</div>
				<select
					value={dateRange}
					onChange={(e) => setDateRange(Number(e.target.value))}
					className="px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
				>
					<option value={7}>Last 7 days</option>
					<option value={30}>Last 30 days</option>
					<option value={90}>Last 90 days</option>
				</select>
			</div>

			{loading ? (
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
				</div>
			) : (
				<>
					{/* User Activity Metrics */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{[
							{
								label: "Unique Visitors",
								value: analyticsData?.summary.uniqueVisitors.toLocaleString() || "0",
								icon: Users,
								color: "bg-blue-100 text-blue-600",
							},
							{
								label: "Page Views",
								value: analyticsData?.summary.totalPageViews.toLocaleString() || "0",
								icon: Eye,
								color: "bg-purple-100 text-purple-600",
							},
							{
								label: "Product Views",
								value: analyticsData?.summary.totalProductViews.toLocaleString() || "0",
								icon: ShoppingCart,
								color: "bg-green-100 text-green-600",
							},
							{
								label: "Cookie Consent Rate",
								value: `${cookieConsentRate}%`,
								icon: Activity,
								color: "bg-orange-100 text-orange-600",
							},
						].map((m) => {
							const Icon = m.icon;
							return (
								<div key={m.label} className="bg-card rounded-xl border border-border p-5">
									<div className="flex items-center justify-between mb-3">
										<div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.color}`}>
											<Icon size={20} />
										</div>
									</div>
									<p className="text-2xl font-bold text-stone-900">{m.value}</p>
									<p className="text-sm text-muted mt-0.5">{m.label}</p>
								</div>
							);
						})}
					</div>

					{/* Device & Browser Analytics */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Device Breakdown */}
						<div className="bg-card rounded-xl border border-border p-6">
							<h2 className="text-lg font-semibold text-stone-900 mb-1 flex items-center gap-2">
								<Monitor size={20} />
								Device Breakdown
							</h2>
							<p className="text-sm text-muted mb-4">Visitors by device type</p>
							<div className="space-y-4">
								{analyticsData?.deviceBreakdown.map((device) => {
									const total = analyticsData.deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
									const percentage = ((device.count / total) * 100).toFixed(1);
									const DeviceIcon = getDeviceIcon(device._id);

									return (
										<div key={device._id}>
											<div className="flex items-center justify-between mb-1.5">
												<div className="flex items-center gap-2">
													<DeviceIcon size={16} className="text-muted" />
													<span className="text-sm text-stone-700 capitalize">{device._id}</span>
												</div>
												<span className="text-sm font-medium text-stone-900">{percentage}%</span>
											</div>
											<div className="w-full h-2 bg-surface rounded-full overflow-hidden">
												<div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
											</div>
											<p className="text-xs text-muted mt-0.5">{device.count.toLocaleString()} visits</p>
										</div>
									);
								})}
							</div>
						</div>

						{/* Browser Breakdown */}
						<div className="bg-card rounded-xl border border-border p-6">
							<h2 className="text-lg font-semibold text-stone-900 mb-1 flex items-center gap-2">
								<Chrome size={20} />
								Browser Breakdown
							</h2>
							<p className="text-sm text-muted mb-4">Visitors by browser</p>
							<div className="space-y-4">
								{analyticsData?.browserBreakdown.slice(0, 5).map((browser) => {
									const total = analyticsData.browserBreakdown.reduce((sum, b) => sum + b.count, 0);
									const percentage = ((browser.count / total) * 100).toFixed(1);

									return (
										<div key={browser._id}>
											<div className="flex items-center justify-between mb-1.5">
												<span className="text-sm text-stone-700">{browser._id}</span>
												<span className="text-sm font-medium text-stone-900">{percentage}%</span>
											</div>
											<div className="w-full h-2 bg-surface rounded-full overflow-hidden">
												<div className="h-full bg-info rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
											</div>
											<p className="text-xs text-muted mt-0.5">{browser.count.toLocaleString()} visits</p>
										</div>
									);
								})}
							</div>
						</div>

						{/* Traffic Sources */}
						<div className="bg-card rounded-xl border border-border p-6">
							<h2 className="text-lg font-semibold text-stone-900 mb-1 flex items-center gap-2">
								<Globe size={20} />
								Traffic Sources
							</h2>
							<p className="text-sm text-muted mb-4">Where visitors come from</p>
							<div className="space-y-4">
								{analyticsData?.referrerBreakdown.map((referrer) => {
									const total = analyticsData.referrerBreakdown.reduce((sum, r) => sum + r.count, 0);
									const percentage = ((referrer.count / total) * 100).toFixed(1);

									return (
										<div key={referrer._id}>
											<div className="flex items-center justify-between mb-1.5">
												<span className="text-sm text-stone-700 capitalize">{referrer._id}</span>
												<span className="text-sm font-medium text-stone-900">{percentage}%</span>
											</div>
											<div className="w-full h-2 bg-surface rounded-full overflow-hidden">
												<div className="h-full bg-success rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
											</div>
											<p className="text-xs text-muted mt-0.5">{referrer.count.toLocaleString()} visits</p>
										</div>
									);
								})}
							</div>
						</div>
					</div>

					{/* Most Viewed Products */}
					<div className="bg-card rounded-xl border border-border overflow-hidden">
						<div className="p-6 pb-4">
							<h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
								<TrendingUp size={20} />
								Most Viewed Products
							</h2>
							<p className="text-sm text-muted">Top products by visitor engagement</p>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="text-left bg-surface/50 border-t border-border">
										<th className="px-6 py-3 text-xs font-semibold text-muted uppercase">Product</th>
										<th className="px-6 py-3 text-xs font-semibold text-muted uppercase">Views</th>
										<th className="px-6 py-3 text-xs font-semibold text-muted uppercase">Slug</th>
									</tr>
								</thead>
								<tbody>
									{analyticsData?.topProducts.slice(0, 10).map((product) => (
										<tr key={product._id} className="border-t border-border hover:bg-surface/30 transition-colors">
											<td className="px-6 py-3 text-sm font-medium text-stone-800">{product.product?.name || "Unknown Product"}</td>
											<td className="px-6 py-3">
												<span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
													<Eye size={12} />
													{product.views}
												</span>
											</td>
											<td className="px-6 py-3 text-sm text-stone-600 font-mono">{product.productSlug}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Most Visited Pages */}
					<div className="bg-card rounded-xl border border-border overflow-hidden">
						<div className="p-6 pb-4">
							<h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
								<MousePointer size={20} />
								Most Visited Pages
							</h2>
							<p className="text-sm text-muted">Popular pages on your site</p>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="text-left bg-surface/50 border-t border-border">
										<th className="px-6 py-3 text-xs font-semibold text-muted uppercase">Page Path</th>
										<th className="px-6 py-3 text-xs font-semibold text-muted uppercase">Page Title</th>
										<th className="px-6 py-3 text-xs font-semibold text-muted uppercase">Views</th>
									</tr>
								</thead>
								<tbody>
									{analyticsData?.topPages.slice(0, 10).map((page) => (
										<tr key={page._id} className="border-t border-border hover:bg-surface/30 transition-colors">
											<td className="px-6 py-3 text-sm font-mono text-stone-600">{page._id}</td>
											<td className="px-6 py-3 text-sm text-stone-800">{page.pageTitle || "—"}</td>
											<td className="px-6 py-3">
												<span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold">
													<Eye size={12} />
													{page.views}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Activity Timeline */}
					{analyticsData?.timeline && analyticsData.timeline.length > 0 && (
						<div className="bg-card rounded-xl border border-border p-6">
							<h2 className="text-lg font-semibold text-stone-900 mb-1 flex items-center gap-2">
								<Clock size={20} />
								Activity Timeline
							</h2>
							<p className="text-sm text-muted mb-6">Daily visitor activity over the selected period</p>
							<div className="flex items-end gap-2 h-52 overflow-x-auto">
								{analyticsData.timeline.map((day) => {
									const maxViews = Math.max(...analyticsData.timeline.map((d) => d.pageViews + d.productViews));
									const totalViews = day.pageViews + day.productViews;
									const height = maxViews > 0 ? (totalViews / maxViews) * 100 : 0;

									return (
										<div key={day.date} className="flex flex-col items-center gap-2 min-w-[60px]">
											<div className="text-xs font-medium text-muted">{totalViews}</div>
											<div className="w-full flex flex-col gap-1" style={{ height: "160px" }}>
												<div className="flex-1 flex items-end">
													<div
														className="w-full rounded-t-lg bg-primary/80 transition-all"
														style={{ height: `${height}%` }}
														title={`${day.pageViews} page views, ${day.productViews} product views`}
													></div>
												</div>
											</div>
											<span className="text-xs text-muted">{new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
											<span className="text-xs text-stone-500">{day.uniqueVisitors} visitors</span>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
