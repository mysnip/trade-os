import type { TradeDirection, TradingSession } from "@prisma/client";

export type ImportField =
  | "broker"
  | "accountName"
  | "instrument"
  | "direction"
  | "entryTime"
  | "exitTime"
  | "entryPrice"
  | "exitPrice"
  | "quantity"
  | "grossPnl"
  | "netPnl"
  | "commission"
  | "fees"
  | "riskAmount"
  | "stopLoss"
  | "takeProfit"
  | "notes";

export type ColumnMapping = Partial<Record<ImportField, string>>;

export type RawImportRow = Record<string, string | number | boolean | null | undefined>;

export type NormalizedTradeInput = {
  broker?: string | null;
  accountName?: string | null;
  instrument: string;
  direction: TradeDirection;
  entryTime: Date;
  exitTime?: Date | null;
  entryPrice: number;
  exitPrice?: number | null;
  quantity: number;
  grossPnl?: number | null;
  netPnl: number;
  commission?: number | null;
  fees?: number | null;
  riskAmount?: number | null;
  rMultiple?: number | null;
  stopLoss?: number | null;
  takeProfit?: number | null;
  session: TradingSession;
  notes?: string | null;
  importedFrom?: string | null;
};

export type ValidationIssue = {
  rowIndex: number;
  field?: ImportField;
  message: string;
};

export const importFieldLabels: Record<ImportField, string> = {
  broker: "Broker",
  accountName: "Account",
  instrument: "Symbol / Instrument",
  direction: "Buy/Sell / Direction",
  entryTime: "Open Time / Entry Time",
  exitTime: "Close Time / Exit Time",
  entryPrice: "Open Price / Entry Price",
  exitPrice: "Close Price / Exit Price",
  quantity: "Quantity / Contracts",
  grossPnl: "Gross PnL",
  netPnl: "Net PnL / Profit",
  commission: "Commission",
  fees: "Fees",
  riskAmount: "Risk Amount",
  stopLoss: "Stop Loss",
  takeProfit: "Take Profit",
  notes: "Notes"
};

export const requiredImportFields: ImportField[] = [
  "instrument",
  "direction",
  "entryTime",
  "entryPrice",
  "quantity",
  "netPnl"
];
