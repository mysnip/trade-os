import OpenAI from "openai";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { calculateAnalytics, type MetricTrade } from "@/lib/analytics/metrics";
import { detectTradingPatterns } from "@/lib/analytics/patterns";
import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type DateRange = {
  from?: Date;
  to?: Date;
};

const aiInsightSchema = z.object({
  insights: z.array(
    z.object({
      insightType: z.enum(["mistake", "profitable_pattern", "market_condition", "behavior", "process"]),
      title: z.string().min(3),
      summary: z.string().min(10),
      evidence: z.record(z.unknown()),
      suggestedAction: z.string().min(10),
      confidenceScore: z.number().min(0).max(1)
    })
  )
});

type GeneratedInsight = z.infer<typeof aiInsightSchema>["insights"][number];

const jsonSchema = {
  name: "trading_insights",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      insights: {
        type: "array",
        minItems: 1,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            insightType: {
              type: "string",
              enum: ["mistake", "profitable_pattern", "market_condition", "behavior", "process"]
            },
            title: { type: "string" },
            summary: { type: "string" },
            evidence: { type: "object", additionalProperties: true },
            suggestedAction: { type: "string" },
            confidenceScore: { type: "number", minimum: 0, maximum: 1 }
          },
          required: ["insightType", "title", "summary", "evidence", "suggestedAction", "confidenceScore"]
        }
      }
    },
    required: ["insights"]
  }
};

function fallbackInsights(trades: MetricTrade[], locale: Locale): GeneratedInsight[] {
  const metrics = calculateAnalytics(trades);
  const patterns = detectTradingPatterns(trades, metrics, locale);

  if (patterns.length === 0) {
    const emptyCopy =
      locale === "en"
        ? {
            title: "More data improves the analysis",
            summary: "There are not enough trades yet to separate robust patterns with confidence.",
            suggestedAction: "Import more trades and tag setups consistently before deriving decisions from patterns."
          }
        : {
            title: "Mehr Daten verbessern die Analyse",
            summary: "Es sind noch nicht genug Trades vorhanden, um robuste Muster sicher zu unterscheiden.",
            suggestedAction: "Importiere weitere Trades und tagge Setups konsequent, bevor du Entscheidungen aus Mustern ableitest."
          };
    return [
      {
        insightType: "process" as const,
        title: emptyCopy.title,
        summary: emptyCopy.summary,
        evidence: { tradeCount: metrics.tradeCount },
        suggestedAction: emptyCopy.suggestedAction,
        confidenceScore: 0.55
      }
    ];
  }

  return patterns.slice(0, 5).map((pattern) => ({
    insightType:
      pattern.type === "profitable_cluster"
        ? ("profitable_pattern" as const)
        : pattern.type === "risk_behavior"
          ? ("behavior" as const)
          : ("mistake" as const),
    title: pattern.title,
    summary: pattern.summary,
    evidence: pattern.evidence,
    suggestedAction:
      locale === "en"
        ? pattern.type === "profitable_cluster"
          ? "Keep testing this setup in isolation and document entry, exit, and invalidation criteria cleanly."
          : "Reduce size or pause this pattern temporarily until you define clear process rules."
        : pattern.type === "profitable_cluster"
          ? "Teste dieses Setup isoliert weiter und dokumentiere Entry-, Exit- und Invalidation-Kriterien sauber."
          : "Reduziere die Positionsgröße oder pausiere dieses Muster testweise, bis du klare Prozessregeln definiert hast.",
    confidenceScore: pattern.confidenceScore
  }));
}

export async function generateTradingInsights(
  userId: string,
  dateRange?: DateRange,
  locale: Locale = "de",
  accountIds: string[] = []
) {
  const trades = await prisma.trade.findMany({
    where: {
      userId,
      ...(accountIds.length > 0 ? { tradingAccountId: { in: accountIds } } : {}),
      ...(dateRange?.from || dateRange?.to
        ? {
            entryTime: {
              gte: dateRange.from,
              lte: dateRange.to
            }
          }
        : {})
    },
    include: { setup: { select: { name: true } } },
    orderBy: { entryTime: "asc" }
  });

  const metricTrades = trades as unknown as MetricTrade[];
  const metrics = calculateAnalytics(metricTrades);
  const deterministicPatterns = detectTradingPatterns(metricTrades, metrics, locale);
  let insights: GeneratedInsight[] = fallbackInsights(metricTrades, locale);

  if (process.env.OPENAI_API_KEY && trades.length >= 3) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      response_format: {
        type: "json_schema",
        json_schema: jsonSchema
      },
      messages: [
        {
          role: "system",
          content:
            "You analyze a trader's historical trade journal. You must not provide buy/sell signals, trade calls, price predictions, or investment advice. Only discuss past performance, behavior, setup quality, risk process, and testable process improvements."
        },
        {
          role: "user",
          content: JSON.stringify({
            product: "Tradelyst",
            outputLanguage: locale === "en" ? "English" : "German",
            accountFilter: accountIds.length > 0 ? accountIds : "all",
            constraint:
              "No Anlageberatung, no signal generation, no recommendation to enter or exit any future trade.",
            metrics,
            deterministicPatterns,
            sampleTrades: trades.slice(-80).map((trade) => ({
              instrument: trade.instrument,
              direction: trade.direction,
              entryTime: trade.entryTime,
              netPnl: Number(trade.netPnl),
              rMultiple: trade.rMultiple ? Number(trade.rMultiple) : null,
              session: trade.session,
              setup: trade.setup?.name ?? null,
              mistakeTags: trade.mistakeTags
            }))
          })
        }
      ]
    });

    const content = response.choices[0]?.message.content;
    if (content) {
      const parsed = aiInsightSchema.safeParse(JSON.parse(content));
      if (parsed.success) insights = parsed.data.insights;
    }
  }

  await prisma.aIInsight.createMany({
    data: insights.map((insight) => ({
      userId,
      insightType: insight.insightType,
      title: insight.title,
      summary: insight.summary,
      evidence: insight.evidence as Prisma.InputJsonValue,
      suggestedAction: insight.suggestedAction,
      confidenceScore: insight.confidenceScore
    }))
  });

  return insights;
}
