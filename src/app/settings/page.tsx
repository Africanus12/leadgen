"use client";

import { useState, useEffect } from "react";

interface Settings {
  company: {
    name: string;
    website: string;
    industry: string;
    description: string;
    contactEmail: string;
    followUpTemplate: string;
  };
  api: {
    twitterBearerToken: string;
    googleClientId: string;
    googleClientSecret: string;
    googleRefreshToken: string;
    spreadsheetId: string;
    googleDocId: string;
    emailHost: string;
    emailPort: string;
    emailUser: string;
    emailPass: string;
    notificationEmail: string;
  };
}

const defaultTemplate =
  "Hi {{name}},\n\nI came across your profile on Twitter and was impressed by your work in {{industry}}. I'd love to connect and explore potential collaboration opportunities.\n\nBest regards,\n{{companyName}}";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    company: {
      name: "",
      website: "",
      industry: "",
      description: "",
      contactEmail: "",
      followUpTemplate: defaultTemplate,
    },
    api: {
      twitterBearerToken: "",
      googleClientId: "",
      googleClientSecret: "",
      googleRefreshToken: "",
      spreadsheetId: "",
      googleDocId: "",
      emailHost: "smtp.gmail.com",
      emailPort: "587",
      emailUser: "",
      emailPass: "",
      notificationEmail: "",
    },
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"company" | "twitter" | "google" | "email">("company");

  useEffect(() => {
    const stored = localStorage.getItem("leadgen_settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        // use defaults
      }
    }
  }, []);

  function handleSave() {
    localStorage.setItem("leadgen_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateCompany(field: string, value: string) {
    setSettings((s) => ({
      ...s,
      company: { ...s.company, [field]: value },
    }));
  }

  function updateApi(field: string, value: string) {
    setSettings((s) => ({
      ...s,
      api: { ...s.api, [field]: value },
    }));
  }

  const tabs = [
    { key: "company" as const, label: "Company Profile" },
    { key: "twitter" as const, label: "Twitter API" },
    { key: "google" as const, label: "Google APIs" },
    { key: "email" as const, label: "Email / SMTP" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Configure your company profile, API keys, and integrations
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === "company" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-2">Company Profile</h2>
            <p className="text-sm text-gray-500 mb-4">
              This information appears in reports and follow-up emails.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={settings.company.name}
                  onChange={(e) => updateCompany("name", e.target.value)}
                  className="input-field"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={settings.company.website}
                  onChange={(e) => updateCompany("website", e.target.value)}
                  className="input-field"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={settings.company.industry}
                  onChange={(e) => updateCompany("industry", e.target.value)}
                  className="input-field"
                  placeholder="SaaS, Marketing, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.company.contactEmail}
                  onChange={(e) => updateCompany("contactEmail", e.target.value)}
                  className="input-field"
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
              <textarea
                value={settings.company.description}
                onChange={(e) => updateCompany("description", e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Brief description of your company..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow-Up Email Template
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Variables: {"{{name}}"}, {"{{handle}}"}, {"{{company}}"}, {"{{industry}}"}, {"{{companyName}}"}, {"{{bio}}"}
              </p>
              <textarea
                value={settings.company.followUpTemplate}
                onChange={(e) => updateCompany("followUpTemplate", e.target.value)}
                className="input-field font-mono text-sm"
                rows={8}
              />
            </div>
          </div>
        )}

        {activeTab === "twitter" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-2">Twitter API</h2>
            <p className="text-sm text-gray-500 mb-4">
              Get your Bearer Token from the{" "}
              <span className="text-brand-600">Twitter Developer Portal</span>.
              Requires at least Basic access level.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bearer Token</label>
              <input
                type="password"
                value={settings.api.twitterBearerToken}
                onChange={(e) => updateApi("twitterBearerToken", e.target.value)}
                className="input-field font-mono"
                placeholder="AAAA..."
              />
            </div>
          </div>
        )}

        {activeTab === "google" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-2">Google APIs</h2>
            <p className="text-sm text-gray-500 mb-4">
              Configure Google Sheets and Docs integration. Create OAuth2
              credentials in Google Cloud Console.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                <input
                  type="text"
                  value={settings.api.googleClientId}
                  onChange={(e) => updateApi("googleClientId", e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                <input
                  type="password"
                  value={settings.api.googleClientSecret}
                  onChange={(e) => updateApi("googleClientSecret", e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label>
                <input
                  type="password"
                  value={settings.api.googleRefreshToken}
                  onChange={(e) => updateApi("googleRefreshToken", e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spreadsheet ID</label>
                <input
                  type="text"
                  value={settings.api.spreadsheetId}
                  onChange={(e) => updateApi("spreadsheetId", e.target.value)}
                  className="input-field font-mono text-sm"
                  placeholder="From your Google Sheet URL"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Doc ID</label>
                <input
                  type="text"
                  value={settings.api.googleDocId}
                  onChange={(e) => updateApi("googleDocId", e.target.value)}
                  className="input-field font-mono text-sm"
                  placeholder="From your Google Doc URL"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "email" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-2">Email / SMTP</h2>
            <p className="text-sm text-gray-500 mb-4">
              Configure SMTP for sending follow-up email summaries. For Gmail,
              use an App Password.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={settings.api.emailHost}
                  onChange={(e) => updateApi("emailHost", e.target.value)}
                  className="input-field"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                <input
                  type="text"
                  value={settings.api.emailPort}
                  onChange={(e) => updateApi("emailPort", e.target.value)}
                  className="input-field"
                  placeholder="587"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email User</label>
                <input
                  type="email"
                  value={settings.api.emailUser}
                  onChange={(e) => updateApi("emailUser", e.target.value)}
                  className="input-field"
                  placeholder="you@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Password / App Password</label>
                <input
                  type="password"
                  value={settings.api.emailPass}
                  onChange={(e) => updateApi("emailPass", e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification Email</label>
                <p className="text-xs text-gray-400 mb-1">Where to send lead summary emails</p>
                <input
                  type="email"
                  value={settings.api.notificationEmail}
                  onChange={(e) => updateApi("notificationEmail", e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button onClick={handleSave} className="btn-primary">
            Save Settings
          </button>
          {saved && (
            <span className="text-green-600 text-sm font-medium">
              Settings saved!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
