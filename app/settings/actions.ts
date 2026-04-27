"use server";

import { revalidatePath } from "next/cache";

import { refreshTradovateAccounts } from "@/lib/brokers/tradovate/oauth";
import { syncTradovateConnection } from "@/lib/brokers/tradovate/sync";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";

export async function updateTradovateAccountSelectionAction(formData: FormData) {
  const userId = await requireUserId();
  const selectedIds = new Set(formData.getAll("accountIds").map(String));
  const connection = await prisma.brokerConnection.findFirst({
    where: { userId, provider: "TRADOVATE" },
    include: { accounts: true }
  });
  if (!connection) return;

  await prisma.$transaction(
    connection.accounts.map((account) =>
      prisma.brokerAccount.update({
        where: { id: account.id },
        data: { enabled: selectedIds.has(account.id) }
      })
    )
  );

  revalidatePath("/settings");
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
