import { NextResponse } from "next/server";

import { syncTradovateConnection } from "@/lib/brokers/tradovate/sync";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const unauthorized = authorizeCron(request);
  if (unauthorized) return unauthorized;

  const connections = await prisma.brokerConnection.findMany({
    where: {
      provider: "TRADOVATE",
      status: "CONNECTED",
      accounts: { some: { enabled: true } }
    }
  });

  let imported = 0;
  const errors = [];
  for (const connection of connections) {
    try {
      const result = await syncTradovateConnection(connection.id);
      imported += result.imported;
    } catch (error) {
      errors.push({ connectionId: connection.id, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return NextResponse.json({ checked: connections.length, imported, errors });
}

function authorizeCron(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 });
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
