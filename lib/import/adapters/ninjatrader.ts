import type { ColumnMapping } from "@/lib/import/types";

export const ninjatraderAdapter = {
  id: "ninjatrader",
  label: "NinjaTrader",
  detect(headers: string[]) {
    const joined = headers.join(" ").toLowerCase();
    return joined.includes("instrument") && joined.includes("entry") && joined.includes("exit");
  },
  suggestMapping(headers: string[]): ColumnMapping {
    const find = (names: string[]) =>
      headers.find((header) => names.some((name) => header.toLowerCase().includes(name)));
    return {
      instrument: find(["instrument"]),
      direction: find(["market pos", "direction", "action"]),
      entryTime: find(["entry time", "entry date"]),
      exitTime: find(["exit time", "exit date"]),
      entryPrice: find(["entry price"]),
      exitPrice: find(["exit price"]),
      quantity: find(["qty", "quantity"]),
      netPnl: find(["profit", "pnl"]),
      commission: find(["commission"])
    };
  }
};
