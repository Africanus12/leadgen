import { Lead, CompanyProfile } from "@/types";

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error("Failed to refresh Google access token");
  const data = await res.json();
  return data.access_token;
}

export async function createLeadReport(
  leads: Lead[],
  company: CompanyProfile,
  docId: string,
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<{ documentId: string }> {
  const token = await getAccessToken(clientId, clientSecret, refreshToken);

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const qualified = leads.filter(
    (l) => l.status === "qualified" || l.score >= 50
  );
  const topLeads = [...leads].sort((a, b) => b.score - a.score).slice(0, 10);

  let content = `Lead Generation Report — ${company.name || "Your Company"}\n`;
  content += `Generated: ${date}\n\n`;
  content += `EXECUTIVE SUMMARY\n`;
  content += `Total Leads: ${leads.length}\n`;
  content += `Qualified Leads: ${qualified.length}\n`;
  content += `Average Lead Score: ${leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0}\n`;
  content += `Top Source: Twitter\n\n`;

  if (company.name) {
    content += `COMPANY PROFILE\n`;
    content += `Company: ${company.name}\n`;
    content += `Industry: ${company.industry}\n`;
    content += `Website: ${company.website}\n`;
    content += `Contact: ${company.contactEmail}\n\n`;
  }

  content += `TOP LEADS\n`;
  for (const lead of topLeads) {
    content += `\n${lead.name} (${lead.handle})\n`;
    content += `  Score: ${lead.score}/100 | Followers: ${lead.followers.toLocaleString()}\n`;
    content += `  Location: ${lead.location || "N/A"}\n`;
    content += `  Bio: ${lead.bio.slice(0, 150)}\n`;
    content += `  Status: ${lead.status}\n`;
  }

  content += `\nALL LEADS\n`;
  for (const lead of leads) {
    content += `${lead.name} | ${lead.handle} | Score: ${lead.score} | ${lead.status}\n`;
  }

  const requests = [
    {
      insertText: {
        location: { index: 1 },
        text: content,
      },
    },
  ];

  const updateRes = await fetch(
    `https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(`Google Docs error: ${err?.error?.message || updateRes.statusText}`);
  }

  return { documentId: docId };
}
