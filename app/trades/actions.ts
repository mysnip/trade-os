"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";

const updateTradeSchema = z.object({
  id: z.string(),
  setupId: z.string().optional(),
  notes: z.string().optional(),
  emotionBefore: z.string().optional(),
  emotionAfter: z.string().optional(),
  mistakeTags: z.string().optional()
});

export async function updateTradeAction(formData: FormData) {
  const userId = await requireUserId();
  const parsed = updateTradeSchema.parse({
    id: formData.get("id"),
    setupId: formData.get("setupId") || undefined,
    notes: formData.get("notes") || undefined,
    emotionBefore: formData.get("emotionBefore") || undefined,
    emotionAfter: formData.get("emotionAfter") || undefined,
    mistakeTags: formData.get("mistakeTags") || undefined
  });

  await prisma.trade.update({
    where: {
      id: parsed.id,
      userId
    },
    data: {
      setupId: parsed.setupId === "none" ? null : parsed.setupId,
      notes: parsed.notes,
      emotionBefore: parsed.emotionBefore,
      emotionAfter: parsed.emotionAfter,
      mistakeTags: parsed.mistakeTags
        ? parsed.mistakeTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []
    }
  });

  revalidatePath("/trades");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
}
