import { NextRequest, NextResponse } from "next/server";
import { searchTwitterLeads } from "@/lib/twitter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, maxResults = 20 } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const bearerToken =
      req.headers.get("x-twitter-token") ||
      process.env.TWITTER_BEARER_TOKEN ||
      "";

    if (!bearerToken) {
      return NextResponse.json(
        {
          error:
            "Twitter Bearer Token not configured. Add it in Settings or set TWITTER_BEARER_TOKEN env var.",
        },
        { status: 401 }
      );
    }

    const leads = await searchTwitterLeads(query, bearerToken, maxResults);

    const minFollowers = body.minFollowers || 0;
    const filtered = leads.filter((l) => l.followers >= minFollowers);

    const location = body.location?.toLowerCase();
    const locationFiltered = location
      ? filtered.filter((l) => l.location.toLowerCase().includes(location))
      : filtered;

    return NextResponse.json({
      leads: locationFiltered,
      total: locationFiltered.length,
      query,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
