import { TradingSession } from "@prisma/client";

export function detectSession(entryTime: Date) {
  const hour = entryTime.getUTCHours();

  if (hour >= 0 && hour < 7) return TradingSession.ASIA;
  if (hour >= 7 && hour < 12) return TradingSession.LONDON;
  if (hour >= 12 && hour < 21) return TradingSession.NEW_YORK;
  return TradingSession.OTHER;
}
