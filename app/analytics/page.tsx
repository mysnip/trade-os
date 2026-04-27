import { AnalyticsCharts } from "@/components/analytics-charts";
import { KpiCard } from "@/components/kpi-card";
import { calculateAnalytics, type MetricTrade } from "@/lib/analytics/metrics";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default async function AnalyticsPage() {
  const userId = await requireUserId();
  const trades = await prisma.trade.findMany({
    where: { userId },
    include: { setup: { select: { name: true } } },
    orderBy: { entryTime: "asc" }
  });
  const metrics = calculateAnalytics(trades as unknown as MetricTrade[]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Performance, Setups, Sessions, Instrumente und Verhalten auf einen Blick.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Average Win" value={formatCurrency(metrics.averageWin)} />
        <KpiCard title="Average Loss" value={formatCurrency(metrics.averageLoss)} />
        <KpiCard title="Average R" value={metrics.averageR.toFixed(2)} />
        <KpiCard title="Best Instrument" value={metrics.bestInstrument?.key ?? "-"} detail={formatCurrency(metrics.bestInstrument?.netPnl ?? 0)} />
        <KpiCard title="Worst Hour" value={metrics.worstHour?.key ?? "-"} detail={formatCurrency(metrics.worstHour?.netPnl ?? 0)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Winrate" value={formatPercent(metrics.winrate)} />
        <KpiCard title="Profit Factor" value={metrics.profitFactor.toFixed(2)} />
        <KpiCard title="Expectancy" value={formatCurrency(metrics.expectancy)} />
        <KpiCard title="Best Weekday" value={metrics.bestWeekday?.key ?? "-"} detail={formatCurrency(metrics.bestWeekday?.netPnl ?? 0)} />
        <KpiCard title="Worst Instrument" value={metrics.worstInstrument?.key ?? "-"} detail={formatCurrency(metrics.worstInstrument?.netPnl ?? 0)} />
      </div>

      {metrics.tradeCount > 0 ? (
        <AnalyticsCharts metrics={metrics} />
      ) : (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          Noch keine Trades importiert.
        </div>
      )}
    </div>
  );
}
