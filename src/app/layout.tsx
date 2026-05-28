import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "LeadGen — Twitter Lead Scraper",
  description: "Scrape Twitter leads, export to Google Sheets/Docs, and send follow-up emails.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto">
          <div className="max-w-6xl mx-auto p-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
