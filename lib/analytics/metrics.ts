import { format, getDay, getHours } from "date-fns";

import { toNumber } from "@/lib/utils";

export type MetricTrade = {
  id: string;
  instrument: string;
  direction: "LONG" | "SHORT";
  entryTime: Date;
  netPnl: unknown;
  grossPnl?: unknown;
  commission?: unknown;
  fees?: unknown;
  riskAmount?: unknown;
  rMultiple?: unknown;
  session: "ASIA" | "LONDON" | "NEW_YORK" | "OTHER";
  setup?: { name: string } | null;
  mistakeTags?: string[];
};

export type AnalyticsResult = {
  tradeCount: number;
  netPnl: number;
  wins: number;
  losses: number;
  winrate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  expectancy: number;
  maxDrawdown: number;
  averageR: number;
  bestInstrument?: GroupMetric;
  worstInstrument?: GroupMetric;
  bestWeekday?: GroupMetric;
  worstWeekday?: GroupMetric;
  bestHour?: GroupMetric;
  worstHour?: GroupMetric;
  equityCurve: Array<{ label: string; pnl: number; equity: number }>;
  pnlByInstrument: GroupMetric[];
  pnlByWeekday: GroupMetric[];
  pnlByHour: GroupMetric[];
  pnlBySession: GroupMetric[];
  pnlByDirection: GroupMetric[];
  winrateBySetup: GroupMetric[];
  rDistribution: GroupMetric[];
};

export type GroupMetric = {
  key: string;
  trades: number;
  netPnl: number;
  winrate: number;
  expectancy: number;
};

const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

function groupBy<T>(items: T[], keyFn: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = keyFn(item);
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}

function toGroupMetrics(groups: Record<string, MetricTrade[]>) {
  return Object.entries(groups)
    .map(([key, trades]) => {
      const pnls = trades.map((trade) => toNumber(trade.netPnl));
      const wins = pnls.filter((pnl) => pnl > 0);
      const netPnl = pnls.reduce((sum, pnl) => sum + pnl, 0);
      return {
        key,
        trades: trades.length,
        netPnl,
        winrate: trades.length ? (wins.length / trades.length) * 100 : 0,
        expectancy: trades.length ? netPnl / trades.length : 0
      };
    })
    .sort((a, b) => b.netPnl - a.netPnl);
}

function calculateMaxDrawdown(equityValues: number[]) {
  let peak = 0;
  let maxDrawdown = 0;
  for (const equity of equityValues) {
    peak = Math.max(peak, equity);
    maxDrawdown = Math.min(maxDrawdown, equity - peak);
  }
  return Math.abs(maxDrawdown);
}

export function calculateAnalytics(trades: MetricTrade[]): AnalyticsResult {
  const sortedTrades = [...trades].sort((a, b) => a.entryTime.getTime() - b.entryTime.getTime());
  const pnls = sortedTrades.map((trade) => toNumber(trade.netPnl));
  const wins = pnls.filter((pnl) => pnl > 0);
  const losses = pnls.filter((pnl) => pnl < 0);
  const netPnl = pnls.reduce((sum, pnl) => sum + pnl, 0);
  const grossProfit = wins.reduce((sum, pnl) => sum + pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, pnl) => sum + pnl, 0));
  let running = 0;
  const equityCurve = sortedTrades.map((trade) => {
    running += toNumber(trade.netPnl);
    return {
      label: format(trade.entryTime, "MMM d"),
      pnl: toNumber(trade.netPnl),
      equity: Number(running.toFixed(2))
    };
  });

  const pnlByInstrument = toGroupMetrics(groupBy(sortedTrades, (trade) => trade.instrument));
  const pnlByWeekday = toGroupMetrics(groupBy(sortedTrades, (trade) => weekdays[getDay(trade.entryTime)]));
  const pnlByHour = toGroupMetrics(groupBy(sortedTrades, (trade) => `${getHours(trade.entryTime).toString().padStart(2, "0")}:00`));
  const pnlBySession = toGroupMetrics(groupBy(sortedTrades, (trade) => trade.session));
  const pnlByDirection = toGroupMetrics(groupBy(sortedTrades, (trade) => trade.direction));
  const winrateBySetup = toGroupMetrics(groupBy(sortedTrades, (trade) => trade.setup?.name ?? "Unassigned"));
  const rDistribution = toGroupMetrics(
    groupBy(sortedTrades, (trade) => {
      const r = toNumber(trade.rMultiple);
      if (r <= -2) return "<= -2R";
      if (r < -1) return "-2R bis -1R";
      if (r < 0) return "-1R bis 0";
      if (r < 1) return "0 bis 1R";
      if (r < 2) return "1R bis 2R";
      return ">= 2R";
    })
  );

  return {
    tradeCount: sortedTrades.length,
    netPnl,
    wins: wins.length,
    losses: losses.length,
    winrate: sortedTrades.length ? (wins.length / sortedTrades.length) * 100 : 0,
    averageWin: wins.length ? grossProfit / wins.length : 0,
    averageLoss: losses.length ? losses.reduce((sum, pnl) => sum + pnl, 0) / losses.length : 0,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0,
    expectancy: sortedTrades.length ? netPnl / sortedTrades.length : 0,
    maxDrawdown: calculateMaxDrawdown(equityCurve.map((point) => point.equity)),
    averageR: sortedTrades.length
      ? sortedTrades.reduce((sum, trade) => sum + toNumber(trade.rMultiple), 0) / sortedTrades.length
      : 0,
    bestInstrument: pnlByInstrument[0],
    worstInstrument: pnlByInstrument[pnlByInstrument.length - 1],
    bestWeekday: pnlByWeekday[0],
    worstWeekday: pnlByWeekday[pnlByWeekday.length - 1],
    bestHour: pnlByHour[0],
    worstHour: pnlByHour[pnlByHour.length - 1],
    equityCurve,
    pnlByInstrument,
    pnlByWeekday,
    pnlByHour,
    pnlBySession,
    pnlByDirection,
    winrateBySetup,
    rDistribution
  };
}
