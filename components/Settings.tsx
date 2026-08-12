"use client";

import { useState, useEffect } from "react";
import { Save, Store, Truck, Phone, Globe, Shield, Bell, Palette } from "lucide-react";
import { apiFetch } from "@/lib/api";

const tabs = [
  { id: "content", label: "Homepage Content", icon: Store },
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
  announcementBar?: {
    enabled: boolean;
    text: string;
    link?: string;
    bgColor?: string;
    textColor?: string;
  };
  content?: {
    benefits?: Array<{ title: string; subtitle: string; image: string; bgColor?: string }>;
    partners?: Array<{ name: string; url?: string; logoUrl?: string }>;
    featureBadges?: string[];
  };
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("content");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [badgesText, setBadgesText] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ settings: Settings }>("/settings/admin");
      setSettings({
        ...response.settings,
        announcementBar: {
          enabled: response.settings.announcementBar?.enabled !== false,
          text: response.settings.announcementBar?.text || "",
          link: response.settings.announcementBar?.link || "/shop",
          bgColor: response.settings.announcementBar?.bgColor || "#241F16",
          textColor: response.settings.announcementBar?.textColor || "#F3EAD8",
        },
        content: {
          benefits: response.settings.content?.benefits || [],
          partners: response.settings.content?.partners || [],
          featureBadges: response.settings.content?.featureBadges || [],
        },
      });
      setBadgesText((response.settings.content?.featureBadges || []).join("\n"));
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
          announcementBar: settings.announcementBar,
          content: {
            benefits: settings.content?.benefits || [],
            partners: settings.content?.partners || [],
            featureBadges: badgesText
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          },
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
          {activeTab === "content" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-fadeIn">
              <h2 className="text-lg font-semibold text-stone-900">Homepage Content</h2>
              <p className="text-sm text-muted">
                Benefits, partners, and feature badges shown on the storefront. Leave empty to hide a section.
              </p>

              <div className="rounded-xl border border-border bg-surface/40 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-800">Top highlight bar</h3>
                    <p className="text-xs text-muted mt-0.5">
                      Slim black bar above the header. Leave text empty to auto-use free delivery threshold.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.announcementBar?.enabled !== false}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          announcementBar: {
                            ...(settings.announcementBar || {
                              enabled: true,
                              text: "",
                              link: "/shop",
                              bgColor: "#241F16",
                              textColor: "#F3EAD8",
                            }),
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-border"
                    />
                    Enabled
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Headline</label>
                  <input
                    type="text"
                    value={settings.announcementBar?.text || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        announcementBar: {
                          ...(settings.announcementBar || {
                            enabled: true,
                            text: "",
                            link: "/shop",
                            bgColor: "#241F16",
                            textColor: "#F3EAD8",
                          }),
                          text: e.target.value,
                        },
                      })
                    }
                    placeholder={`Free delivery on orders above ₹${settings.shipping?.freeShippingThreshold || 499}`}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Link</label>
                    <input
                      type="text"
                      value={settings.announcementBar?.link || "/shop"}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          announcementBar: {
                            ...(settings.announcementBar as NonNullable<Settings["announcementBar"]>),
                            link: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Background</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.announcementBar?.bgColor || "#241F16"}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            announcementBar: {
                              ...(settings.announcementBar as NonNullable<Settings["announcementBar"]>),
                              bgColor: e.target.value,
                            },
                          })
                        }
                        className="w-10 h-10 rounded border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.announcementBar?.bgColor || "#241F16"}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            announcementBar: {
                              ...(settings.announcementBar as NonNullable<Settings["announcementBar"]>),
                              bgColor: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-3 py-2 border border-border rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Text color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.announcementBar?.textColor || "#F3EAD8"}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            announcementBar: {
                              ...(settings.announcementBar as NonNullable<Settings["announcementBar"]>),
                              textColor: e.target.value,
                            },
                          })
                        }
                        className="w-10 h-10 rounded border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.announcementBar?.textColor || "#F3EAD8"}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            announcementBar: {
                              ...(settings.announcementBar as NonNullable<Settings["announcementBar"]>),
                              textColor: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-3 py-2 border border-border rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
                <div
                  className="rounded-lg px-3 py-2 text-center text-xs"
                  style={{
                    backgroundColor: settings.announcementBar?.bgColor || "#241F16",
                    color: settings.announcementBar?.textColor || "#F3EAD8",
                  }}
                >
                  Preview:{" "}
                  {settings.announcementBar?.text?.trim() ||
                    `Free delivery on orders above ₹${settings.shipping?.freeShippingThreshold || 499} · Pan-India shipping`}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-800">Benefits</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        content: {
                          ...settings.content,
                          benefits: [
                            ...(settings.content?.benefits || []),
                            { title: "", subtitle: "", image: "", bgColor: "#F5E6C8" },
                          ],
                        },
                      })
                    }
                    className="text-sm text-primary hover:underline"
                  >
                    + Add benefit
                  </button>
                </div>
                {(settings.content?.benefits || []).map((b, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-border rounded-lg p-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={b.title}
                      onChange={(e) => {
                        const benefits = [...(settings.content?.benefits || [])];
                        benefits[index] = { ...benefits[index], title: e.target.value };
                        setSettings({ ...settings, content: { ...settings.content, benefits } });
                      }}
                      className="px-3 py-2 border border-border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Subtitle"
                      value={b.subtitle}
                      onChange={(e) => {
                        const benefits = [...(settings.content?.benefits || [])];
                        benefits[index] = { ...benefits[index], subtitle: e.target.value };
                        setSettings({ ...settings, content: { ...settings.content, benefits } });
                      }}
                      className="px-3 py-2 border border-border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={b.image}
                      onChange={(e) => {
                        const benefits = [...(settings.content?.benefits || [])];
                        benefits[index] = { ...benefits[index], image: e.target.value };
                        setSettings({ ...settings, content: { ...settings.content, benefits } });
                      }}
                      className="md:col-span-2 px-3 py-2 border border-border rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const benefits = (settings.content?.benefits || []).filter((_, i) => i !== index);
                        setSettings({ ...settings, content: { ...settings.content, benefits } });
                      }}
                      className="text-xs text-danger text-left"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-border pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-800">Partners (Available At)</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        content: {
                          ...settings.content,
                          partners: [...(settings.content?.partners || []), { name: "", url: "", logoUrl: "" }],
                        },
                      })
                    }
                    className="text-sm text-primary hover:underline"
                  >
                    + Add partner
                  </button>
                </div>
                {(settings.content?.partners || []).map((p, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 border border-border rounded-lg p-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={p.name}
                      onChange={(e) => {
                        const partners = [...(settings.content?.partners || [])];
                        partners[index] = { ...partners[index], name: e.target.value };
                        setSettings({ ...settings, content: { ...settings.content, partners } });
                      }}
                      className="px-3 py-2 border border-border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={p.url || ""}
                      onChange={(e) => {
                        const partners = [...(settings.content?.partners || [])];
                        partners[index] = { ...partners[index], url: e.target.value };
                        setSettings({ ...settings, content: { ...settings.content, partners } });
                      }}
                      className="px-3 py-2 border border-border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Logo URL"
                      value={p.logoUrl || ""}
                      onChange={(e) => {
                        const partners = [...(settings.content?.partners || [])];
                        partners[index] = { ...partners[index], logoUrl: e.target.value };
                        setSettings({ ...settings, content: { ...settings.content, partners } });
                      }}
                      className="px-3 py-2 border border-border rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const partners = (settings.content?.partners || []).filter((_, i) => i !== index);
                        setSettings({ ...settings, content: { ...settings.content, partners } });
                      }}
                      className="text-xs text-danger text-left md:col-span-3"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-border pt-5">
                <h3 className="text-sm font-semibold text-stone-800">Feature badges (one per line)</h3>
                <textarea
                  rows={5}
                  value={badgesText}
                  onChange={(e) => setBadgesText(e.target.value)}
                  placeholder={"Vrat Friendly\nMillet-Based\nClean Label"}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
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
                  { key: "newOrderAlert", title: "New Order Alert", desc: "Get notified when a customer places a new order" },
                  { key: "lowStockWarning", title: "Low Stock Warning", desc: "Alert when product stock drops below threshold" },
                  { key: "newCustomerSignup", title: "New Customer Signup", desc: "Notification when a new customer registers" },
                  { key: "bulkOrderInquiry", title: "Bulk Order Inquiry", desc: "Alert for new B2B bulk order inquiries" },
                  { key: "reviewReceived", title: "Review Received", desc: "When a customer leaves a product review" },
                  { key: "paymentFailed", title: "Payment Failed", desc: "Alert when a payment transaction fails" },
                  { key: "dailySalesSummary", title: "Daily Sales Summary", desc: "Daily email summary of sales and orders" },
                  { key: "weeklyAnalyticsReport", title: "Weekly Analytics Report", desc: "Weekly performance report via email" },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{n.title}</p>
                      <p className="text-xs text-muted mt-0.5">{n.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(settings.notifications[n.key as keyof typeof settings.notifications])}
                        onChange={(e) => updateSettings("notifications", n.key, e.target.checked)}
                        className="sr-only peer"
                      />
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
                      { key: "primary", label: "Primary" },
                      { key: "headerBg", label: "Header BG" },
                      { key: "footerBg", label: "Footer BG" },
                      { key: "accent", label: "Accent" },
                    ].map((c) => (
                      <div key={c.key}>
                        <p className="text-xs text-muted mb-1.5">{c.label}</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.appearance.brandColors[c.key as keyof typeof settings.appearance.brandColors]}
                            onChange={(e) => updateNestedSettings("appearance", "brandColors", c.key, e.target.value)}
                            className="w-8 h-8 rounded border border-border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.appearance.brandColors[c.key as keyof typeof settings.appearance.brandColors]}
                            onChange={(e) => updateNestedSettings("appearance", "brandColors", c.key, e.target.value)}
                            className="flex-1 px-3 py-2 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-5">
                  <label className="block text-sm font-medium text-stone-700 mb-3">Homepage Sections</label>
                  <div className="space-y-3">
                    {[
                      { key: "heroCarousel", label: "Hero Carousel" },
                      { key: "benefitsSection", label: "Benefits Section" },
                      { key: "newLaunches", label: "New Launches" },
                      { key: "ourProducts", label: "Our Products" },
                      { key: "testimonials", label: "Testimonials" },
                      { key: "availableAtPartners", label: "Available At Partners" },
                      { key: "newsletterSignup", label: "Newsletter Signup" },
                    ].map((section) => (
                      <label key={section.key} className="flex items-center justify-between py-2 cursor-pointer">
                        <span className="text-sm text-stone-700">{section.label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(
                            settings.appearance.homepageSections[
                              section.key as keyof typeof settings.appearance.homepageSections
                            ]
                          )}
                          onChange={(e) =>
                            updateNestedSettings("appearance", "homepageSections", section.key, e.target.checked)
                          }
                          className="rounded border-border text-primary focus:ring-primary"
                        />
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
