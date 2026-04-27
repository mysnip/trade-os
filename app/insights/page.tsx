import { Brain, Sparkles } from "lucide-react";

import { generateInsightsAction } from "@/app/insights/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";

export default async function InsightsPage() {
  const userId = await requireUserId();
  const insights = await prisma.aIInsight.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold">AI Insights</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Erkennt wiederkehrende Fehler, profitable Cluster und Prozessmuster aus vergangenen Trades.
          </p>
        </div>
        <form action={generateInsightsAction}>
          <Button type="submit">
            <Sparkles className="h-4 w-4" />
            Insights generieren
          </Button>
        </form>
      </div>

      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        Keine Kauf-/Verkaufsempfehlungen. Die AI analysiert ausschließlich historische Performance,
        Verhalten, Setups und Risikoprozesse.
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
                {insight.insightType} · Confidence {Number(insight.confidenceScore).toFixed(2)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{insight.summary}</p>
              <div className="rounded-md border bg-background/50 p-3 text-sm">
                <div className="mb-1 font-medium">Prozess-Verbesserung</div>
                <p className="text-muted-foreground">{insight.suggestedAction}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {insights.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Noch keine Insights gespeichert. Importiere Trades und starte die Analyse.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
