"use client";

import { useState, useEffect } from "react";
import type { Lead } from "@/types";

export default function ManageLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch {
      setLeads([]);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: Lead["status"]) {
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates: { status } }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status } : l))
        );
      }
    } catch {
      // silently fail
    }
  }

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead?")) return;
    try {
      const res = await fetch("/api/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
      }
    } catch {
      // silently fail
    }
  }

  const filtered = leads.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    if (
      search &&
      !l.name.toLowerCase().includes(search.toLowerCase()) &&
      !l.handle.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const statusCounts = {
    all: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading leads...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Leads</h1>
        <p className="text-gray-500 mt-1">
          View, filter, and manage your lead pipeline
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-sm"
          placeholder="Search by name or handle..."
        />

        <div className="flex gap-2 flex-wrap">
          {(
            Object.entries(statusCounts) as [string, number][]
          ).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)} ({count})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg">No leads found</p>
          <p className="text-gray-300 text-sm mt-1">
            Search Twitter to find new leads
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <div key={lead.id} className="card flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                  <span className="text-brand-600 text-sm">{lead.handle}</span>
                  <span className={`badge-${lead.status}`}>
                    {lead.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{lead.bio}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>{lead.followers.toLocaleString()} followers</span>
                  {lead.location && <span>{lead.location}</span>}
                  {lead.company && <span>{lead.company}</span>}
                  <span>Score: {lead.score}/100</span>
                  {lead.tags.length > 0 && (
                    <span>{lead.tags.join(", ")}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={lead.status}
                  onChange={(e) =>
                    updateStatus(lead.id, e.target.value as Lead["status"])
                  }
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                </select>
                <button
                  onClick={() => deleteLead(lead.id)}
                  className="text-red-400 hover:text-red-600 text-sm px-2"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
