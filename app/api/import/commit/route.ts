import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { normalizeTrade } from "@/lib/import/normalizeTrade";
import type { ColumnMapping, RawImportRow, ValidationIssue } from "@/lib/import/types";
import { validateTrade } from "@/lib/import/validateTrade";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  source: z.string().min(1),
  filename: z.string().min(1),
  mapping: z.record(z.string(), z.string()),
  rows: z.array(z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])))
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { source, filename, mapping, rows } = parsed.data;
  const job = await prisma.importJob.create({
    data: {
      userId: session.user.id,
      source,
      filename,
      status: "PROCESSING",
      rowsTotal: rows.length
    }
  });

  const validTrades = [];
  const errorLog: ValidationIssue[] = [];
  let failedRows = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const normalized = normalizeTrade(row as RawImportRow, mapping as ColumnMapping, source);
    const validation = validateTrade(normalized, index + 2);
    if (!validation.valid) {
      failedRows += 1;
      errorLog.push(...validation.issues);
      continue;
    }

    validTrades.push({
      userId: session.user.id,
      broker: normalized.broker,
      accountName: normalized.accountName,
      instrument: normalized.instrument!,
      direction: normalized.direction!,
      entryTime: normalized.entryTime!,
      exitTime: normalized.exitTime,
      entryPrice: normalized.entryPrice!,
      exitPrice: normalized.exitPrice,
      quantity: normalized.quantity!,
      grossPnl: normalized.grossPnl,
      netPnl: normalized.netPnl!,
      commission: normalized.commission,
      fees: normalized.fees,
      riskAmount: normalized.riskAmount,
      rMultiple: normalized.rMultiple,
      stopLoss: normalized.stopLoss,
      takeProfit: normalized.takeProfit,
      session: normalized.session!,
      notes: normalized.notes,
      importedFrom: normalized.importedFrom
    });
  }

  if (validTrades.length > 0) {
    await prisma.trade.createMany({
      data: validTrades
    });
  }

  const updatedJob = await prisma.importJob.update({
    where: { id: job.id },
    data: {
      status: failedRows === rows.length ? "FAILED" : "COMPLETED",
      rowsImported: validTrades.length,
      rowsFailed: failedRows,
      errorLog
    }
  });

  return NextResponse.json({
    jobId: updatedJob.id,
    status: updatedJob.status,
    rowsTotal: rows.length,
    rowsImported: validTrades.length,
    rowsFailed: failedRows,
    errorLog
  });
}
