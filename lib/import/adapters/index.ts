import { genericCsvAdapter } from "@/lib/import/adapters/genericCsv";
import { ninjatraderAdapter } from "@/lib/import/adapters/ninjatrader";
import { tradovateAdapter } from "@/lib/import/adapters/tradovate";

export const importAdapters = [
  tradovateAdapter,
  ninjatraderAdapter,
  genericCsvAdapter,
  {
    id: "interactive-brokers",
    label: "Interactive Brokers",
    detect: () => false,
    suggestMapping: genericCsvAdapter.suggestMapping
  },
  {
    id: "metatrader-5",
    label: "MetaTrader 5",
    detect: () => false,
    suggestMapping: genericCsvAdapter.suggestMapping
  },
  {
    id: "tradingview",
    label: "TradingView Export",
    detect: () => false,
    suggestMapping: genericCsvAdapter.suggestMapping
  },
  {
    id: "rithmic-like",
    label: "Topstep/Apex/Rithmic-like",
    detect: () => false,
    suggestMapping: genericCsvAdapter.suggestMapping
  }
];

export function detectAdapter(headers: string[]) {
  return importAdapters.find((adapter) => adapter.detect(headers)) ?? genericCsvAdapter;
}
