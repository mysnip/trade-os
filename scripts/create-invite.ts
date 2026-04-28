import { PrismaClient } from "@prisma/client";

import { buildInviteUrl, createInviteToken, getInviteExpiry, hashInviteToken } from "../lib/auth/invites";

const prisma = new PrismaClient();

async function main() {
  const [emailArg, nameArg, daysArg] = process.argv.slice(2);
  const email = emailArg?.toLowerCase().trim();
  const name = nameArg?.trim();
  const days = daysArg ? Number(daysArg) : undefined;

  if (!email || !email.includes("@")) {
    throw new Error("Usage: npm run invite:create -- user@example.com \"User Name\" 7");
  }

  const token = createInviteToken();
  const tokenHash = hashInviteToken(token);
  const expiresAt = getInviteExpiry(Number.isFinite(days) ? days : undefined);
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000";

  await prisma.invite.updateMany({
    where: {
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() }
    },
    data: {
      expiresAt: new Date()
    }
  });

  await prisma.invite.create({
    data: {
      email,
      name: name || null,
      tokenHash,
      expiresAt
    }
  });

  console.log(`Invite created for ${email}`);
  console.log(`Expires at: ${expiresAt.toISOString()}`);
  console.log(buildInviteUrl(baseUrl, token));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
