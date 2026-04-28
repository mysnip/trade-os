import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TradovateSettings } from "@/components/settings/tradovate-settings";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server";

export default async function SettingsPage({
  searchParams
}: {
  searchParams?: { tradovate?: string };
}) {
  const userId = await requireUserId();
  const tradovateConnection = await loadTradovateConnection(userId);
  const tradovateNotice = getTradovateNotice(searchParams?.tradovate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Account-, Broker-, Zeitzonen-, Währungs- und Risikoeinstellungen für die nächste Ausbaustufe.
        </p>
      </div>

      {tradovateNotice ? (
        <div className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
          {tradovateNotice}
        </div>
      ) : null}

      <TradovateSettings connection={tradovateConnection} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="Demo Trader" />
            </div>
            <div className="space-y-2">
              <Label>Zeitzone</Label>
              <Select defaultValue="Europe/Berlin">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Währung</Label>
              <Select defaultValue="USD">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Broker & Automationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-md border p-3">
              Tradovate OAuth Sync ist aktiv vorbereitet. NinjaTrader, Interactive Brokers, MT5 und Rithmic-ähnliche Exporte bleiben als nächste Adapter geplant.
            </div>
            <div className="rounded-md border p-3">
              Geplant: E-Mail-Import, TradingView Webhook, Screenshot-Zuordnung, Wochenreport und Alert-Regeln.
            </div>
            <div className="rounded-md border p-3">
              Pricing vorbereitet: Free, Pro, Elite mit Trade-Limits, AI Insights und später Broker Sync.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risikoeinstellungen</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label>Standard Risk pro Trade</Label>
              <Input type="number" placeholder="250" />
            </div>
            <div className="space-y-2">
              <Label>Max Daily Loss</Label>
              <Input type="number" placeholder="1000" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Tradelyst analysiert nur vergangene Trades.</p>
            <p>Keine Anlageberatung. Keine Signale. Keine Gewinnversprechen.</p>
            <p>User bleiben für alle Trading-Entscheidungen selbst verantwortlich.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function loadTradovateConnection(userId: string) {
  try {
    return await prisma.brokerConnection.findFirst({
      where: { userId, provider: "TRADOVATE" },
      include: {
        accounts: { orderBy: { name: "asc" } },
        syncJobs: { orderBy: { startedAt: "desc" }, take: 5 }
      }
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

function getTradovateNotice(status?: string) {
  if (status === "missing-config") {
    return "Tradovate OAuth ist noch nicht konfiguriert. Setze TRADOVATE_CLIENT_ID, TRADOVATE_CLIENT_SECRET und TRADOVATE_REDIRECT_URI in deiner .env und starte den Server neu.";
  }
  if (status === "connected") return "Tradovate wurde verbunden. Wähle jetzt die Konten aus, die importiert werden sollen.";
  if (status === "error") return "Tradovate konnte nicht verbunden werden. Prüfe OAuth App, Redirect URI und Server-Logs.";
  return null;
}
