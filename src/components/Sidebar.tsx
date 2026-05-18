"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/leads", label: "Lead Search", icon: "🔍" },
  { href: "/leads/manage", label: "Manage Leads", icon: "👥" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-brand-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-brand-700">
        <h1 className="text-xl font-bold tracking-tight">LeadGen</h1>
        <p className="text-brand-200 text-sm mt-1">Twitter Lead Scraper</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-700 text-white"
                  : "text-brand-200 hover:bg-brand-700/50 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-brand-700">
        <p className="text-brand-200 text-xs">v1.0.0 — Lean Edition</p>
      </div>
    </aside>
  );
}
