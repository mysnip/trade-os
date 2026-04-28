"use client";

import { Languages } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Locale } from "@/lib/i18n";

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <Languages className="hidden h-4 w-4 text-muted-foreground sm:block" />
      <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
        <SelectTrigger className="h-9 w-[118px]" aria-label={t.common.language}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="de">{t.common.german}</SelectItem>
          <SelectItem value="en">{t.common.english}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
