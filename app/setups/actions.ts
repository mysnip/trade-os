"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";

const setupSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  marketConditions: z.string().optional(),
  entryCriteria: z.string().optional(),
  exitCriteria: z.string().optional(),
  invalidationCriteria: z.string().optional()
});

export async function createSetupAction(formData: FormData) {
  const userId = await requireUserId();
  const data = setupSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    marketConditions: formData.get("marketConditions") || undefined,
    entryCriteria: formData.get("entryCriteria") || undefined,
    exitCriteria: formData.get("exitCriteria") || undefined,
    invalidationCriteria: formData.get("invalidationCriteria") || undefined
  });

  await prisma.setup.create({
    data: {
      userId,
      ...data,
      rules: {
        checklist: [
          "Market condition confirmed",
          "Entry criteria met",
          "Invalidation defined before entry"
        ]
      }
    }
  });

  revalidatePath("/setups");
}
