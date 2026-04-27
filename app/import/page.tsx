import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { ComplianceNote } from "@/components/compliance-note";
import { ImportWizard } from "@/components/import/import-wizard";
import { authOptions } from "@/lib/auth";

export default async function ImportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Trade Import</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Importiere CSV/XLSX-Dateien, mappe Broker-Spalten und prüfe fehlerhafte Zeilen vor dem Speichern.
        </p>
      </div>
      <ComplianceNote />
      <ImportWizard />
    </div>
  );
}
