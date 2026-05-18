import { Lead, CompanyProfile, DashboardStats } from "@/types";

let leads: Lead[] = [];
let companyProfile: CompanyProfile = {
  name: "",
  website: "",
  industry: "",
  description: "",
  contactEmail: "",
  followUpTemplate:
    "Hi {{name}},\n\nI came across your profile on Twitter and was impressed by your work in {{industry}}. I'd love to connect and explore potential collaboration opportunities.\n\nBest regards,\n{{companyName}}",
};

export function getLeads(): Lead[] {
  return leads;
}

export function addLeads(newLeads: Lead[]): Lead[] {
  leads = [...leads, ...newLeads];
  return leads;
}

export function updateLead(id: string, updates: Partial<Lead>): Lead | null {
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  leads[idx] = { ...leads[idx], ...updates };
  return leads[idx];
}

export function deleteLead(id: string): boolean {
  const before = leads.length;
  leads = leads.filter((l) => l.id !== id);
  return leads.length < before;
}

export function getCompanyProfile(): CompanyProfile {
  return companyProfile;
}

export function updateCompanyProfile(
  updates: Partial<CompanyProfile>
): CompanyProfile {
  companyProfile = { ...companyProfile, ...updates };
  return companyProfile;
}

export function getDashboardStats(): DashboardStats {
  const today = new Date().toISOString().split("T")[0];
  const newToday = leads.filter((l) => l.createdAt.startsWith(today)).length;
  const contacted = leads.filter((l) => l.status === "contacted").length;
  const qualified = leads.filter((l) => l.status === "qualified").length;
  const converted = leads.filter((l) => l.status === "converted").length;

  return {
    totalLeads: leads.length,
    newToday,
    contacted,
    qualified,
    converted,
    conversionRate:
      leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0,
  };
}
