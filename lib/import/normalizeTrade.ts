import { TradeDirection } from "@prisma/client";

import { detectSession } from "@/lib/import/session";
import type { ColumnMapping, NormalizedTradeInput, RawImportRow } from "@/lib/import/types";
import { toNumber } from "@/lib/utils";

function getValue(row: RawImportRow, column?: string) {
  if (!column) return undefined;
  return row[column];
}

function text(value: unknown) {
  if (value === null || value === undefined) return undefined;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
}

function parseDate(value: unknown) {
  const raw = text(value);
  if (!raw) return null;
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const european = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})(.*)$/);
  if (european) {
    const [, day, month, year, rest] = european;
    const fullYear = year.length === 2 ? `20${year}` : year;
    const candidate = new Date(`${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}${rest}`);
    if (!Number.isNaN(candidate.getTime())) return candidate;
  }

  return null;
}

function parseDirection(value: unknown) {
  const raw = text(value)?.toLowerCase();
  if (!raw) return null;
  if (["long", "buy", "b", "bot", "bullish"].some((token) => raw.includes(token))) {
    return TradeDirection.LONG;
  }
  if (["short", "sell", "s", "sold", "bearish"].some((token) => raw.includes(token))) {
    return TradeDirection.SHORT;
  }
  return null;
}

export function normalizeTrade(
  row: RawImportRow,
  mapping: ColumnMapping,
  importedFrom: string
): Partial<NormalizedTradeInput> {
  const entryTime = parseDate(getValue(row, mapping.entryTime));
  const exitTime = parseDate(getValue(row, mapping.exitTime));
  const direction = parseDirection(getValue(row, mapping.direction));
  const commission = mapping.commission ? toNumber(getValue(row, mapping.commission)) : undefined;
  const fees = mapping.fees ? toNumber(getValue(row, mapping.fees)) : undefined;
  const grossPnl = mapping.grossPnl ? toNumber(getValue(row, mapping.grossPnl)) : undefined;
  const riskAmount = mapping.riskAmount ? Math.abs(toNumber(getValue(row, mapping.riskAmount))) : undefined;
  const netPnl = toNumber(getValue(row, mapping.netPnl));

  return {
    broker: text(getValue(row, mapping.broker)),
    accountName: text(getValue(row, mapping.accountName)),
    instrument: text(getValue(row, mapping.instrument))?.toUpperCase(),
    direction: direction ?? undefined,
    entryTime: entryTime ?? undefined,
    exitTime,
    entryPrice: toNumber(getValue(row, mapping.entryPrice)),
    exitPrice: mapping.exitPrice ? toNumber(getValue(row, mapping.exitPrice)) : undefined,
    quantity: Math.abs(toNumber(getValue(row, mapping.quantity), 1)),
    grossPnl,
    netPnl,
    commission,
    fees,
    riskAmount,
    rMultiple: riskAmount && riskAmount > 0 ? netPnl / riskAmount : undefined,
    stopLoss: mapping.stopLoss ? toNumber(getValue(row, mapping.stopLoss)) : undefined,
    takeProfit: mapping.takeProfit ? toNumber(getValue(row, mapping.takeProfit)) : undefined,
    session: entryTime ? detectSession(entryTime) : undefined,
    notes: text(getValue(row, mapping.notes)),
    importedFrom
  };
}
