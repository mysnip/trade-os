import type { BrokerAccount, BrokerConnection } from "@prisma/client";

import {
  getTradovateContracts,
  listTradovateFillPairs,
  listTradovateFills,
  listTradovateOrders
} from "@/lib/brokers/tradovate/client";
import { ensureTradovateAccessToken } from "@/lib/brokers/tradovate/oauth";
import { detectSession } from "@/lib/import/session";
import { prisma } from "@/lib/prisma";

type ReconstructedTrade = {
  externalId: string;
  instrument: string;
  direction: "LONG" | "SHORT";
  entryTime: Date;
  exitTime: Date;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  netPnl: number;
};

export async function syncTradovateConnection(connectionId: string) {
  const connection = await prisma.brokerConnection.findUniqueOrThrow({
    where: { id: connectionId },
    include: { accounts: { where: { enabled: true } } }
  });

  let totalImported = 0;
  let totalFound = 0;
  for (const account of connection.accounts) {
    const result = await syncTradovateAccount(connection, account);
    totalImported += result.imported;
    totalFound += result.found;
  }

  await prisma.brokerConnection.update({
    where: { id: connection.id },
    data: { lastSyncedAt: new Date(), status: "CONNECTED", error: null }
  });

  return { imported: totalImported, found: totalFound };
}

export async function syncTradovateAccount(connection: BrokerConnection, account: BrokerAccount) {
  const tradingAccount = account.tradingAccountId
    ? await prisma.tradingAccount.findFirst({
        where: {
          id: account.tradingAccountId,
          userId: connection.userId
        }
      })
    : null;
  const linkedTradingAccount =
    tradingAccount ??
    (await prisma.tradingAccount.upsert({
      where: {
        userId_name: {
          userId: connection.userId,
          name: account.name
        }
      },
      create: {
        userId: connection.userId,
        name: account.name,
        broker: "Tradovate",
        currency: "USD"
      },
      update: {
        broker: "Tradovate"
      }
    }));

  if (account.tradingAccountId !== linkedTradingAccount.id) {
    await prisma.brokerAccount.update({
      where: { id: account.id },
      data: { tradingAccountId: linkedTradingAccount.id }
    });
  }

  const job = await prisma.brokerSyncJob.create({
    data: {
      userId: connection.userId,
      connectionId: connection.id,
      accountId: account.id,
      provider: "TRADOVATE",
      status: "PROCESSING"
    }
  });

  try {
    const accessToken = await ensureTradovateAccessToken(connection);
    const [fills, fillPairs, orders] = await Promise.all([
      listTradovateFills(connection.environment, accessToken),
      listTradovateFillPairs(connection.environment, accessToken),
      listTradovateOrders(connection.environment, accessToken).catch(() => [])
    ]);

    const accountOrders = orders.filter((order) => String(order.accountId ?? "") === account.externalAccountId);
    const allowedOrderIds = new Set(accountOrders.map((order) => order.id));
    const accountFills = allowedOrderIds.size
      ? fills.filter((fill) => allowedOrderIds.has(fill.orderId))
      : fills;
    const contractIds = Array.from(new Set(accountFills.map((fill) => fill.contractId)));
    const contracts = await getTradovateContracts(connection.environment, accessToken, contractIds).catch(() => []);
    const contractNames = new Map(
      contracts.map((contract) => [contract.id, contract.symbol ?? contract.name ?? String(contract.id)])
    );
    const trades = reconstructTrades(accountFills, fillPairs, contractNames);
    let imported = 0;

    for (const trade of trades) {
      const exists = await prisma.trade.findFirst({
        where: {
          userId: connection.userId,
          importedFrom: trade.externalId
        },
        select: { id: true }
      });
      if (exists) continue;

      await prisma.trade.create({
        data: {
          userId: connection.userId,
          tradingAccountId: linkedTradingAccount.id,
          broker: "Tradovate",
          accountName: account.name,
          instrument: trade.instrument,
          direction: trade.direction,
          entryTime: trade.entryTime,
          exitTime: trade.exitTime,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          quantity: trade.quantity,
          grossPnl: trade.netPnl,
          netPnl: trade.netPnl,
          commission: null,
          fees: null,
          riskAmount: null,
          rMultiple: null,
          session: detectSession(trade.entryTime),
          importedFrom: trade.externalId
        }
      });
      imported += 1;
    }

    await prisma.brokerAccount.update({
      where: { id: account.id },
      data: { lastSyncedAt: new Date() }
    });
    await prisma.brokerSyncJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        finishedAt: new Date(),
        rowsFound: trades.length,
        rowsImported: imported
      }
    });

    return { found: trades.length, imported };
  } catch (error) {
    await prisma.brokerSyncJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        rowsFailed: 1,
        errorLog: { message: error instanceof Error ? error.message : String(error) }
      }
    });
    await prisma.brokerConnection.update({
      where: { id: connection.id },
      data: {
        status: "ERROR",
        error: error instanceof Error ? error.message : String(error)
      }
    });
    throw error;
  }
}

function reconstructTrades(
  fills: Awaited<ReturnType<typeof listTradovateFills>>,
  fillPairs: Awaited<ReturnType<typeof listTradovateFillPairs>>,
  contractNames: Map<number, string>
): ReconstructedTrade[] {
  const fillById = new Map(fills.map((fill) => [fill.id, fill]));

  return fillPairs
    .map((pair) => {
      const buyFill = fillById.get(pair.buyFillId);
      const sellFill = fillById.get(pair.sellFillId);
      if (!buyFill || !sellFill) return null;

      const longTrade = new Date(buyFill.timestamp) <= new Date(sellFill.timestamp);
      const entryFill = longTrade ? buyFill : sellFill;
      const exitFill = longTrade ? sellFill : buyFill;
      const quantity = pair.qty;
      const netPnl = longTrade
        ? (pair.sellPrice - pair.buyPrice) * quantity
        : (pair.buyPrice - pair.sellPrice) * quantity;

      return {
        externalId: `tradovate:fillPair:${pair.id}`,
        instrument: contractNames.get(entryFill.contractId) ?? String(entryFill.contractId),
        direction: longTrade ? "LONG" : "SHORT",
        entryTime: new Date(entryFill.timestamp),
        exitTime: new Date(exitFill.timestamp),
        entryPrice: longTrade ? pair.buyPrice : pair.sellPrice,
        exitPrice: longTrade ? pair.sellPrice : pair.buyPrice,
        quantity,
        netPnl
      } satisfies ReconstructedTrade;
    })
    .filter((trade): trade is ReconstructedTrade => Boolean(trade));
}
