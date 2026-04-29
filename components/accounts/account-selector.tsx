"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { interpolate } from "@/lib/i18n";
import type { TradingAccountOption } from "@/lib/accounts";

export function AccountSelector({
  accounts,
  selectedAccountIds
}: {
  accounts: TradingAccountOption[];
  selectedAccountIds: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const selected = useMemo(() => new Set(selectedAccountIds), [selectedAccountIds]);
  const label =
    selected.size === 0
      ? t.accounts.allAccounts
      : selected.size === 1
        ? accounts.find((account) => selected.has(account.id))?.name ?? t.accounts.selectedCount
        : interpolate(t.accounts.selectedCount, { count: selected.size });

  function updateSelection(nextIds: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextIds.length > 0) {
      params.set("accountIds", nextIds.join(","));
    } else {
      params.delete("accountIds");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function toggleAccount(accountId: string) {
    const next = new Set(selected);
    if (next.has(accountId)) {
      next.delete(accountId);
    } else {
      next.add(accountId);
    }
    updateSelection(Array.from(next));
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
        {t.accounts.noAccounts}
      </div>
    );
  }

  return (
    <details className="relative">
      <summary className="flex h-10 cursor-pointer list-none items-center justify-between gap-2 rounded-md border bg-background px-3 text-sm hover:bg-secondary/50">
        <span className="min-w-0 truncate">
          <span className="mr-2 text-muted-foreground">{t.accounts.selectorLabel}</span>
          {label}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-72 rounded-md border bg-popover p-2 shadow-lg">
        <Button className="mb-2 w-full justify-start" variant={selected.size === 0 ? "secondary" : "ghost"} onClick={() => updateSelection([])}>
          {selected.size === 0 ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
          {t.accounts.allAccounts}
        </Button>
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {accounts.map((account) => {
            const active = selected.has(account.id);
            return (
              <button
                key={account.id}
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-secondary"
                onClick={() => toggleAccount(account.id)}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{account.name}</span>
                  {account.broker ? <span className="block truncate text-xs text-muted-foreground">{account.broker}</span> : null}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">{account.currency}</Badge>
                  {active ? <Check className="h-4 w-4 text-primary" /> : <span className="h-4 w-4" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </details>
  );
}
