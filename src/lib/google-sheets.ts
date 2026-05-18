import { Lead } from "@/types";

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

export async function appendLeadsToSheet(
  leads: Lead[],
  spreadsheetId: string,
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<{ updatedRows: number }> {
  const token = await getAccessToken(clientId, clientSecret, refreshToken);

  const values = leads.map((lead) => [
    lead.id,
    lead.name,
    lead.handle,
    lead.bio.slice(0, 200),
    lead.followers,
    lead.location,
    lead.email,
    lead.company,
    lead.source,
    lead.score,
    lead.status,
    lead.tags.join(", "),
    lead.createdAt,
    lead.notes,
  ]);

  const headerCheck = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:N1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const headerData = await headerCheck.json();
  if (!headerData.values || headerData.values.length === 0) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:N1?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [
            [
              "ID",
              "Name",
              "Handle",
              "Bio",
              "Followers",
              "Location",
              "Email",
              "Company",
              "Source",
              "Lead Score",
              "Status",
              "Tags",
              "Created At",
              "Notes",
            ],
          ],
        }),
      }
    );
  }

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:N:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!appendRes.ok) {
    const err = await appendRes.json().catch(() => ({}));
    throw new Error(`Google Sheets error: ${err?.error?.message || appendRes.statusText}`);
  }

  return { updatedRows: values.length };
}
