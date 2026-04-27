import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import {
  exchangeTradovateCode,
  upsertTradovateConnection,
  verifyTradovateOAuthState
} from "@/lib/brokers/tradovate/oauth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", baseUrl));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(new URL(`/settings?tradovate=error`, baseUrl));
  }

  try {
    verifyTradovateOAuthState(state, session.user.id);
    const token = await exchangeTradovateCode(code);
    await upsertTradovateConnection(session.user.id, token);
    return NextResponse.redirect(new URL("/settings?tradovate=connected", baseUrl));
  } catch (callbackError) {
    console.error(callbackError);
    return NextResponse.redirect(new URL("/settings?tradovate=error", baseUrl));
  }
}
