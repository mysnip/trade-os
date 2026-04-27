import { createSetupAction } from "@/app/setups/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { calculateAnalytics, type MetricTrade } from "@/lib/analytics/metrics";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default async function SetupsPage() {
  const userId = await requireUserId();
  const setups = await prisma.setup.findMany({
    where: { userId },
    include: {
      trades: {
        include: { setup: { select: { name: true } } },
        orderBy: { entryTime: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Setup Library</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Definiere Playbooks, ordne Trades zu und prüfe, welche Setups echten Erwartungswert haben.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Setup anlegen</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createSetupAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="iFVG Retest" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea id="description" name="description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketConditions">Market Conditions</Label>
                <Textarea id="marketConditions" name="marketConditions" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryCriteria">Entry Criteria</Label>
                <Textarea id="entryCriteria" name="entryCriteria" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exitCriteria">Exit Criteria</Label>
                <Textarea id="exitCriteria" name="exitCriteria" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invalidationCriteria">Invalidation</Label>
                <Textarea id="invalidationCriteria" name="invalidationCriteria" />
              </div>
              <Button type="submit">Setup speichern</Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {setups.map((setup) => {
            const metrics = calculateAnalytics(setup.trades as unknown as MetricTrade[]);
            return (
              <Card key={setup.id}>
                <CardHeader>
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <CardTitle>{setup.name}</CardTitle>
                      <p className="mt-2 text-sm text-muted-foreground">{setup.description}</p>
                    </div>
                    <Badge variant={metrics.expectancy >= 0 ? "default" : "destructive"}>
                      {formatCurrency(metrics.expectancy)} Expectancy
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-md border p-3">
                      <div className="text-sm text-muted-foreground">Trades</div>
                      <div className="text-lg font-semibold">{metrics.tradeCount}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-sm text-muted-foreground">Net PnL</div>
                      <div className="text-lg font-semibold">{formatCurrency(metrics.netPnl)}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-sm text-muted-foreground">Winrate</div>
                      <div className="text-lg font-semibold">{formatPercent(metrics.winrate)}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-sm text-muted-foreground">Profit Factor</div>
                      <div className="text-lg font-semibold">{metrics.profitFactor.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm md:grid-cols-3">
                    <p><span className="text-muted-foreground">Entry:</span> {setup.entryCriteria || "-"}</p>
                    <p><span className="text-muted-foreground">Exit:</span> {setup.exitCriteria || "-"}</p>
                    <p><span className="text-muted-foreground">Invalidation:</span> {setup.invalidationCriteria || "-"}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
