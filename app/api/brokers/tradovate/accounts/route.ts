import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { refreshTradovateAccounts } from "@/lib/brokers/tradovate/oauth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connection = await prisma.brokerConnection.findFirst({
    where: { userId: session.user.id, provider: "TRADOVATE" }
  });
  if (!connection) {
    return NextResponse.json({ error: "Tradovate is not connected." }, { status: 404 });
  }

  const accounts = await refreshTradovateAccounts(connection.id);
  return NextResponse.json({ accounts });
}
