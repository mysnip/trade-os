# Tradelyst

Trading-Intelligence-MVP für aktives Trade Journaling, CSV/XLSX-Import, Analytics und AI-gestützte Prozess-Insights.

Tradelyst ist keine Signal-Plattform und keine Anlageberatung. Die App analysiert nur vergangene Trades, Verhalten, Setups und Muster.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-artige Komponenten
- PostgreSQL
- Prisma ORM
- Auth.js / NextAuth Credentials Demo Login
- OpenAI API für optionale AI Insights
- Recharts
- CSV/XLSX Import

## Projektstruktur

```txt
app/                    Next.js App Router Seiten und API Routes
components/             UI, Dashboard, Import Wizard, Trade Table
lib/import/             Adapter, Mapping, Normalisierung, Validierung
lib/analytics/          KPI-, Chart- und Pattern-Berechnungen
lib/ai/                 generateTradingInsights(userId, dateRange)
prisma/                 Datenbankschema und Seed-Daten
samples/                Beispiel-CSV
```

## Setup

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Dann öffnen: `http://localhost:3000`

Demo Login:

```txt
demo@tradeos.ai
demo
```

## Linux VServer Deployment

Für einen kleinen eigenen Linux-VServer ist ein Deployment-Setup enthalten:

- GitHub Actions Workflow: `.github/workflows/deploy-vserver.yml`
- Deploy-Script: `scripts/deploy.sh`
- systemd Template: `ops/systemd/tradeos-ai.service`
- nginx Template: `ops/nginx/tradeos-ai.conf`
- Production Env Beispiel: `ops/env/tradeos-ai.env.example`
- Cron Template: `ops/cron/tradeos-ai`

Vollständige Anleitung:

```txt
docs/vserver-deployment.md
```

## Datenmodell

Enthalten sind:

- `User`
- `Trade`
- `Setup`
- `ImportJob`
- `AIInsight`
- `BrokerConnection`
- `BrokerAccount`
- `BrokerSyncJob`
- Auth.js Tabellen: `Account`, `Session`, `VerificationToken`

Enums:

- `TradeDirection`: `LONG`, `SHORT`
- `TradingSession`: `ASIA`, `LONDON`, `NEW_YORK`, `OTHER`
- `ImportJobStatus`: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`

## Wichtige Seiten

- `/dashboard`: Net PnL, Winrate, Profit Factor, Expectancy, Trades, Max Drawdown, AI Summary
- `/import`: CSV/XLSX Upload, Auto-Mapping, manuelles Mapping, Vorschau, Validierung, ImportJob
- `/trades`: Journal-Tabelle mit Suche, Datum, Instrument, Session, Direction, Outcome, Tags und Edit
- `/analytics`: PnL, Setup, Instrument, Weekday, Hour, Direction, Session, R-Multiple Charts
- `/setups`: Setup Library mit Regeln und Setup-Performance
- `/insights`: AI-generierte oder fallback-basierte Insights
- `/settings`: Account, Broker-Quellen, Zeitzone, Währung, Risiko, SaaS-Vorbereitung

## Import Engine

Implementiert:

- `lib/import/adapters/genericCsv.ts`
- `lib/import/adapters/ninjatrader.ts`
- `lib/import/adapters/tradovate.ts`
- `lib/import/normalizeTrade.ts`
- `lib/import/validateTrade.ts`

Vorbereitet:

- Interactive Brokers
- MetaTrader 5
- TradingView Export
- Topstep/Apex/Rithmic-like Exporte

Beispieldatei:

```txt
samples/generic-trades.csv
```

## Tradovate OAuth Import

Tradelyst unterstützt eine erste OAuth-basierte Tradovate-Integration:

1. In Tradovate eine OAuth App registrieren.
2. Redirect URI setzen:

```txt
https://deine-domain.de/api/brokers/tradovate/callback
```

3. Env Vars setzen:

```txt
TRADOVATE_CLIENT_ID
TRADOVATE_CLIENT_SECRET
TRADOVATE_REDIRECT_URI
TRADOVATE_ENVIRONMENT=LIVE oder DEMO
APP_ENCRYPTION_KEY
CRON_SECRET
```

4. In `/settings` auf `Tradovate verbinden` klicken.
5. Nach OAuth die gewünschten Konten aktivieren.
6. `Jetzt importieren` ausführen oder Cron laufen lassen.

Die App speichert Tradovate Access Tokens verschlüsselt. Access Tokens werden per Cron vor Ablauf erneuert.

Vercel Cron ist in `vercel.json` eingerichtet:

```txt
*/15 * * * *  /api/cron/tradovate/refresh-tokens
*/30 * * * *  /api/cron/tradovate/sync
```

Für einen eigenen Linux-Server:

```bash
*/15 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://deine-domain.de/api/cron/tradovate/refresh-tokens >/dev/null
*/30 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://deine-domain.de/api/cron/tradovate/sync >/dev/null
```

Der aktuelle Sync nutzt Tradovate Fills und FillPairs, rekonstruiert daraus abgeschlossene Trades und importiert diese dedupliziert über `importedFrom=tradovate:fillPair:<id>`.

## Analytics Engine

Berechnet automatisch:

- Winrate
- Average Win / Average Loss
- Profit Factor
- Expectancy
- Max Drawdown
- R-Multiple
- Best/Worst Instrument
- Best/Worst Weekday
- Best/Worst Hour
- Session-, Setup- und Direction-Performance
- wiederkehrende Verlustmuster
- profitable Setup-Cluster

## AI Insight Engine

Funktion:

```ts
generateTradingInsights(userId, dateRange)
```

Ablauf:

1. Trades laden
2. Metriken berechnen
3. Muster erkennen
4. OpenAI mit JSON Schema aufrufen, falls `OPENAI_API_KEY` gesetzt ist
5. Insights speichern
6. Ohne API-Key deterministische Fallback-Insights speichern

Die Prompts verbieten Trade-Signale, Kauf-/Verkaufsempfehlungen und Preisprognosen.

## Nächste Meilensteine

- Persistente Settings für Zeitzone, Währung und Risiko
- Broker API Sync
- E-Mail-Import von Statements
- TradingView Webhook Import
- Screenshot-Zuordnung
- Weekly Reports
- Billing-, Team- und Admin-Struktur
