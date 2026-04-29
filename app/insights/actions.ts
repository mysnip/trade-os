"use server";

import { revalidatePath } from "next/cache";

import { generateTradingInsights } from "@/lib/ai/generateTradingInsights";
import { getCurrentLocale } from "@/lib/i18n-server";
import { requireUserId } from "@/lib/server";

export async function generateInsightsAction(formData: FormData) {
  const userId = await requireUserId();
  const locale = getCurrentLocale();
  const accountIds = String(formData.get("accountIds") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  await generateTradingInsights(userId, undefined, locale, accountIds);
  revalidatePath("/insights");
  revalidatePath("/dashboard");
}
