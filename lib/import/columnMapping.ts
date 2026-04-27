import type { ColumnMapping, ImportField } from "@/lib/import/types";

const aliases: Record<ImportField, string[]> = {
  broker: ["broker", "source"],
  accountName: ["account", "account name", "accountname"],
  instrument: ["symbol", "instrument", "contract", "ticker", "market"],
  direction: ["direction", "side", "buy/sell", "buy sell", "action", "trade type"],
  entryTime: ["open time", "entry time", "entry date", "open date", "entry datetime", "opened"],
  exitTime: ["close time", "exit time", "close date", "exit date", "closed"],
  entryPrice: ["open price", "entry price", "avg entry", "price in", "entry"],
  exitPrice: ["close price", "exit price", "avg exit", "price out", "exit"],
  quantity: ["quantity", "qty", "contracts", "shares", "size", "volume"],
  grossPnl: ["gross pnl", "gross p&l", "gross profit"],
  netPnl: ["net pnl", "net p&l", "profit", "pnl", "p&l", "realized pnl", "realized p&l"],
  commission: ["commission", "commissions"],
  fees: ["fees", "exchange fees", "nfa fees"],
  riskAmount: ["risk", "risk amount", "initial risk"],
  stopLoss: ["stop", "stop loss", "sl"],
  takeProfit: ["target", "take profit", "tp"],
  notes: ["note", "notes", "comment", "comments"]
};

function normalizeHeader(header: string) {
  return header.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

export function guessColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const normalizedHeaders = headers.map((header) => ({
    raw: header,
    normalized: normalizeHeader(header)
  }));

  for (const [field, fieldAliases] of Object.entries(aliases) as [ImportField, string[]][]) {
    const match = normalizedHeaders.find(({ normalized }) =>
      fieldAliases.some((alias) => normalized === alias || normalized.includes(alias))
    );
    if (match) mapping[field] = match.raw;
  }

  return mapping;
}
