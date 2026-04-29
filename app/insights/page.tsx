import { Brain, Sparkles } from "lucide-react";

import { generateInsightsAction } from "@/app/insights/actions";
import { AccountSelector } from "@/components/accounts/account-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAccountIds } from "@/lib/accounts";
import { getCurrentDictionary } from "@/lib/i18n-server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";

export default async function InsightsPage({
  searchParams
}: {
  searchParams?: { accountIds?: string | string[] };
}) {
  const userId = await requireUserId();
  const t = getCurrentDictionary();
  const selectedAccountIds = parseAccountIds(searchParams);
  const [insights, tradingAccounts] = await Promise.all([
    prisma.aIInsight.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30
    }),
    prisma.tradingAccount.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold">{t.insights.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.insights.subtitle}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <AccountSelector
            accounts={tradingAccounts.map((account) => ({
              id: account.id,
              name: account.name,
              broker: account.broker,
              currency: account.currency
            }))}
            selectedAccountIds={selectedAccountIds}
          />
          <form action={generateInsightsAction}>
            <input type="hidden" name="accountIds" value={selectedAccountIds.join(",")} />
            <Button type="submit">
              <Sparkles className="h-4 w-4" />
              {t.insights.generate}
            </Button>
          </form>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        {t.insights.compliance}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {insights.map((insight) => (
          <Card key={insight.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {insight.title}
              </CardTitle>
              <div className="text-xs uppercase text-muted-foreground">
                {insight.insightType} · {t.common.confidence} {Number(insight.confidenceScore).toFixed(2)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{insight.summary}</p>
              <div className="rounded-md border bg-background/50 p-3 text-sm">
                <div className="mb-1 font-medium">{t.insights.processImprovement}</div>
                <p className="text-muted-foreground">{insight.suggestedAction}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {insights.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            {t.insights.empty}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
