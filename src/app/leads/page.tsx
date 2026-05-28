"use client";

import { useState } from "react";
import type { Lead } from "@/types";

export default function LeadSearchPage() {
  const [query, setQuery] = useState("");
  const [minFollowers, setMinFollowers] = useState(100);
  const [maxResults, setMaxResults] = useState(20);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    setSaved(false);

    try {
      const res = await fetch("/api/twitter-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, minFollowers, maxResults, location }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");

      setResults(data.leads || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search failed");
    }
    setLoading(false);
  }

  async function handleSaveLeads() {
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: results }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save leads");
    }
  }

  async function handleExportSheets() {
    try {
      const res = await fetch("/api/google-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: results }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Export failed");
      alert(`Exported ${data.updatedRows} rows to Google Sheets`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  }

  async function handleExportDocs() {
    try {
      const res = await fetch("/api/google-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: results }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Export failed");
      alert(`Report created in Google Doc: ${data.documentId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  }

  async function handleSendEmail() {
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: results }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email failed");
      alert(`Follow-up email sent! (${data.sent} sent, ${data.failed} failed)`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email failed");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Lead Search</h1>
        <p className="text-gray-500 mt-1">
          Search Twitter for potential leads using keywords, hashtags, or handles
        </p>
      </div>

      <form onSubmit={handleSearch} className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field"
              placeholder='e.g., "SaaS founder" OR #startup OR "looking for"'
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Followers
            </label>
            <input
              type="number"
              value={minFollowers}
              onChange={(e) => setMinFollowers(Number(e.target.value))}
              className="input-field"
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Results
            </label>
            <input
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="input-field"
              min={10}
              max={100}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Filter (optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
              placeholder="e.g., San Francisco, New York"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Searching..." : "Search Twitter"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Results ({results.length} leads found)
            </h2>
            <div className="flex gap-2">
              <button onClick={handleSaveLeads} className="btn-primary" disabled={saved}>
                {saved ? "Saved ✓" : "Save Leads"}
              </button>
              <button onClick={handleExportSheets} className="btn-secondary">
                Export to Sheets
              </button>
              <button onClick={handleExportDocs} className="btn-secondary">
                Export to Docs
              </button>
              <button onClick={handleSendEmail} className="btn-secondary">
                Send Email Summary
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Handle</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Followers</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Score</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Location</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Bio</th>
                </tr>
              </thead>
              <tbody>
                {results.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{lead.name}</td>
                    <td className="py-3 px-2 text-brand-600">{lead.handle}</td>
                    <td className="py-3 px-2">{lead.followers.toLocaleString()}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`font-medium ${
                          lead.score >= 70
                            ? "text-green-600"
                            : lead.score >= 40
                            ? "text-yellow-600"
                            : "text-gray-400"
                        }`}
                      >
                        {lead.score}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500">{lead.location || "—"}</td>
                    <td className="py-3 px-2 text-gray-500 max-w-xs truncate">{lead.bio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
