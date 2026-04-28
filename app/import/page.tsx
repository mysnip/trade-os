import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { ComplianceNote } from "@/components/compliance-note";
import { ImportWizard } from "@/components/import/import-wizard";
import { authOptions } from "@/lib/auth";
import { getCurrentDictionary } from "@/lib/i18n-server";

export default async function ImportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const t = getCurrentDictionary();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.importPage.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.importPage.subtitle}</p>
      </div>
      <ComplianceNote />
      <ImportWizard />
    </div>
  );
}
