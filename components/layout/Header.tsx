"use client";

import { Bell, Search, ChevronDown, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="relative w-96">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search products, orders, customers..."
          className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Visit site */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface"
        >
          <ExternalLink size={16} />
          <span>View Store</span>
        </a>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="relative p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-stone-700"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-card rounded-xl shadow-xl border border-border py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-border">
                <h3 className="font-semibold text-sm">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {[
                  { title: "New order #1024", desc: "Almond Cookies x2", time: "2 min ago", unread: true },
                  { title: "Low stock alert", desc: "Walnut Cookies — 5 units left", time: "1 hour ago", unread: true },
                  { title: "New bulk inquiry", desc: "Corporate order — 500 units", time: "3 hours ago", unread: false },
                  { title: "Review received", desc: "★★★★★ on Energy Bars", time: "5 hours ago", unread: false },
                ].map((n, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 hover:bg-surface cursor-pointer transition-colors ${
                      n.unread ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {n.unread && (
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></span>
                      )}
                      <div>
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted">{n.desc}</p>
                        <p className="text-xs text-muted mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <button className="text-xs text-primary hover:underline">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface transition-colors"
          >
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-sm">
              A
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium leading-tight">Admin</p>
              <p className="text-xs text-muted leading-tight">admin@vrateez.com</p>
            </div>
            <ChevronDown size={16} className="text-muted" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-48 bg-card rounded-xl shadow-xl border border-border py-1 z-50 animate-fadeIn">
              {[
                { label: "My Profile", href: "#" },
                { label: "Settings", href: "/settings" },
                { label: "Sign Out", href: "#" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-2 text-sm hover:bg-surface transition-colors text-stone-700 hover:text-primary"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
