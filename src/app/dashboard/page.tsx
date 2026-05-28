"use client";

import { useState, useEffect } from "react";
import type { DashboardStats, Lead } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        const leads: Lead[] = data.leads || [];

        const today = new Date().toISOString().split("T")[0];
        const newToday = leads.filter((l: Lead) =>
          l.createdAt.startsWith(today)
        ).length;
        const contacted = leads.filter(
          (l: Lead) => l.status === "contacted"
        ).length;
        const qualified = leads.filter(
          (l: Lead) => l.status === "qualified"
        ).length;
        const converted = leads.filter(
          (l: Lead) => l.status === "converted"
        ).length;

        setStats({
          totalLeads: leads.length,
          newToday,
          contacted,
          qualified,
          converted,
          conversionRate:
            leads.length > 0
              ? Math.round((converted / leads.length) * 100)
              : 0,
        });
        setRecentLeads(leads.slice(-5).reverse());
      } catch {
        setStats({
          totalLeads: 0,
          newToday: 0,
          contacted: 0,
          qualified: 0,
          converted: 0,
          conversionRate: 0,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Leads",
      value: stats?.totalLeads ?? 0,
      color: "text-brand-600",
      bg: "bg-brand-50",
    },
    {
      label: "New Today",
      value: stats?.newToday ?? 0,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Contacted",
      value: stats?.contacted ?? 0,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Qualified",
      value: stats?.qualified ?? 0,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Converted",
      value: stats?.converted ?? 0,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Conversion Rate",
      value: `${stats?.conversionRate ?? 0}%`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your lead generation pipeline</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`card ${c.bg}`}>
            <p className="text-sm text-gray-500 mb-1">{c.label}</p>
            <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Leads</h2>
        {recentLeads.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No leads yet. Go to Lead Search to scrape your first batch.
          </p>
        ) : (
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-500">{lead.handle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    Score: {lead.score}
                  </span>
                  <span
                    className={`badge-${lead.status}`}
                  >
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
