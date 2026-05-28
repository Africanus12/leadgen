import { NextRequest, NextResponse } from "next/server";
import { getCompanyProfile, updateCompanyProfile } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ company: getCompanyProfile() });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateCompanyProfile(body);
    return NextResponse.json({ company: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
