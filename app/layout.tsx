import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { AppShell } from "@/components/app-shell";
import { I18nProvider } from "@/components/i18n-provider";
import { authOptions } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/i18n-server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tradelyst",
  description: "Trade journal intelligence for structured tracking, analytics and process improvement."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const locale = getCurrentLocale();

  return (
    <html lang={locale} className="dark">
      <body>
        <I18nProvider initialLocale={locale}>
          <AppShell session={session}>{children}</AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
