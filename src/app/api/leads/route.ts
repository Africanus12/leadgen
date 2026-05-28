import { NextRequest, NextResponse } from "next/server";
import { getLeads, addLeads, updateLead, deleteLead } from "@/lib/store";
import type { Lead } from "@/types";

export async function GET() {
  return NextResponse.json({ leads: getLeads() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newLeads: Lead[] = body.leads || [];
    if (newLeads.length === 0) {
      return NextResponse.json({ error: "No leads provided" }, { status: 400 });
    }
    const all = addLeads(newLeads);
    return NextResponse.json({ leads: all, added: newLeads.length });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates } = body;
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    const updated = updateLead(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json({ lead: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    const removed = deleteLead(id);
    if (!removed) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
