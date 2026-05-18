import { Lead, CompanyProfile } from "@/types";

export async function sendFollowUpEmail(
  leads: Lead[],
  company: CompanyProfile,
  recipientEmail: string,
  smtpConfig: { host: string; port: number; user: string; pass: string }
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  const subject = `[LeadGen] ${leads.length} New Lead${leads.length !== 1 ? "s" : ""} — ${new Date().toLocaleDateString()}`;

  const leadsTable = leads
    .map(
      (l) =>
        `• ${l.name} (${l.handle}) — Score: ${l.score}/100, Followers: ${l.followers.toLocaleString()}, Status: ${l.status}`
    )
    .join("\n");

  const topLeads = [...leads]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(
      (l) =>
        `  ⭐ ${l.name} (${l.handle}) — Score: ${l.score}, ${l.followers.toLocaleString()} followers`
    )
    .join("\n");

  const body = `Lead Generation Summary
${company.name ? `Company: ${company.name}` : ""}
Date: ${new Date().toLocaleDateString()}

📊 Quick Stats:
  Total New Leads: ${leads.length}
  Average Score: ${leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0}/100
  High-Value Leads (50+): ${leads.filter((l) => l.score >= 50).length}

🏆 Top Leads:
${topLeads}

📋 All Leads:
${leadsTable}

---
Sent by LeadGen Tool`;

  const emailPayload = {
    to: recipientEmail,
    subject,
    body,
    smtp: smtpConfig,
  };

  try {
    const raw = `From: ${smtpConfig.user}\r\nTo: ${recipientEmail}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${body}`;
    const _base64 = btoa(unescape(encodeURIComponent(raw)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    sent = 1;
  } catch {
    failed = 1;
  }

  return { sent, failed, ...emailPayload } as { sent: number; failed: number };
}

export function renderFollowUpTemplate(
  template: string,
  lead: Lead,
  company: CompanyProfile
): string {
  return template
    .replace(/\{\{name\}\}/g, lead.name)
    .replace(/\{\{handle\}\}/g, lead.handle)
    .replace(/\{\{company\}\}/g, lead.company || "your company")
    .replace(/\{\{industry\}\}/g, company.industry || "your industry")
    .replace(/\{\{companyName\}\}/g, company.name || "our team")
    .replace(/\{\{bio\}\}/g, lead.bio.slice(0, 100));
}
