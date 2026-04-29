import { AccountSelector } from "@/components/accounts/account-selector";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { KpiCard } from "@/components/kpi-card";
import { buildTradeAccountWhere, parseAccountIds } from "@/lib/accounts";
import { calculateAnalytics, type MetricTrade } from "@/lib/analytics/metrics";
import { getCurrentDictionary } from "@/lib/i18n-server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams?: { accountIds?: string | string[] };
}) {
  const userId = await requireUserId();
  const t = getCurrentDictionary();
  const selectedAccountIds = parseAccountIds(searchParams);
  const [trades, tradingAccounts] = await Promise.all([
    prisma.trade.findMany({
      where: buildTradeAccountWhere(userId, selectedAccountIds),
      include: { setup: { select: { name: true } } },
      orderBy: { entryTime: "asc" }
    }),
    prisma.tradingAccount.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    })
  ]);
  const metrics = calculateAnalytics(trades as unknown as MetricTrade[]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold">{t.analytics.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.analytics.subtitle}</p>
        </div>
        <AccountSelector
          accounts={tradingAccounts.map((account) => ({
            id: account.id,
            name: account.name,
            broker: account.broker,
            currency: account.currency
          }))}
          selectedAccountIds={selectedAccountIds}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard title={t.kpis.averageWin} value={formatCurrency(metrics.averageWin)} />
        <KpiCard title={t.kpis.averageLoss} value={formatCurrency(metrics.averageLoss)} />
        <KpiCard title={t.kpis.averageR} value={metrics.averageR.toFixed(2)} />
        <KpiCard title={t.kpis.bestInstrument} value={metrics.bestInstrument?.key ?? "-"} detail={formatCurrency(metrics.bestInstrument?.netPnl ?? 0)} />
        <KpiCard title={t.kpis.worstHour} value={metrics.worstHour?.key ?? "-"} detail={formatCurrency(metrics.worstHour?.netPnl ?? 0)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard title={t.kpis.winrate} value={formatPercent(metrics.winrate)} />
        <KpiCard title={t.kpis.profitFactor} value={metrics.profitFactor.toFixed(2)} />
        <KpiCard title={t.kpis.expectancy} value={formatCurrency(metrics.expectancy)} />
        <KpiCard title={t.kpis.bestWeekday} value={metrics.bestWeekday?.key ?? "-"} detail={formatCurrency(metrics.bestWeekday?.netPnl ?? 0)} />
        <KpiCard title={t.kpis.worstInstrument} value={metrics.worstInstrument?.key ?? "-"} detail={formatCurrency(metrics.worstInstrument?.netPnl ?? 0)} />
      </div>

      {metrics.tradeCount > 0 ? (
        <AnalyticsCharts metrics={metrics} />
      ) : (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          {t.analytics.noTrades}
        </div>
      )}
    </div>
  );
}
