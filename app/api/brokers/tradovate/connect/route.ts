import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import {
  buildTradovateAuthorizationUrl,
  createTradovateOAuthState
} from "@/lib/brokers/tradovate/oauth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
  }

  const state = createTradovateOAuthState(session.user.id);
  return NextResponse.redirect(buildTradovateAuthorizationUrl(state));
}
