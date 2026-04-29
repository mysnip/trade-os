import Link from "next/link";

import { AccountSelector } from "@/components/accounts/account-selector";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { ComplianceNote } from "@/components/compliance-note";
import { KpiCard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildInsightAccountWhere, buildTradeAccountWhere, parseAccountIds } from "@/lib/accounts";
import { calculateAnalytics, type MetricTrade } from "@/lib/analytics/metrics";
import { detectTradingPatterns } from "@/lib/analytics/patterns";
import { getCurrentDictionary, getCurrentLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: { accountIds?: string | string[] };
}) {
  const userId = await requireUserId();
  const t = getCurrentDictionary();
  const locale = getCurrentLocale();
  const selectedAccountIds = parseAccountIds(searchParams);
  const trades = await prisma.trade.findMany({
    where: buildTradeAccountWhere(userId, selectedAccountIds),
    include: { setup: { select: { name: true } } },
    orderBy: { entryTime: "asc" }
  });
  const tradingAccounts = await prisma.tradingAccount.findMany({
    where: { userId },
    orderBy: { name: "asc" }
  });
  const insights = await prisma.aIInsight.findMany({
    where: buildInsightAccountWhere(userId, selectedAccountIds),
    orderBy: { createdAt: "desc" },
    take: 3
  });
  const metrics = calculateAnalytics(trades as unknown as MetricTrade[]);
  const patterns = detectTradingPatterns(trades as unknown as MetricTrade[], metrics, locale);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold">{t.dashboard.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <AccountSelector
            accounts={tradingAccounts.map((account) => ({
              id: account.id,
              name: account.name,
              broker: account.broker,
              currency: account.currency
            }))}
            selectedAccountIds={selectedAccountIds}
          />
          <Button asChild>
            <Link href="/import">{t.dashboard.importTrades}</Link>
          </Button>
        </div>
      </div>

      <ComplianceNote />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard title={t.kpis.netPnl} value={formatCurrency(metrics.netPnl)} />
        <KpiCard title={t.kpis.winrate} value={formatPercent(metrics.winrate)} />
        <KpiCard title={t.kpis.profitFactor} value={metrics.profitFactor.toFixed(2)} />
        <KpiCard title={t.kpis.expectancy} value={formatCurrency(metrics.expectancy)} />
        <KpiCard title={t.kpis.trades} value={String(metrics.tradeCount)} />
        <KpiCard title={t.kpis.maxDrawdown} value={formatCurrency(metrics.maxDrawdown)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t.dashboard.aiSummary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.length > 0 ? (
              insights.map((insight) => (
                <div key={insight.id} className="rounded-md border p-3">
                  <div className="font-medium">{insight.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{insight.summary}</p>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">{t.dashboard.noInsights}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.patterns}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patterns.length > 0 ? (
              patterns.slice(0, 4).map((pattern) => (
                <div key={pattern.title} className="rounded-md border p-3">
                  <div className="text-sm font-medium">{pattern.title}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{pattern.summary}</p>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">{t.dashboard.noPatterns}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {metrics.tradeCount > 0 ? <AnalyticsCharts metrics={metrics} /> : null}
    </div>
  );
}
