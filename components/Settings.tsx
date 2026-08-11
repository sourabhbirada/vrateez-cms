"use client";

import { useState, useEffect } from "react";
import { Save, Store, Truck, Phone, Globe, Shield, Bell, Palette } from "lucide-react";
import { apiFetch } from "@/lib/api";

const tabs = [
  { id: "general", label: "General", icon: Store },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "seo", label: "SEO & Social", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
];

interface Settings {
  _id: string;
  appearance: {
    brandColors: {
      primary: string;
      headerBg: string;
      footerBg: string;
      accent: string;
    };
    homepageSections: {
      heroCarousel: boolean;
      benefitsSection: boolean;
      newLaunches: boolean;
      ourProducts: boolean;
      testimonials: boolean;
      availableAtPartners: boolean;
      newsletterSignup: boolean;
    };
  };
  notifications: {
    newOrderAlert: boolean;
    lowStockWarning: boolean;
    newCustomerSignup: boolean;
    bulkOrderInquiry: boolean;
    reviewReceived: boolean;
    paymentFailed: boolean;
    dailySalesSummary: boolean;
    weeklyAnalyticsReport: boolean;
  };
  shipping: {
    freeShippingThreshold: number;
    standardShippingFee: number;
    deliveryDays: string;
    deliveryCoverage: string;
    paymentMethods: {
      upi: boolean;
      cards: boolean;
      netBanking: boolean;
      cod: boolean;
    };
  };
  contact: {
    supportEmail: string;
    phone: string;
    whatsapp: string;
    address: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
  };
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ settings: Settings }>("/settings/admin");
      setSettings(response.settings);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await apiFetch("/settings", {
        method: "PATCH",
        body: JSON.stringify({
          appearance: settings.appearance,
          notifications: settings.notifications,
          shipping: settings.shipping,
          contact: settings.contact,
          seo: settings.seo,
          socialMedia: settings.socialMedia,
        }),
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof Settings, field: string, value: any) => {
    if (!settings) return;
    const currentSection = settings[section];
    if (typeof currentSection !== 'object' || currentSection === null) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...currentSection,
        [field]: value,
      },
    });
  };

  const updateNestedSettings = (section: keyof Settings, nestedField: string, field: string, value: any) => {
    if (!settings) return;
    const currentSection = settings[section];
    if (typeof currentSection !== 'object' || currentSection === null) return;
    
    const currentNested = (currentSection as any)[nestedField];
    if (typeof currentNested !== 'object' || currentNested === null) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...currentSection,
        [nestedField]: {
          ...currentNested,
          [field]: value,
        },
      },
    });
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
          <p className="text-sm text-muted mt-1">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
          <p className="text-sm text-muted mt-1">Configure your store settings</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-stone-600 hover:bg-card hover:text-stone-800"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "general" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-fadeIn">
              <h2 className="text-lg font-semibold text-stone-900">General Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Store Name</label>
                  <input type="text" defaultValue="Vrateez" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Store URL</label>
                  <input type="text" defaultValue="https://vrateez.com" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Currency</label>
                  <select defaultValue="INR" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="INR">â‚¹ INR - Indian Rupee</option>
                    <option value="USD">$ USD - US Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Timezone</label>
                  <select defaultValue="IST" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="IST">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Store Description</label>
                  <textarea rows={3} defaultValue="Premium protein-rich snacks made with grass-fed whey protein. 100% vegetarian, FSSAI certified, no added sugar." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"></textarea>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-base font-semibold text-stone-900 mb-4">Business Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">GSTIN</label>
                    <input type="text" placeholder="Enter your GSTIN" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">FSSAI License</label>
                    <input type="text" placeholder="FSSAI license number" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-fadeIn">
              <h2 className="text-lg font-semibold text-stone-900">Shipping Settings</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Free Shipping Threshold (â‚¹)</label>
                    <input 
                      type="number" 
                      value={settings.shipping.freeShippingThreshold} 
                      onChange={(e) => updateSettings("shipping", "freeShippingThreshold", Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Standard Shipping Fee (â‚¹)</label>
                    <input 
                      type="number" 
                      value={settings.shipping.standardShippingFee} 
                      onChange={(e) => updateSettings("shipping", "standardShippingFee", Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Delivery Days (Standard)</label>
                    <input 
                      type="text" 
                      value={settings.shipping.deliveryDays} 
                      onChange={(e) => updateSettings("shipping", "deliveryDays", e.target.value)}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Delivery Coverage</label>
                    <input 
                      type="text" 
                      value={settings.shipping.deliveryCoverage} 
                      onChange={(e) => updateSettings("shipping", "deliveryCoverage", e.target.value)}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                    />
                  </div>
                </div>
                <div className="bg-surface rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-stone-800 mb-3">Payment Methods</h3>
                  <div className="space-y-3">
                    {[
                      { key: "upi", label: "UPI (GPay, PhonePe, Paytm)" },
                      { key: "cards", label: "Credit/Debit Cards" },
                      { key: "netBanking", label: "Net Banking" },
                      { key: "cod", label: "Cash on Delivery (COD)" },
                    ].map((method) => (
                      <label key={method.key} className="flex items-center gap-3 text-sm text-stone-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.shipping.paymentMethods[method.key as keyof typeof settings.shipping.paymentMethods]} 
                          onChange={(e) => updateNestedSettings("shipping", "paymentMethods", method.key, e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary" 
                        />
                        {method.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-fadeIn">
              <h2 className="text-lg font-semibold text-stone-900">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Support Email</label>
                  <input 
                    type="email" 
                    value={settings.contact.supportEmail} 
                    onChange={(e) => updateSettings("contact", "supportEmail", e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={settings.contact.phone} 
                    onChange={(e) => updateSettings("contact", "phone", e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">WhatsApp Number</label>
                  <input 
                    type="text" 
                    value={settings.contact.whatsapp} 
                    onChange={(e) => updateSettings("contact", "whatsapp", e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Address</label>
                  <textarea 
                    rows={2} 
                    value={settings.contact.address} 
                    onChange={(e) => updateSettings("contact", "address", e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-fadeIn">
              <h2 className="text-lg font-semibold text-stone-900">SEO & Social Media</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Meta Title</label>
                  <input 
                    type="text" 
                    value={settings.seo.metaTitle} 
                    onChange={(e) => updateSettings("seo", "metaTitle", e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Meta Description</label>
                  <textarea 
                    rows={3} 
                    value={settings.seo.metaDescription} 
                    onChange={(e) => updateSettings("seo", "metaDescription", e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                  />
                </div>
                <div className="border-t border-border pt-5">
                  <h3 className="text-sm font-semibold text-stone-800 mb-4">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: "instagram", label: "Instagram" },
                      { key: "facebook", label: "Facebook" },
                      { key: "twitter", label: "Twitter / X" },
                      { key: "youtube", label: "YouTube" },
                    ].map((platform) => (
                      <div key={platform.key}>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">{platform.label}</label>
                        <input 
                          type="url" 
                          value={settings.socialMedia[platform.key as keyof typeof settings.socialMedia]} 
                          onChange={(e) => updateSettings("socialMedia", platform.key, e.target.value)}
                          placeholder={`https://${platform.key}.com/vrateez`} 
                          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-fadeIn">
              <h2 className="text-lg font-semibold text-stone-900">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { title: "New Order Alert", desc: "Get notified when a customer places a new order", enabled: true },
                  { title: "Low Stock Warning", desc: "Alert when product stock drops below threshold", enabled: true },
                  { title: "New Customer Signup", desc: "Notification when a new customer registers", enabled: false },
                  { title: "Bulk Order Inquiry", desc: "Alert for new B2B bulk order inquiries", enabled: true },
                  { title: "Review Received", desc: "When a customer leaves a product review", enabled: false },
                  { title: "Payment Failed", desc: "Alert when a payment transaction fails", enabled: true },
                  { title: "Daily Sales Summary", desc: "Daily email summary of sales and orders", enabled: true },
                  { title: "Weekly Analytics Report", desc: "Weekly performance report via email", enabled: false },
                ].map((n) => (
                  <div key={n.title} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{n.title}</p>
                      <p className="text-xs text-muted mt-0.5">{n.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={n.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-fadeIn">
              <h2 className="text-lg font-semibold text-stone-900">Appearance</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">Brand Colors</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Primary", color: "#F97316" },
                      { label: "Header BG", color: "#E8DCC8" },
                      { label: "Footer BG", color: "#2D1B14" },
                      { label: "Accent", color: "#FB923C" },
                    ].map((c) => (
                      <div key={c.label}>
                        <p className="text-xs text-muted mb-1.5">{c.label}</p>
                        <div className="flex items-center gap-2">
                          <input type="color" defaultValue={c.color} className="w-8 h-8 rounded border border-border cursor-pointer" />
                          <input type="text" defaultValue={c.color} className="flex-1 px-3 py-2 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-5">
                  <label className="block text-sm font-medium text-stone-700 mb-3">Homepage Sections</label>
                  <div className="space-y-3">
                    {["Hero Carousel", "Benefits Section", "New Launches", "Our Products", "Testimonials", "Available At Partners", "Newsletter Signup"].map((section) => (
                      <label key={section} className="flex items-center justify-between py-2 cursor-pointer">
                        <span className="text-sm text-stone-700">{section}</span>
                        <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
