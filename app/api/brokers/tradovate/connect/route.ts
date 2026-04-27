import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import {
  buildTradovateAuthorizationUrl,
  createTradovateOAuthState
} from "@/lib/brokers/tradovate/oauth";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", baseUrl));
  }

  try {
    const state = createTradovateOAuthState(session.user.id);
    return NextResponse.redirect(buildTradovateAuthorizationUrl(state));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/settings?tradovate=missing-config", baseUrl));
  }
}
