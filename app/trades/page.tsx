import { TradeTable, type TradeRow } from "@/components/trades/trade-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";
import { toNumber } from "@/lib/utils";

export default async function TradesPage() {
  const userId = await requireUserId();
  const [trades, setups] = await Promise.all([
    prisma.trade.findMany({
      where: { userId },
      include: { setup: { select: { id: true, name: true } } },
      orderBy: { entryTime: "desc" }
    }),
    prisma.setup.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    })
  ]);

  const rows: TradeRow[] = trades.map((trade) => ({
    id: trade.id,
    instrument: trade.instrument,
    direction: trade.direction,
    entryTime: trade.entryTime.toISOString(),
    exitTime: trade.exitTime?.toISOString() ?? null,
    entryPrice: toNumber(trade.entryPrice),
    exitPrice: trade.exitPrice ? toNumber(trade.exitPrice) : null,
    quantity: toNumber(trade.quantity),
    netPnl: toNumber(trade.netPnl),
    broker: trade.broker,
    accountName: trade.accountName,
    grossPnl: trade.grossPnl ? toNumber(trade.grossPnl) : null,
    commission: trade.commission ? toNumber(trade.commission) : null,
    fees: trade.fees ? toNumber(trade.fees) : null,
    riskAmount: trade.riskAmount ? toNumber(trade.riskAmount) : null,
    rMultiple: trade.rMultiple ? toNumber(trade.rMultiple) : null,
    stopLoss: trade.stopLoss ? toNumber(trade.stopLoss) : null,
    takeProfit: trade.takeProfit ? toNumber(trade.takeProfit) : null,
    session: trade.session,
    setupId: trade.setupId,
    setupName: trade.setup?.name ?? null,
    notes: trade.notes,
    emotionBefore: trade.emotionBefore,
    emotionAfter: trade.emotionAfter,
    mistakeTags: trade.mistakeTags,
    screenshotUrl: trade.screenshotUrl,
    importedFrom: trade.importedFrom
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Trade Journal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Filtere, tagge und dokumentiere deine Trades ohne Trade-Signale oder Anlageberatung.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <TradeTable
            trades={rows}
            setups={setups.map((setup) => ({
              id: setup.id,
              name: setup.name
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
