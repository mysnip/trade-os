"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { createTradingAccountAction, deleteTradingAccountAction } from "@/app/settings/actions";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ManagedTradingAccount = {
  id: string;
  name: string;
  broker: string | null;
  currency: string;
  tradeCount: number;
};

export function AccountManagement({ accounts }: { accounts: ManagedTradingAccount[] }) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.accounts.manageTitle}</CardTitle>
        <p className="text-sm text-muted-foreground">{t.accounts.manageDescription}</p>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form action={createTradingAccountAction} className="space-y-4 rounded-md border p-4">
          <div>
            <div className="text-sm font-medium">{t.accounts.createTitle}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-name">{t.accounts.name}</Label>
            <Input id="account-name" name="name" placeholder="Evaluation 50k" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-broker">{t.accounts.broker}</Label>
            <Input id="account-broker" name="broker" placeholder="Tradovate" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-currency">{t.accounts.currency}</Label>
            <Input id="account-currency" name="currency" defaultValue="USD" maxLength={3} required />
          </div>
          <Button type="submit">{t.common.create}</Button>
        </form>

        <div className="space-y-3">
          {accounts.length > 0 ? (
            accounts.map((account) => <AccountRow key={account.id} account={account} />)
          ) : (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">{t.accounts.noAccounts}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AccountRow({ account }: { account: ManagedTradingAccount }) {
  const { t } = useI18n();
  const [confirmName, setConfirmName] = useState("");
  const canDelete = confirmName === account.name;

  return (
    <div className="rounded-md border p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium">{account.name}</div>
            <Badge variant="outline">{account.currency}</Badge>
            <Badge variant="secondary">{account.tradeCount} Trades</Badge>
          </div>
          {account.broker ? <div className="mt-1 text-sm text-muted-foreground">{account.broker}</div> : null}
        </div>
      </div>

      <form action={deleteTradingAccountAction} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <input type="hidden" name="id" value={account.id} />
        <div className="space-y-2">
          <Label>{t.accounts.deleteTitle}</Label>
          <p className="text-xs text-muted-foreground">{t.accounts.deleteWarning}</p>
          <Input
            name="confirmName"
            value={confirmName}
            onChange={(event) => setConfirmName(event.target.value)}
            placeholder={t.accounts.confirmName}
          />
          {!canDelete && confirmName ? <p className="text-xs text-destructive">{t.accounts.deleteBlocked}</p> : null}
        </div>
        <Button type="submit" variant="destructive" disabled={!canDelete}>
          <Trash2 className="h-4 w-4" />
          {t.common.delete}
        </Button>
      </form>
    </div>
  );
}
