import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { ComplianceNote } from "@/components/compliance-note";
import { ImportWizard } from "@/components/import/import-wizard";
import { authOptions } from "@/lib/auth";
import { getCurrentDictionary } from "@/lib/i18n-server";
import { prisma } from "@/lib/prisma";

export default async function ImportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const t = getCurrentDictionary();
  const tradingAccounts = await prisma.tradingAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.importPage.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.importPage.subtitle}</p>
      </div>
      <ComplianceNote />
      <ImportWizard
        accounts={tradingAccounts.map((account) => ({
          id: account.id,
          name: account.name,
          broker: account.broker,
          currency: account.currency
        }))}
      />
    </div>
  );
}
