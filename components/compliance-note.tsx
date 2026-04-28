"use client";

import { ShieldCheck } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";

export function ComplianceNote() {
  const { t } = useI18n();

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <p>{t.complianceNote.text}</p>
    </div>
  );
}
