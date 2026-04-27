import { NextResponse } from "next/server";

import { renewTradovateConnectionToken } from "@/lib/brokers/tradovate/oauth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const unauthorized = authorizeCron(request);
  if (unauthorized) return unauthorized;

  const refreshBefore = new Date(Date.now() + 20 * 60 * 1000);
  const connections = await prisma.brokerConnection.findMany({
    where: {
      provider: "TRADOVATE",
      status: "CONNECTED",
      expiresAt: { lte: refreshBefore }
    }
  });

  let refreshed = 0;
  const errors = [];
  for (const connection of connections) {
    try {
      await renewTradovateConnectionToken(connection);
      refreshed += 1;
    } catch (error) {
      errors.push({ connectionId: connection.id, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return NextResponse.json({ checked: connections.length, refreshed, errors });
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
