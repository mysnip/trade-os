import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { syncTradovateConnection } from "@/lib/brokers/tradovate/sync";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connection = await prisma.brokerConnection.findFirst({
    where: { userId: session.user.id, provider: "TRADOVATE", status: { not: "DISCONNECTED" } }
  });
  if (!connection) {
    return NextResponse.json({ error: "Tradovate is not connected." }, { status: 404 });
  }

  const result = await syncTradovateConnection(connection.id);
  return NextResponse.json(result);
}
