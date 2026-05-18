import { Lead } from "@/types";

export async function searchTwitterLeads(
  query: string,
  bearerToken: string,
  maxResults: number = 20
): Promise<Lead[]> {
  const url = new URL("https://api.twitter.com/2/tweets/search/recent");
  url.searchParams.set("query", query);
  url.searchParams.set("max_results", String(Math.min(maxResults, 100)));
  url.searchParams.set(
    "tweet.fields",
    "author_id,created_at,public_metrics,entities"
  );
  url.searchParams.set(
    "user.fields",
    "name,username,description,location,public_metrics,url"
  );
  url.searchParams.set("expansions", "author_id");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${bearerToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Twitter API error: ${res.status} ${err?.detail || res.statusText}`
    );
  }

  const data = await res.json();
  const users = data.includes?.users || [];

  const seen = new Set<string>();
  const leads: Lead[] = [];

  for (const user of users) {
    if (seen.has(user.id)) continue;
    seen.add(user.id);

    leads.push({
      id: `tw_${user.id}_${Date.now()}`,
      name: user.name || "",
      handle: `@${user.username}`,
      bio: user.description || "",
      followers: user.public_metrics?.followers_count || 0,
      location: user.location || "",
      email: "",
      company: "",
      source: "twitter",
      score: calculateLeadScore(user),
      status: "new",
      tags: extractTags(query),
      createdAt: new Date().toISOString(),
      notes: "",
    });
  }

  return leads;
}

function calculateLeadScore(user: {
  public_metrics?: { followers_count?: number; tweet_count?: number };
  description?: string;
  location?: string;
}): number {
  let score = 0;
  const followers = user.public_metrics?.followers_count || 0;
  const tweets = user.public_metrics?.tweet_count || 0;

  if (followers > 10000) score += 30;
  else if (followers > 1000) score += 20;
  else if (followers > 100) score += 10;

  if (tweets > 5000) score += 15;
  else if (tweets > 1000) score += 10;

  if (user.description && user.description.length > 50) score += 10;
  if (user.location) score += 5;

  const engagement =
    tweets > 0 ? Math.min((followers / tweets) * 10, 30) : 0;
  score += Math.round(engagement);

  return Math.min(score, 100);
}

function extractTags(query: string): string[] {
  return query
    .split(/\s+/)
    .filter((w) => w.startsWith("#") || w.startsWith("@") || w.length > 3)
    .slice(0, 5);
}
