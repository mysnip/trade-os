import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { AppShell } from "@/components/app-shell";
import { authOptions } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeOS AI",
  description: "Trading intelligence for journaling, analytics and process improvement."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="de" className="dark">
      <body>
        <AppShell session={session}>{children}</AppShell>
      </body>
    </html>
  );
}
