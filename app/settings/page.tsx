import { AccountManagement } from "@/components/accounts/account-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TradovateSettings } from "@/components/settings/tradovate-settings";
import { getCurrentDictionary, getCurrentLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";

export default async function SettingsPage({
  searchParams
}: {
  searchParams?: { tradovate?: string };
}) {
  const userId = await requireUserId();
  const t = getCurrentDictionary();
  const locale = getCurrentLocale();
  const [tradovateConnection, tradingAccounts] = await Promise.all([
    loadTradovateConnection(userId),
    loadTradingAccounts(userId)
  ]);
  const tradovateNotice = getTradovateNotice(searchParams?.tradovate, t);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.settings.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      {tradovateNotice ? (
        <div className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
          {tradovateNotice}
        </div>
      ) : null}

      <AccountManagement accounts={tradingAccounts} />

      <TradovateSettings connection={tradovateConnection} copy={t.tradovate} locale={locale} neverLabel={t.common.never} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.account}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label>{t.settings.name}</Label>
              <Input placeholder="Demo Trader" />
            </div>
            <div className="space-y-2">
              <Label>{t.settings.timezone}</Label>
              <Select defaultValue="Europe/Berlin">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.settings.currency}</Label>
              <Select defaultValue="USD">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.settings.brokerAutomation}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-md border p-3">
              {t.settings.brokerText1}
            </div>
            <div className="rounded-md border p-3">
              {t.settings.brokerText2}
            </div>
            <div className="rounded-md border p-3">
              {t.settings.brokerText3}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.settings.risk}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label>{t.settings.standardRisk}</Label>
              <Input type="number" placeholder="250" />
            </div>
            <div className="space-y-2">
              <Label>{t.settings.maxDailyLoss}</Label>
              <Input type="number" placeholder="1000" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.common.compliance}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{t.settings.compliance1}</p>
            <p>{t.settings.compliance2}</p>
            <p>{t.settings.compliance3}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function loadTradovateConnection(userId: string) {
  try {
    return await prisma.brokerConnection.findFirst({
      where: { userId, provider: "TRADOVATE" },
      include: {
        accounts: { orderBy: { name: "asc" } },
        syncJobs: { orderBy: { startedAt: "desc" }, take: 5 }
      }
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function loadTradingAccounts(userId: string) {
  const accounts = await prisma.tradingAccount.findMany({
    where: { userId },
    include: {
      _count: {
        select: { trades: true }
      }
    },
    orderBy: { name: "asc" }
  });

  return accounts.map((account) => ({
    id: account.id,
    name: account.name,
    broker: account.broker,
    currency: account.currency,
    tradeCount: account._count.trades
  }));
}

function getTradovateNotice(status: string | undefined, t: ReturnType<typeof getCurrentDictionary>) {
  if (status === "missing-config") {
    return t.settings.notices.missingConfig;
  }
  if (status === "connected") return t.settings.notices.connected;
  if (status === "error") return t.settings.notices.error;
  return null;
}
