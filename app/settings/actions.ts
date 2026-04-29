"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { refreshTradovateAccounts } from "@/lib/brokers/tradovate/oauth";
import { syncTradovateConnection } from "@/lib/brokers/tradovate/sync";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";

const tradingAccountSchema = z.object({
  name: z.string().trim().min(1),
  broker: z.string().trim().optional(),
  currency: z.string().trim().min(3).max(3).default("USD")
});

export async function createTradingAccountAction(formData: FormData) {
  const userId = await requireUserId();
  const parsed = tradingAccountSchema.parse({
    name: formData.get("name"),
    broker: formData.get("broker") || undefined,
    currency: formData.get("currency") || "USD"
  });

  await prisma.tradingAccount.upsert({
    where: {
      userId_name: {
        userId,
        name: parsed.name
      }
    },
    create: {
      userId,
      name: parsed.name,
      broker: parsed.broker || null,
      currency: parsed.currency.toUpperCase()
    },
    update: {
      broker: parsed.broker || null,
      currency: parsed.currency.toUpperCase()
    }
  });

  revalidateAccountViews();
}

export async function deleteTradingAccountAction(formData: FormData) {
  const userId = await requireUserId();
  const id = z.string().min(1).parse(formData.get("id"));
  const confirmName = z.string().min(1).parse(formData.get("confirmName"));
  const account = await prisma.tradingAccount.findFirst({
    where: { id, userId }
  });
  if (!account || account.name !== confirmName) return;

  await prisma.tradingAccount.delete({
    where: { id }
  });

  revalidateAccountViews();
}

export async function deleteTradesForTradingAccountAction(formData: FormData) {
  const userId = await requireUserId();
  const id = z.string().min(1).parse(formData.get("id"));
  const confirmName = z.string().min(1).parse(formData.get("confirmName"));
  const account = await prisma.tradingAccount.findFirst({
    where: { id, userId }
  });
  if (!account || account.name !== confirmName) return;

  await prisma.trade.deleteMany({
    where: {
      userId,
      tradingAccountId: account.id
    }
  });

  revalidateAccountViews();
}

export async function updateTradovateAccountSelectionAction(formData: FormData) {
  const userId = await requireUserId();
  const selectedIds = new Set(formData.getAll("accountIds").map(String));
  const connection = await prisma.brokerConnection.findFirst({
    where: { userId, provider: "TRADOVATE" },
    include: { accounts: true }
  });
  if (!connection) return;

  await prisma.$transaction(async (tx) => {
    for (const account of connection.accounts) {
      const selected = selectedIds.has(account.id);
      let tradingAccountId: string | null = account.tradingAccountId ?? null;

      if (selected) {
        const tradingAccount = await tx.tradingAccount.upsert({
          where: {
            userId_name: {
              userId,
              name: account.name
            }
          },
          create: {
            userId,
            name: account.name,
            broker: "Tradovate",
            currency: "USD"
          },
          update: {
            broker: "Tradovate"
          }
        });
        tradingAccountId = tradingAccount.id;
      }

      await tx.brokerAccount.update({
        where: { id: account.id },
        data: {
          enabled: selected,
          tradingAccountId
        }
      });
    }
  });

  revalidateAccountViews();
}

export async function refreshTradovateAccountsAction() {
  const userId = await requireUserId();
  const connection = await prisma.brokerConnection.findFirst({
    where: { userId, provider: "TRADOVATE" }
  });
  if (!connection) return;

  await refreshTradovateAccounts(connection.id);
  revalidatePath("/settings");
}

export async function syncTradovateNowAction() {
  const userId = await requireUserId();
  const connection = await prisma.brokerConnection.findFirst({
    where: { userId, provider: "TRADOVATE" }
  });
  if (!connection) return;

  await syncTradovateConnection(connection.id);
  revalidatePath("/settings");
  revalidatePath("/trades");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
}

function revalidateAccountViews() {
  revalidatePath("/settings");
  revalidatePath("/trades");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/setups");
  revalidatePath("/insights");
  revalidatePath("/import");
}
