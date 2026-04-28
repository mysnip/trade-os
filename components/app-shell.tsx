"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Brain,
  LayoutDashboard,
  Library,
  LogOut,
  Settings,
  Table2,
  Upload
} from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { useI18n } from "@/components/i18n-provider";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/import", labelKey: "import", icon: Upload },
  { href: "/trades", labelKey: "trades", icon: Table2 },
  { href: "/analytics", labelKey: "analytics", icon: BarChart3 },
  { href: "/setups", labelKey: "setups", icon: Library },
  { href: "/insights", labelKey: "insights", icon: Brain },
  { href: "/settings", labelKey: "settings", icon: Settings }
] as const;

export function AppShell({
  children,
  session
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const { t } = useI18n();

  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background/85 backdrop-blur xl:block">
        <div className="flex h-full flex-col px-4 py-5">
          <Link href="/dashboard" className="mb-7 flex items-center gap-3 px-2">
            <BrandLogo markClassName="h-9 w-9" />
            <div>
              <div className="text-base font-semibold">Tradelyst</div>
              <div className="text-xs text-muted-foreground">{t.appShell.tagline}</div>
            </div>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground",
                    active && "bg-secondary text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.appShell.nav[item.labelKey]}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-md border bg-card p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{t.common.compliance}</p>
            <p className="mt-1">{t.appShell.compliance}</p>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b bg-background/88 backdrop-blur xl:ml-64">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3 xl:hidden">
            <BrandLogo markClassName="h-6 w-6" />
            <span className="font-semibold">Tradelyst</span>
          </div>
          <div className="hidden min-w-0 flex-1 gap-2 overflow-x-auto xl:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground",
                  pathname.startsWith(item.href) && "bg-secondary text-foreground"
                )}
              >
                {t.appShell.nav[item.labelKey]}
              </Link>
            ))}
          </div>
          {session?.user ? (
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <div className="hidden text-right text-sm sm:block">
                <div className="font-medium">{session.user.name ?? "Trader"}</div>
                <div className="text-xs text-muted-foreground">{session.user.email}</div>
              </div>
              <Button variant="outline" size="icon" title={t.appShell.logout} onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button asChild>
              <Link href="/login">{t.appShell.login}</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 xl:ml-64">{children}</main>
    </div>
  );
}
