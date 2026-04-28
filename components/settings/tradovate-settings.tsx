import Link from "next/link";
import { CheckCircle2, RefreshCw, Unplug, UploadCloud } from "lucide-react";

import {
  refreshTradovateAccountsAction,
  syncTradovateNowAction,
  updateTradovateAccountSelectionAction
} from "@/app/settings/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TradovateConnection = {
  id: string;
  environment: "DEMO" | "LIVE";
  status: "CONNECTED" | "NEEDS_REAUTH" | "ERROR" | "DISCONNECTED";
  expiresAt: Date;
  lastTokenRefreshAt: Date | null;
  lastSyncedAt: Date | null;
  error: string | null;
  accounts: Array<{
    id: string;
    name: string;
    accountSpec: string | null;
    enabled: boolean;
    lastSyncedAt: Date | null;
  }>;
  syncJobs: Array<{
    id: string;
    status: "PROCESSING" | "COMPLETED" | "FAILED";
    startedAt: Date;
    rowsFound: number;
    rowsImported: number;
    rowsFailed: number;
  }>;
};

export function TradovateSettings({ connection }: { connection: TradovateConnection | null }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Tradovate OAuth Import</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Verbinde Tradovate per OAuth, wähle Konten aus und importiere Fills automatisch ins Journal.
            </p>
          </div>
          {connection ? (
            <Badge variant={connection.status === "CONNECTED" ? "default" : "destructive"}>
              {connection.status}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {!connection ? (
          <div className="space-y-4">
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              Du wirst zu Tradovate weitergeleitet. Danach lädt TradeOS die verfügbaren Accounts und du
              entscheidest, welche importiert werden.
            </div>
            <Button asChild>
              <Link href="/api/brokers/tradovate/connect">
                <Unplug className="h-4 w-4" />
                Tradovate verbinden
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 text-sm md:grid-cols-3">
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Environment</div>
                <div className="mt-1 font-medium">{connection.environment}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Token gültig bis</div>
                <div className="mt-1 font-medium">{connection.expiresAt.toLocaleString()}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Letzter Sync</div>
                <div className="mt-1 font-medium">
                  {connection.lastSyncedAt ? connection.lastSyncedAt.toLocaleString() : "Noch nie"}
                </div>
              </div>
            </div>

            {connection.error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {connection.error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button asChild variant={connection.status === "NEEDS_REAUTH" ? "default" : "outline"}>
                <Link href="/api/brokers/tradovate/connect">
                  <Unplug className="h-4 w-4" />
                  Neu verbinden
                </Link>
              </Button>
              <form action={refreshTradovateAccountsAction}>
                <Button type="submit" variant="outline">
                  <RefreshCw className="h-4 w-4" />
                  Accounts neu laden
                </Button>
              </form>
              <form action={syncTradovateNowAction}>
                <Button type="submit">
                  <UploadCloud className="h-4 w-4" />
                  Jetzt importieren
                </Button>
              </form>
            </div>

            <form action={updateTradovateAccountSelectionAction} className="space-y-3">
              <div className="text-sm font-medium">Zu importierende Konten</div>
              {connection.accounts.length > 0 ? (
                <div className="grid gap-2">
                  {connection.accounts.map((account) => (
                    <label
                      key={account.id}
                      className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="accountIds"
                          value={account.id}
                          defaultChecked={account.enabled}
                          className="h-4 w-4 accent-primary"
                        />
                        <span>
                          <span className="font-medium">{account.name}</span>
                          {account.accountSpec ? (
                            <span className="ml-2 text-muted-foreground">{account.accountSpec}</span>
                          ) : null}
                        </span>
                      </span>
                      {account.enabled ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                  Noch keine Accounts geladen. Klicke auf &quot;Accounts neu laden&quot;.
                </div>
              )}
              <Button type="submit" variant="secondary">Account-Auswahl speichern</Button>
            </form>

            {connection.syncJobs.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm font-medium">Letzte Sync-Jobs</div>
                {connection.syncJobs.map((job) => (
                  <div key={job.id} className="rounded-md border p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{job.status}</span>
                    {" · "}
                    {job.startedAt.toLocaleString()}
                    {" · "}
                    gefunden {job.rowsFound}, importiert {job.rowsImported}, fehlgeschlagen {job.rowsFailed}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
