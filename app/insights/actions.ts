"use server";

import { revalidatePath } from "next/cache";

import { generateTradingInsights } from "@/lib/ai/generateTradingInsights";
import { requireUserId } from "@/lib/server";

export async function generateInsightsAction() {
  const userId = await requireUserId();
  await generateTradingInsights(userId);
  revalidatePath("/insights");
  revalidatePath("/dashboard");
}
