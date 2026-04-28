"use server";

import { revalidatePath } from "next/cache";

import { generateTradingInsights } from "@/lib/ai/generateTradingInsights";
import { getCurrentLocale } from "@/lib/i18n-server";
import { requireUserId } from "@/lib/server";

export async function generateInsightsAction() {
  const userId = await requireUserId();
  const locale = getCurrentLocale();
  await generateTradingInsights(userId, undefined, locale);
  revalidatePath("/insights");
  revalidatePath("/dashboard");
}
