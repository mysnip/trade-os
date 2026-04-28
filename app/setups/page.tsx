import { createSetupAction } from "@/app/setups/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { calculateAnalytics, type MetricTrade } from "@/lib/analytics/metrics";
import { getCurrentDictionary } from "@/lib/i18n-server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default async function SetupsPage() {
  const userId = await requireUserId();
  const t = getCurrentDictionary();
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
        <h1 className="text-2xl font-semibold">{t.setups.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.setups.subtitle}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t.setups.create}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createSetupAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.setups.name}</Label>
                <Input id="name" name="name" placeholder="iFVG Retest" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.setups.description}</Label>
                <Textarea id="description" name="description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketConditions">{t.setups.marketConditions}</Label>
                <Textarea id="marketConditions" name="marketConditions" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryCriteria">{t.setups.entryCriteria}</Label>
                <Textarea id="entryCriteria" name="entryCriteria" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exitCriteria">{t.setups.exitCriteria}</Label>
                <Textarea id="exitCriteria" name="exitCriteria" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invalidationCriteria">{t.setups.invalidation}</Label>
                <Textarea id="invalidationCriteria" name="invalidationCriteria" />
              </div>
              <Button type="submit">{t.setups.save}</Button>
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
                      {formatCurrency(metrics.expectancy)} {t.setups.expectancy}
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
                    <p><span className="text-muted-foreground">{t.setups.entry}:</span> {setup.entryCriteria || "-"}</p>
                    <p><span className="text-muted-foreground">{t.setups.exit}:</span> {setup.exitCriteria || "-"}</p>
                    <p><span className="text-muted-foreground">{t.setups.invalidation}:</span> {setup.invalidationCriteria || "-"}</p>
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
