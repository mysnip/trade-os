import type { ColumnMapping } from "@/lib/import/types";

export const tradovateAdapter = {
  id: "tradovate",
  label: "Tradovate",
  detect(headers: string[]) {
    const joined = headers.join(" ").toLowerCase();
    return joined.includes("contract") && (joined.includes("p/l") || joined.includes("pnl"));
  },
  suggestMapping(headers: string[]): ColumnMapping {
    const find = (names: string[]) =>
      headers.find((header) => names.some((name) => header.toLowerCase().includes(name)));
    return {
      instrument: find(["contract", "symbol"]),
      direction: find(["side", "buysell", "buy/sell"]),
      entryTime: find(["open time", "entry"]),
      exitTime: find(["close time", "exit"]),
      entryPrice: find(["avg price", "entry price"]),
      exitPrice: find(["exit price", "close price"]),
      quantity: find(["qty", "quantity"]),
      netPnl: find(["p/l", "pnl", "profit"]),
      commission: find(["commission"]),
      fees: find(["fees"])
    };
  }
};
