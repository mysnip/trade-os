import type { NormalizedTradeInput, ValidationIssue } from "@/lib/import/types";

export function validateTrade(
  trade: Partial<NormalizedTradeInput>,
  rowIndex: number
): { valid: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (!trade.instrument) issues.push({ rowIndex, field: "instrument", message: "Instrument fehlt." });
  if (!trade.direction) issues.push({ rowIndex, field: "direction", message: "Direction fehlt oder ist unklar." });
  if (!trade.entryTime) issues.push({ rowIndex, field: "entryTime", message: "Entry Time fehlt oder ist ungültig." });
  if (!trade.entryPrice || trade.entryPrice <= 0) {
    issues.push({ rowIndex, field: "entryPrice", message: "Entry Price fehlt oder ist ungültig." });
  }
  if (!trade.quantity || trade.quantity <= 0) {
    issues.push({ rowIndex, field: "quantity", message: "Quantity fehlt oder ist ungültig." });
  }
  if (trade.netPnl === undefined || trade.netPnl === null || Number.isNaN(trade.netPnl)) {
    issues.push({ rowIndex, field: "netPnl", message: "Net PnL fehlt oder ist ungültig." });
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
