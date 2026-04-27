import type { AnalyticsResult, MetricTrade } from "@/lib/analytics/metrics";
import { toNumber } from "@/lib/utils";

export type PatternFinding = {
  type: "loss_pattern" | "profitable_cluster" | "risk_behavior";
  title: string;
  summary: string;
  evidence: Record<string, unknown>;
  confidenceScore: number;
};

export function detectTradingPatterns(trades: MetricTrade[], metrics: AnalyticsResult): PatternFinding[] {
  const findings: PatternFinding[] = [];
  const losingSessions = metrics.pnlBySession.filter((session) => session.netPnl < 0 && session.trades >= 3);
  const profitableSetups = metrics.winrateBySetup.filter(
    (setup) => setup.key !== "Unassigned" && setup.netPnl > 0 && setup.expectancy > 0 && setup.trades >= 3
  );
  const largeLosses = trades.filter((trade) => toNumber(trade.rMultiple) <= -1.5 || toNumber(trade.netPnl) < metrics.averageLoss * 1.5);

  for (const session of losingSessions.slice(0, 2)) {
    findings.push({
      type: "loss_pattern",
      title: `${session.key} Session ist negativ`,
      summary: `${session.trades} Trades in dieser Session haben zusammen ${session.netPnl.toFixed(0)} PnL erzeugt.`,
      evidence: session,
      confidenceScore: Math.min(0.9, 0.45 + session.trades * 0.05)
    });
  }

  for (const setup of profitableSetups.slice(0, 3)) {
    findings.push({
      type: "profitable_cluster",
      title: `${setup.key} zeigt positiven Erwartungswert`,
      summary: `${setup.trades} Trades, ${setup.winrate.toFixed(1)}% Winrate, ${setup.expectancy.toFixed(2)} Expectancy.`,
      evidence: setup,
      confidenceScore: Math.min(0.92, 0.5 + setup.trades * 0.04)
    });
  }

  if (largeLosses.length >= 2) {
    findings.push({
      type: "risk_behavior",
      title: "Große Verlusttrades wiederholen sich",
      summary: `${largeLosses.length} Trades überschreiten -1.5R oder liegen deutlich unter deinem durchschnittlichen Verlust.`,
      evidence: {
        count: largeLosses.length,
        examples: largeLosses.slice(0, 5).map((trade) => ({
          instrument: trade.instrument,
          entryTime: trade.entryTime,
          netPnl: toNumber(trade.netPnl),
          rMultiple: toNumber(trade.rMultiple)
        }))
      },
      confidenceScore: 0.72
    });
  }

  return findings;
}
