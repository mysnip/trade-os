import { PrismaClient, TradeDirection, TradingSession } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const demoPasswordHash = await hash("demo", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@tradeos.ai" },
    update: {
      passwordHash: demoPasswordHash,
      emailVerified: new Date()
    },
    create: {
      email: "demo@tradeos.ai",
      name: "Demo Trader",
      passwordHash: demoPasswordHash,
      emailVerified: new Date()
    }
  });

  await prisma.aIInsight.deleteMany({ where: { userId: user.id } });
  await prisma.trade.deleteMany({ where: { userId: user.id } });
  await prisma.setup.deleteMany({ where: { userId: user.id } });
  await prisma.importJob.deleteMany({ where: { userId: user.id } });
  await prisma.tradingAccount.deleteMany({ where: { userId: user.id } });

  const tradingAccount = await prisma.tradingAccount.create({
    data: {
      userId: user.id,
      name: "Evaluation",
      broker: "Seed",
      currency: "USD"
    }
  });

  const ifvg = await prisma.setup.create({
    data: {
      userId: user.id,
      name: "iFVG Retest",
      description: "Inverse FVG retest after displacement and liquidity sweep.",
      rules: {
        checklist: ["Liquidity sweep", "Displacement", "Retest", "Defined invalidation"]
      },
      marketConditions: "NY session, clean displacement, no high impact news inside next 10 minutes.",
      entryCriteria: "Retest of iFVG with rejection and clear stop placement.",
      exitCriteria: "Partial at 1R, runner into opposing liquidity.",
      invalidationCriteria: "Close back through displacement origin."
    }
  });

  const fvg = await prisma.setup.create({
    data: {
      userId: user.id,
      name: "FVG Continuation",
      description: "Continuation entry after market structure confirmation.",
      rules: {
        checklist: ["Trend day context", "FVG remains open", "Entry aligns with session bias"]
      },
      marketConditions: "Directional context with clear higher-timeframe bias.",
      entryCriteria: "FVG mitigation with lower timeframe confirmation.",
      exitCriteria: "Prior liquidity pool or 2R.",
      invalidationCriteria: "Break of local structure against entry."
    }
  });

  const trades = [
    ["NQ", TradeDirection.LONG, "2026-04-01T13:35:00Z", "2026-04-01T14:05:00Z", 18450.25, 18483.75, 2, 670, 300, 2.23, TradingSession.NEW_YORK, ifvg.id, []],
    ["ES", TradeDirection.SHORT, "2026-04-02T14:15:00Z", "2026-04-02T14:42:00Z", 5260.5, 5254.25, 3, 937.5, 450, 2.08, TradingSession.NEW_YORK, fvg.id, []],
    ["NQ", TradeDirection.SHORT, "2026-04-03T15:10:00Z", "2026-04-03T15:26:00Z", 18520, 18538.5, 1, -370, 250, -1.48, TradingSession.NEW_YORK, null, ["late entry"]],
    ["GC", TradeDirection.LONG, "2026-04-06T08:20:00Z", "2026-04-06T09:30:00Z", 2328.4, 2334.7, 1, 630, 350, 1.8, TradingSession.LONDON, fvg.id, []],
    ["NQ", TradeDirection.LONG, "2026-04-07T13:45:00Z", "2026-04-07T14:22:00Z", 18410, 18458.25, 1, 965, 300, 3.22, TradingSession.NEW_YORK, ifvg.id, []],
    ["ES", TradeDirection.LONG, "2026-04-08T18:05:00Z", "2026-04-08T18:40:00Z", 5282, 5277.25, 2, -475, 300, -1.58, TradingSession.NEW_YORK, null, ["revenge risk"]],
    ["NQ", TradeDirection.SHORT, "2026-04-09T13:32:00Z", "2026-04-09T13:58:00Z", 18620.5, 18588.25, 1, 645, 250, 2.58, TradingSession.NEW_YORK, ifvg.id, []],
    ["ES", TradeDirection.SHORT, "2026-04-10T07:50:00Z", "2026-04-10T08:35:00Z", 5295.25, 5299, 2, -375, 250, -1.5, TradingSession.LONDON, fvg.id, ["early entry"]]
  ] as const;

  await prisma.trade.createMany({
    data: trades.map((trade) => ({
      userId: user.id,
      tradingAccountId: tradingAccount.id,
      broker: "Seed",
      accountName: "Evaluation",
      instrument: trade[0],
      direction: trade[1],
      entryTime: new Date(trade[2]),
      exitTime: new Date(trade[3]),
      entryPrice: trade[4],
      exitPrice: trade[5],
      quantity: trade[6],
      grossPnl: trade[7],
      netPnl: trade[7] - 4,
      commission: 4,
      fees: 0,
      riskAmount: trade[8],
      rMultiple: trade[9],
      session: trade[10],
      setupId: trade[11],
      mistakeTags: [...trade[12]],
      importedFrom: "seed",
      notes: "Seed trade for MVP demo"
    }))
  });

  await prisma.importJob.create({
    data: {
      userId: user.id,
      tradingAccountId: tradingAccount.id,
      source: "seed",
      filename: "seed-demo-trades.csv",
      status: "COMPLETED",
      rowsTotal: trades.length,
      rowsImported: trades.length,
      rowsFailed: 0,
      errorLog: []
    }
  });

  await prisma.aIInsight.create({
    data: {
      userId: user.id,
      insightType: "profitable_pattern",
      accountIds: [tradingAccount.id],
      title: "iFVG Retest zeigt positiven Erwartungswert",
      summary: "Die Demo-Daten zeigen starke Ergebnisse bei iFVG-Retest-Trades in der New-York-Session.",
      evidence: { setup: "iFVG Retest", note: "Seed data only" },
      suggestedAction: "Teste dieses Setup isoliert weiter und dokumentiere Entry, Invalidation und Management konsistent.",
      confidenceScore: 0.72
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
