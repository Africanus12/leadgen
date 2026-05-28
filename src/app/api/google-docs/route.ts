import { NextRequest, NextResponse } from "next/server";
import { createLeadReport } from "@/lib/google-docs";
import { getCompanyProfile } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leads } = body;

    if (!leads || leads.length === 0) {
      return NextResponse.json(
        { error: "No leads to export" },
        { status: 400 }
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || "";
    const docId = process.env.GOOGLE_DOC_ID || "";

    if (!clientId || !clientSecret || !refreshToken || !docId) {
      return NextResponse.json(
        {
          error:
            "Google API credentials not configured. Set them in Settings or as environment variables.",
        },
        { status: 401 }
      );
    }

    const company = getCompanyProfile();
    const result = await createLeadReport(
      leads,
      company,
      docId,
      clientId,
      clientSecret,
      refreshToken
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
