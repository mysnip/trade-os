"use server";

import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { z } from "zod";

import { hashInviteToken } from "@/lib/auth/invites";
import { prisma } from "@/lib/prisma";

const acceptInviteSchema = z.object({
  token: z.string().min(20),
  name: z.string().trim().optional(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8)
});

function inviteRedirect(token: string, error: string): never {
  redirect(`/invite/${encodeURIComponent(token)}?error=${encodeURIComponent(error)}`);
}

export async function acceptInviteAction(formData: FormData) {
  const parsed = acceptInviteSchema.safeParse({
    token: formData.get("token"),
    name: formData.get("name") || undefined,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    const token = String(formData.get("token") ?? "");
    inviteRedirect(token, "password");
  }

  const { token, name, password, confirmPassword } = parsed.data;
  if (password !== confirmPassword) inviteRedirect(token, "password");

  const tokenHash = hashInviteToken(token);
  const invite = await prisma.invite.findUnique({
    where: { tokenHash }
  });

  if (!invite) inviteRedirect(token, "invalid");
  if (invite.acceptedAt) inviteRedirect(token, "used");
  if (invite.expiresAt < new Date()) inviteRedirect(token, "expired");

  const passwordHash = await hash(password, 12);
  const displayName = name?.trim() || invite.name || invite.email.split("@")[0];

  const user = await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: { email: invite.email }
    });

    const acceptedUser = existingUser
      ? await tx.user.update({
          where: { id: existingUser.id },
          data: {
            name: displayName,
            passwordHash,
            emailVerified: existingUser.emailVerified ?? new Date()
          }
        })
      : await tx.user.create({
          data: {
            email: invite.email,
            name: displayName,
            passwordHash,
            emailVerified: new Date()
          }
        });

    await tx.invite.update({
      where: { id: invite.id },
      data: {
        acceptedAt: new Date(),
        acceptedById: acceptedUser.id
      }
    });

    return acceptedUser;
  });

  redirect(`/login?invite=accepted&email=${encodeURIComponent(user.email)}`);
}
