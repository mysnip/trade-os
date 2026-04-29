"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { detectSession } from "@/lib/import/session";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";

const nullableNumber = z
  .string()
  .optional()
  .transform((value) => {
    if (!value?.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  });

const tradeFormSchema = z.object({
  id: z.string().optional(),
  tradingAccountId: z.string().min(1),
  broker: z.string().optional(),
  accountName: z.string().optional(),
  instrument: z.string().min(1),
  direction: z.enum(["LONG", "SHORT"]),
  entryDate: z.string().min(1),
  entryTime: z.string().min(1),
  exitDate: z.string().optional(),
  exitTime: z.string().optional(),
  entryPrice: z.string().min(1).transform(Number),
  exitPrice: nullableNumber,
  quantity: z.string().min(1).transform(Number),
  grossPnl: nullableNumber,
  netPnl: z.string().min(1).transform(Number),
  commission: nullableNumber,
  fees: nullableNumber,
  riskAmount: nullableNumber,
  rMultiple: nullableNumber,
  stopLoss: nullableNumber,
  takeProfit: nullableNumber,
  session: z.enum(["ASIA", "LONDON", "NEW_YORK", "OTHER", "AUTO"]),
  setupId: z.string().optional(),
  notes: z.string().optional(),
  emotionBefore: z.string().optional(),
  emotionAfter: z.string().optional(),
  mistakeTags: z.string().optional(),
  screenshotUrl: z.string().optional(),
  importedFrom: z.string().optional()
});

function optionalText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseDateTime(date: string, time?: string | null) {
  return new Date(`${date}T${time || "00:00"}:00`);
}

async function getTradeData(userId: string, formData: FormData) {
  const parsed = tradeFormSchema.parse({
    id: formData.get("id") || undefined,
    tradingAccountId: formData.get("tradingAccountId"),
    broker: formData.get("broker") || undefined,
    accountName: formData.get("accountName") || undefined,
    instrument: formData.get("instrument"),
    direction: formData.get("direction"),
    entryDate: formData.get("entryDate"),
    entryTime: formData.get("entryTime"),
    exitDate: formData.get("exitDate") || undefined,
    exitTime: formData.get("exitTime") || undefined,
    entryPrice: formData.get("entryPrice"),
    exitPrice: formData.get("exitPrice") || undefined,
    quantity: formData.get("quantity"),
    grossPnl: formData.get("grossPnl") || undefined,
    netPnl: formData.get("netPnl"),
    commission: formData.get("commission") || undefined,
    fees: formData.get("fees") || undefined,
    riskAmount: formData.get("riskAmount") || undefined,
    rMultiple: formData.get("rMultiple") || undefined,
    stopLoss: formData.get("stopLoss") || undefined,
    takeProfit: formData.get("takeProfit") || undefined,
    session: formData.get("session") || "AUTO",
    setupId: formData.get("setupId") || undefined,
    notes: formData.get("notes") || undefined,
    emotionBefore: formData.get("emotionBefore") || undefined,
    emotionAfter: formData.get("emotionAfter") || undefined,
    mistakeTags: formData.get("mistakeTags") || undefined,
    screenshotUrl: formData.get("screenshotUrl") || undefined,
    importedFrom: formData.get("importedFrom") || undefined
  });

  const entryTime = parseDateTime(parsed.entryDate, parsed.entryTime);
  const riskAmount = parsed.riskAmount && parsed.riskAmount > 0 ? parsed.riskAmount : null;
  const rMultiple = parsed.rMultiple ?? (riskAmount ? parsed.netPnl / riskAmount : null);
  const tradingAccount = await prisma.tradingAccount.findFirstOrThrow({
    where: {
      id: parsed.tradingAccountId,
      userId
    }
  });

  return {
    tradingAccountId: tradingAccount.id,
    broker: optionalText(parsed.broker),
    accountName: tradingAccount.name,
    instrument: parsed.instrument.trim().toUpperCase(),
    direction: parsed.direction,
    entryTime,
    exitTime: parsed.exitDate ? parseDateTime(parsed.exitDate, parsed.exitTime) : null,
    entryPrice: parsed.entryPrice,
    exitPrice: parsed.exitPrice,
    quantity: Math.abs(parsed.quantity),
    grossPnl: parsed.grossPnl,
    netPnl: parsed.netPnl,
    commission: parsed.commission,
    fees: parsed.fees,
    riskAmount,
    rMultiple,
    stopLoss: parsed.stopLoss,
    takeProfit: parsed.takeProfit,
    session: parsed.session === "AUTO" ? detectSession(entryTime) : parsed.session,
    setupId: parsed.setupId === "none" ? null : parsed.setupId,
    notes: optionalText(parsed.notes),
    emotionBefore: optionalText(parsed.emotionBefore),
    emotionAfter: optionalText(parsed.emotionAfter),
    mistakeTags: parsed.mistakeTags
      ? parsed.mistakeTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    screenshotUrl: optionalText(parsed.screenshotUrl),
    importedFrom: optionalText(parsed.importedFrom) ?? "manual"
  };
}

export async function createTradeAction(formData: FormData) {
  const userId = await requireUserId();
  await prisma.trade.create({
    data: {
      userId,
      ...(await getTradeData(userId, formData))
    }
  });

  revalidateTradeViews();
}

export async function updateTradeAction(formData: FormData) {
  const userId = await requireUserId();
  const id = z.string().parse(formData.get("id"));

  await prisma.trade.update({
    where: {
      id,
      userId
    },
    data: await getTradeData(userId, formData)
  });

  revalidateTradeViews();
}

function revalidateTradeViews() {
  revalidatePath("/trades");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/setups");
  revalidatePath("/insights");
}
