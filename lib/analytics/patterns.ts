import type { AnalyticsResult, MetricTrade } from "@/lib/analytics/metrics";
import type { Locale } from "@/lib/i18n";
import { toNumber } from "@/lib/utils";

export type PatternFinding = {
  type: "loss_pattern" | "profitable_cluster" | "risk_behavior";
  title: string;
  summary: string;
  evidence: Record<string, unknown>;
  confidenceScore: number;
};

export function detectTradingPatterns(
  trades: MetricTrade[],
  metrics: AnalyticsResult,
  locale: Locale = "de"
): PatternFinding[] {
  const copy =
    locale === "en"
      ? {
          negativeSession: (session: string) => `${session} session is negative`,
          negativeSessionSummary: (tradesCount: number, pnl: number) =>
            `${tradesCount} trades in this session generated ${pnl.toFixed(0)} PnL together.`,
          positiveSetup: (setup: string) => `${setup} shows positive expectancy`,
          positiveSetupSummary: (tradesCount: number, winrate: number, expectancy: number) =>
            `${tradesCount} trades, ${winrate.toFixed(1)}% winrate, ${expectancy.toFixed(2)} expectancy.`,
          repeatedLargeLosses: "Large losing trades repeat",
          repeatedLargeLossesSummary: (count: number) =>
            `${count} trades exceed -1.5R or sit well below your average loss.`
        }
      : {
          negativeSession: (session: string) => `${session} Session ist negativ`,
          negativeSessionSummary: (tradesCount: number, pnl: number) =>
            `${tradesCount} Trades in dieser Session haben zusammen ${pnl.toFixed(0)} PnL erzeugt.`,
          positiveSetup: (setup: string) => `${setup} zeigt positiven Erwartungswert`,
          positiveSetupSummary: (tradesCount: number, winrate: number, expectancy: number) =>
            `${tradesCount} Trades, ${winrate.toFixed(1)}% Winrate, ${expectancy.toFixed(2)} Expectancy.`,
          repeatedLargeLosses: "Große Verlusttrades wiederholen sich",
          repeatedLargeLossesSummary: (count: number) =>
            `${count} Trades überschreiten -1.5R oder liegen deutlich unter deinem durchschnittlichen Verlust.`
        };
  const findings: PatternFinding[] = [];
  const losingSessions = metrics.pnlBySession.filter((session) => session.netPnl < 0 && session.trades >= 3);
  const profitableSetups = metrics.winrateBySetup.filter(
    (setup) => setup.key !== "Unassigned" && setup.netPnl > 0 && setup.expectancy > 0 && setup.trades >= 3
  );
  const largeLosses = trades.filter((trade) => toNumber(trade.rMultiple) <= -1.5 || toNumber(trade.netPnl) < metrics.averageLoss * 1.5);

  for (const session of losingSessions.slice(0, 2)) {
    findings.push({
      type: "loss_pattern",
      title: copy.negativeSession(session.key),
      summary: copy.negativeSessionSummary(session.trades, session.netPnl),
      evidence: session,
      confidenceScore: Math.min(0.9, 0.45 + session.trades * 0.05)
    });
  }

  for (const setup of profitableSetups.slice(0, 3)) {
    findings.push({
      type: "profitable_cluster",
      title: copy.positiveSetup(setup.key),
      summary: copy.positiveSetupSummary(setup.trades, setup.winrate, setup.expectancy),
      evidence: setup,
      confidenceScore: Math.min(0.92, 0.5 + setup.trades * 0.04)
    });
  }

  if (largeLosses.length >= 2) {
    findings.push({
      type: "risk_behavior",
      title: copy.repeatedLargeLosses,
      summary: copy.repeatedLargeLossesSummary(largeLosses.length),
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
