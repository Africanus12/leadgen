import { NextRequest, NextResponse } from "next/server";
import { sendFollowUpEmail } from "@/lib/email";
import { getCompanyProfile } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leads } = body;

    if (!leads || leads.length === 0) {
      return NextResponse.json(
        { error: "No leads to send" },
        { status: 400 }
      );
    }

    const recipientEmail = process.env.NOTIFICATION_EMAIL || "";
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPass = process.env.SMTP_PASS || "";

    if (!recipientEmail || !smtpUser || !smtpPass) {
      return NextResponse.json(
        {
          error:
            "Email configuration incomplete. Set NOTIFICATION_EMAIL, SMTP_USER, and SMTP_PASS in Settings or as environment variables.",
        },
        { status: 401 }
      );
    }

    const company = getCompanyProfile();
    const result = await sendFollowUpEmail(leads, company, recipientEmail, {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      pass: smtpPass,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Email failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
