export interface Lead {
  id: string;
  name: string;
  handle: string;
  bio: string;
  followers: number;
  location: string;
  email: string;
  company: string;
  source: string;
  score: number;
  status: "new" | "contacted" | "qualified" | "converted";
  tags: string[];
  createdAt: string;
  notes: string;
}

export interface CompanyProfile {
  name: string;
  website: string;
  industry: string;
  description: string;
  contactEmail: string;
  followUpTemplate: string;
}

export interface SearchFilters {
  query: string;
  minFollowers: number;
  maxResults: number;
  location: string;
  keywords: string[];
}

export interface DashboardStats {
  totalLeads: number;
  newToday: number;
  contacted: number;
  qualified: number;
  converted: number;
  conversionRate: number;
}

export interface ApiConfig {
  twitterBearerToken: string;
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
  spreadsheetId: string;
  googleDocId: string;
  emailSmtp: string;
  emailUser: string;
  emailPass: string;
}
