export const locales = ["de", "en"] as const;
export const localeCookieName = "tradelyst_locale";

export type Locale = (typeof locales)[number];

const de = {
  common: {
    language: "Sprache",
    german: "Deutsch",
    english: "English",
    compliance: "Compliance",
    none: "Keine",
    unassigned: "Nicht zugeordnet",
    never: "Noch nie",
    confidence: "Konfidenz",
    remove: "Entfernen",
    processing: "Verarbeite...",
    save: "Speichern",
    cancel: "Abbrechen",
    autoDetect: "Auto erkennen"
  },
  appShell: {
    tagline: "Trade Journal Intelligence",
    nav: {
      dashboard: "Dashboard",
      import: "Import",
      trades: "Trades",
      analytics: "Analytics",
      setups: "Setups",
      insights: "Insights",
      settings: "Settings"
    },
    compliance: "Keine Anlageberatung. Tradelyst analysiert ausschließlich vergangene Trades.",
    login: "Login",
    logout: "Logout"
  },
  login: {
    title: "Tradelyst",
    subtitle: "Organisiere deine Trades, erkenne Muster und analysiere deinen Prozess.",
    email: "Email",
    password: "Passwort",
    submit: "Login",
    failed: "Login fehlgeschlagen.",
    inviteOnly: "Zugang nur per Einladung. Wenn du noch keinen Account hast, brauchst du einen Invite-Link.",
    inviteAccepted: "Einladung angenommen. Du kannst dich jetzt einloggen."
  },
  invite: {
    title: "Einladung annehmen",
    subtitle: "Lege dein Passwort fest, um deinen Tradelyst-Zugang zu aktivieren.",
    invalidTitle: "Invite-Link ungültig",
    invalidText: "Dieser Invite-Link ist ungültig, abgelaufen oder wurde bereits verwendet.",
    email: "Email",
    name: "Name",
    password: "Passwort",
    confirmPassword: "Passwort bestätigen",
    accept: "Account aktivieren",
    passwordHelp: "Mindestens 8 Zeichen.",
    errors: {
      invalid: "Die Einladung konnte nicht verarbeitet werden.",
      password: "Die Passwörter stimmen nicht überein oder sind zu kurz.",
      expired: "Diese Einladung ist abgelaufen.",
      used: "Diese Einladung wurde bereits verwendet."
    }
  },
  complianceNote: {
    text: "Tradelyst ist keine Signal-Plattform und bietet keine Anlageberatung. Die App analysiert ausschließlich vergangene Trades, Verhaltensmuster und Prozessqualität. Keine Gewinnversprechen."
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Importiere deine Trades automatisch und erkenne, warum du wirklich Geld gewinnst oder verlierst.",
    importTrades: "Trades importieren",
    aiSummary: "AI Summary",
    noInsights: "Noch keine AI Insights. Generiere sie nach dem ersten Import auf der Insights-Seite.",
    patterns: "Automatisch erkannte Muster",
    noPatterns: "Mehr Trades verbessern die Mustererkennung."
  },
  analytics: {
    title: "Analytics",
    subtitle: "Performance, Setups, Sessions, Instrumente und Verhalten auf einen Blick.",
    noTrades: "Noch keine Trades importiert."
  },
  importPage: {
    title: "Trade Import",
    subtitle: "Importiere CSV/XLSX-Dateien, mappe Broker-Spalten und prüfe fehlerhafte Zeilen vor dem Speichern."
  },
  importWizard: {
    uploadTitle: "1. Datei hochladen",
    chooseFile: "CSV oder XLSX auswählen",
    fileHelp: "Generic, Tradovate, NinjaTrader und ähnliche Broker-Exports",
    loaded: "Geladen",
    mappingTitle: "2. Quelle und Spalten-Mapping",
    source: "Import-Quelle",
    detectedRows: "erkannte Zeilen",
    detectedColumns: "erkannte Spalten",
    doNotMap: "Nicht mappen",
    missingRequired: "Pflichtfelder fehlen",
    previewTitle: "3. Vorschau und Import",
    importTrades: "Trades importieren",
    failed: "Import fehlgeschlagen.",
    resultTitle: "Import-Ergebnis",
    resultSummary: "{imported} von {total} Zeilen importiert, {failed} fehlerhaft.",
    row: "Zeile",
    field: "Feld",
    error: "Fehler",
    fieldLabels: {
      broker: "Broker",
      accountName: "Konto",
      instrument: "Symbol / Instrument",
      direction: "Kauf/Verkauf / Richtung",
      entryTime: "Open Time / Entry Time",
      exitTime: "Close Time / Exit Time",
      entryPrice: "Open Price / Entry Price",
      exitPrice: "Close Price / Exit Price",
      quantity: "Menge / Kontrakte",
      grossPnl: "Brutto PnL",
      netPnl: "Netto PnL / Gewinn",
      commission: "Kommission",
      fees: "Gebühren",
      riskAmount: "Risikobetrag",
      stopLoss: "Stop Loss",
      takeProfit: "Take Profit",
      notes: "Notizen"
    }
  },
  trades: {
    title: "Trade Journal",
    subtitle: "Filtere, tagge und dokumentiere deine Trades ohne Trade-Signale oder Anlageberatung.",
    cardTitle: "Trades",
    addManual: "Trade manuell hinzufügen",
    addManualTitle: "Trade manuell hinzufügen",
    saveTrade: "Trade speichern",
    editTitle: "{instrument} Trade bearbeiten",
    saveChanges: "Änderungen speichern",
    searchPlaceholder: "Suche nach Instrument, Setup, Tags...",
    allInstruments: "Alle Instrumente",
    allSessions: "Alle Sessions",
    allOutcomes: "Alle Outcomes",
    winners: "Gewinner",
    losers: "Verlierer",
    longShort: "Long & Short",
    shown: "{shown} von {total} Trades angezeigt",
    date: "Datum",
    instrument: "Instrument",
    direction: "Direction",
    outcome: "Gewinn/Verlust",
    session: "Session",
    setup: "Setup",
    tags: "Tags",
    editTrade: "Trade bearbeiten",
    sessionLabels: {
      ASIA: "Asia",
      LONDON: "London",
      NEW_YORK: "New York",
      OTHER: "Sonstige"
    },
    fields: {
      broker: "Broker",
      account: "Account",
      entryDate: "Entry Date",
      entryTime: "Entry Time",
      exitDate: "Exit Date",
      exitTime: "Exit Time",
      entryPrice: "Entry Price",
      exitPrice: "Exit Price",
      quantity: "Quantity",
      netPnl: "Net PnL",
      grossPnl: "Gross PnL",
      commission: "Commission",
      fees: "Fees",
      riskAmount: "Risk Amount",
      rMultiple: "R Multiple",
      stopLoss: "Stop Loss",
      takeProfit: "Take Profit",
      emotionBefore: "Emotion vorher",
      emotionAfter: "Emotion nachher",
      screenshot: "Screenshot",
      importedFrom: "Imported From",
      mistakeTags: "Mistake Tags",
      notes: "Notizen"
    },
    noSetup: "Kein Setup",
    rAutoPlaceholder: "Automatisch, wenn Risiko vorhanden",
    addTag: "Tag hinzufügen...",
    tagPlaceholder: "late entry, moved stop",
    removeTag: "{tag} entfernen",
    newTag: "Neues Tag \"{tag}\"",
    screenshotAlt: "Trade Screenshot Vorschau",
    replaceScreenshot: "Screenshot ersetzen",
    uploadScreenshot: "Screenshot hochladen",
    screenshotHelp: "MVP: Das Bild wird komprimiert und direkt am Trade gespeichert."
  },
  insights: {
    title: "AI Insights",
    subtitle: "Erkennt wiederkehrende Fehler, profitable Cluster und Prozessmuster aus vergangenen Trades.",
    generate: "Insights generieren",
    compliance: "Keine Kauf-/Verkaufsempfehlungen. Die AI analysiert ausschließlich historische Performance, Verhalten, Setups und Risikoprozesse.",
    processImprovement: "Prozess-Verbesserung",
    empty: "Noch keine Insights gespeichert. Importiere Trades und starte die Analyse."
  },
  setups: {
    title: "Setup Library",
    subtitle: "Definiere Playbooks, ordne Trades zu und prüfe, welche Setups echten Erwartungswert haben.",
    create: "Setup anlegen",
    name: "Name",
    description: "Beschreibung",
    marketConditions: "Market Conditions",
    entryCriteria: "Entry Criteria",
    exitCriteria: "Exit Criteria",
    invalidation: "Invalidation",
    save: "Setup speichern",
    expectancy: "Expectancy",
    entry: "Entry",
    exit: "Exit"
  },
  settings: {
    title: "Settings",
    subtitle: "Account-, Broker-, Zeitzonen-, Währungs- und Risikoeinstellungen für die nächste Ausbaustufe.",
    account: "Account",
    name: "Name",
    timezone: "Zeitzone",
    currency: "Währung",
    brokerAutomation: "Broker & Automationen",
    brokerText1: "Tradovate OAuth Sync ist aktiv vorbereitet. NinjaTrader, Interactive Brokers, MT5 und Rithmic-ähnliche Exporte bleiben als nächste Adapter geplant.",
    brokerText2: "Geplant: E-Mail-Import, TradingView Webhook, Screenshot-Zuordnung, Wochenreport und Alert-Regeln.",
    brokerText3: "Pricing vorbereitet: Free, Pro, Elite mit Trade-Limits, AI Insights und später Broker Sync.",
    risk: "Risikoeinstellungen",
    standardRisk: "Standard Risk pro Trade",
    maxDailyLoss: "Max Daily Loss",
    compliance1: "Tradelyst analysiert nur vergangene Trades.",
    compliance2: "Keine Anlageberatung. Keine Signale. Keine Gewinnversprechen.",
    compliance3: "User bleiben für alle Trading-Entscheidungen selbst verantwortlich.",
    notices: {
      missingConfig: "Tradovate OAuth ist noch nicht konfiguriert. Setze TRADOVATE_CLIENT_ID, TRADOVATE_CLIENT_SECRET und TRADOVATE_REDIRECT_URI in deiner .env und starte den Server neu.",
      connected: "Tradovate wurde verbunden. Wähle jetzt die Konten aus, die importiert werden sollen.",
      error: "Tradovate konnte nicht verbunden werden. Prüfe OAuth App, Redirect URI und Server-Logs."
    }
  },
  tradovate: {
    title: "Tradovate OAuth Import",
    description: "Verbinde Tradovate per OAuth, wähle Konten aus und importiere Fills automatisch ins Journal.",
    intro: "Du wirst zu Tradovate weitergeleitet. Danach lädt Tradelyst die verfügbaren Accounts und du entscheidest, welche importiert werden.",
    connect: "Tradovate verbinden",
    environment: "Environment",
    tokenValidUntil: "Token gültig bis",
    lastSync: "Letzter Sync",
    reconnect: "Neu verbinden",
    reloadAccounts: "Accounts neu laden",
    importNow: "Jetzt importieren",
    accountsToImport: "Zu importierende Konten",
    noAccounts: "Noch keine Accounts geladen. Klicke auf \"Accounts neu laden\".",
    saveSelection: "Account-Auswahl speichern",
    recentJobs: "Letzte Sync-Jobs",
    foundImportedFailed: "gefunden {found}, importiert {imported}, fehlgeschlagen {failed}"
  },
  charts: {
    pnlOverTime: "PnL over time",
    pnlByInstrument: "PnL by Instrument",
    pnlByWeekday: "PnL by Weekday",
    pnlByHour: "PnL by Hour",
    sessionPerformance: "Session Performance",
    longVsShort: "Long vs Short Performance",
    rDistribution: "R-Multiple Distribution",
    winrateBySetup: "Winrate by Setup"
  },
  kpis: {
    netPnl: "Net PnL",
    winrate: "Winrate",
    profitFactor: "Profit Factor",
    expectancy: "Expectancy",
    trades: "Trades",
    maxDrawdown: "Max Drawdown",
    averageWin: "Average Win",
    averageLoss: "Average Loss",
    averageR: "Average R",
    bestInstrument: "Best Instrument",
    worstHour: "Worst Hour",
    bestWeekday: "Best Weekday",
    worstInstrument: "Worst Instrument"
  }
} as const;

type DeepWiden<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : T[K] extends object ? DeepWiden<T[K]> : T[K];
};

export type Dictionary = DeepWiden<typeof de>;

const en: Dictionary = {
  common: {
    language: "Language",
    german: "Deutsch",
    english: "English",
    compliance: "Compliance",
    none: "None",
    unassigned: "Unassigned",
    never: "Never",
    confidence: "Confidence",
    remove: "Remove",
    processing: "Processing...",
    save: "Save",
    cancel: "Cancel",
    autoDetect: "Auto detect"
  },
  appShell: {
    tagline: "Trade Journal Intelligence",
    nav: {
      dashboard: "Dashboard",
      import: "Import",
      trades: "Trades",
      analytics: "Analytics",
      setups: "Setups",
      insights: "Insights",
      settings: "Settings"
    },
    compliance: "No investment advice. Tradelyst only analyzes past trades.",
    login: "Log in",
    logout: "Log out"
  },
  login: {
    title: "Tradelyst",
    subtitle: "Organize your trades, spot patterns, and analyze your process.",
    email: "Email",
    password: "Password",
    submit: "Log in",
    failed: "Login failed.",
    inviteOnly: "Access is invite-only. If you do not have an account yet, you need an invite link.",
    inviteAccepted: "Invite accepted. You can log in now."
  },
  invite: {
    title: "Accept invite",
    subtitle: "Set your password to activate your Tradelyst account.",
    invalidTitle: "Invalid invite link",
    invalidText: "This invite link is invalid, expired, or has already been used.",
    email: "Email",
    name: "Name",
    password: "Password",
    confirmPassword: "Confirm password",
    accept: "Activate account",
    passwordHelp: "At least 8 characters.",
    errors: {
      invalid: "The invite could not be processed.",
      password: "The passwords do not match or are too short.",
      expired: "This invite has expired.",
      used: "This invite has already been used."
    }
  },
  complianceNote: {
    text: "Tradelyst is not a signal platform and does not provide investment advice. The app only analyzes past trades, behavior patterns, and process quality. No profit promises."
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Import your trades automatically and understand why you really make or lose money.",
    importTrades: "Import trades",
    aiSummary: "AI Summary",
    noInsights: "No AI insights yet. Generate them on the Insights page after your first import.",
    patterns: "Automatically detected patterns",
    noPatterns: "More trades improve pattern detection."
  },
  analytics: {
    title: "Analytics",
    subtitle: "Performance, setups, sessions, instruments, and behavior at a glance.",
    noTrades: "No trades imported yet."
  },
  importPage: {
    title: "Trade Import",
    subtitle: "Import CSV/XLSX files, map broker columns, and review invalid rows before saving."
  },
  importWizard: {
    uploadTitle: "1. Upload file",
    chooseFile: "Choose CSV or XLSX",
    fileHelp: "Generic, Tradovate, NinjaTrader, and similar broker exports",
    loaded: "Loaded",
    mappingTitle: "2. Source and column mapping",
    source: "Import source",
    detectedRows: "detected rows",
    detectedColumns: "detected columns",
    doNotMap: "Do not map",
    missingRequired: "Missing required fields",
    previewTitle: "3. Preview and import",
    importTrades: "Import trades",
    failed: "Import failed.",
    resultTitle: "Import result",
    resultSummary: "{imported} of {total} rows imported, {failed} invalid.",
    row: "Row",
    field: "Field",
    error: "Error",
    fieldLabels: {
      broker: "Broker",
      accountName: "Account",
      instrument: "Symbol / instrument",
      direction: "Buy/Sell / direction",
      entryTime: "Open time / entry time",
      exitTime: "Close time / exit time",
      entryPrice: "Open price / entry price",
      exitPrice: "Close price / exit price",
      quantity: "Quantity / contracts",
      grossPnl: "Gross PnL",
      netPnl: "Net PnL / profit",
      commission: "Commission",
      fees: "Fees",
      riskAmount: "Risk amount",
      stopLoss: "Stop loss",
      takeProfit: "Take profit",
      notes: "Notes"
    }
  },
  trades: {
    title: "Trade Journal",
    subtitle: "Filter, tag, and document your trades without trade signals or investment advice.",
    cardTitle: "Trades",
    addManual: "Add trade manually",
    addManualTitle: "Add trade manually",
    saveTrade: "Save trade",
    editTitle: "Edit {instrument} trade",
    saveChanges: "Save changes",
    searchPlaceholder: "Search by instrument, setup, tags...",
    allInstruments: "All instruments",
    allSessions: "All sessions",
    allOutcomes: "All outcomes",
    winners: "Winners",
    losers: "Losers",
    longShort: "Long & Short",
    shown: "{shown} of {total} trades shown",
    date: "Date",
    instrument: "Instrument",
    direction: "Direction",
    outcome: "Win/Loss",
    session: "Session",
    setup: "Setup",
    tags: "Tags",
    editTrade: "Edit trade",
    sessionLabels: {
      ASIA: "Asia",
      LONDON: "London",
      NEW_YORK: "New York",
      OTHER: "Other"
    },
    fields: {
      broker: "Broker",
      account: "Account",
      entryDate: "Entry date",
      entryTime: "Entry time",
      exitDate: "Exit date",
      exitTime: "Exit time",
      entryPrice: "Entry price",
      exitPrice: "Exit price",
      quantity: "Quantity",
      netPnl: "Net PnL",
      grossPnl: "Gross PnL",
      commission: "Commission",
      fees: "Fees",
      riskAmount: "Risk amount",
      rMultiple: "R multiple",
      stopLoss: "Stop loss",
      takeProfit: "Take profit",
      emotionBefore: "Emotion before",
      emotionAfter: "Emotion after",
      screenshot: "Screenshot",
      importedFrom: "Imported from",
      mistakeTags: "Mistake tags",
      notes: "Notes"
    },
    noSetup: "No setup",
    rAutoPlaceholder: "Auto if risk exists",
    addTag: "Add tag...",
    tagPlaceholder: "late entry, moved stop",
    removeTag: "Remove {tag}",
    newTag: "New tag \"{tag}\"",
    screenshotAlt: "Trade screenshot preview",
    replaceScreenshot: "Replace screenshot",
    uploadScreenshot: "Upload screenshot",
    screenshotHelp: "MVP: The image is compressed and stored directly on the trade."
  },
  insights: {
    title: "AI Insights",
    subtitle: "Detects recurring mistakes, profitable clusters, and process patterns from past trades.",
    generate: "Generate insights",
    compliance: "No buy/sell recommendations. AI only analyzes historical performance, behavior, setups, and risk processes.",
    processImprovement: "Process improvement",
    empty: "No insights saved yet. Import trades and start the analysis."
  },
  setups: {
    title: "Setup Library",
    subtitle: "Define playbooks, assign trades, and check which setups have real expectancy.",
    create: "Create setup",
    name: "Name",
    description: "Description",
    marketConditions: "Market conditions",
    entryCriteria: "Entry criteria",
    exitCriteria: "Exit criteria",
    invalidation: "Invalidation",
    save: "Save setup",
    expectancy: "Expectancy",
    entry: "Entry",
    exit: "Exit"
  },
  settings: {
    title: "Settings",
    subtitle: "Account, broker, timezone, currency, and risk settings for the next expansion stage.",
    account: "Account",
    name: "Name",
    timezone: "Timezone",
    currency: "Currency",
    brokerAutomation: "Broker & automations",
    brokerText1: "Tradovate OAuth sync is actively prepared. NinjaTrader, Interactive Brokers, MT5, and Rithmic-like exports remain planned as next adapters.",
    brokerText2: "Planned: email import, TradingView webhook, screenshot matching, weekly report, and alert rules.",
    brokerText3: "Pricing prepared: Free, Pro, Elite with trade limits, AI insights, and later broker sync.",
    risk: "Risk settings",
    standardRisk: "Default risk per trade",
    maxDailyLoss: "Max daily loss",
    compliance1: "Tradelyst only analyzes past trades.",
    compliance2: "No investment advice. No signals. No profit promises.",
    compliance3: "Users remain responsible for all trading decisions.",
    notices: {
      missingConfig: "Tradovate OAuth is not configured yet. Set TRADOVATE_CLIENT_ID, TRADOVATE_CLIENT_SECRET, and TRADOVATE_REDIRECT_URI in your .env and restart the server.",
      connected: "Tradovate has been connected. Now choose the accounts to import.",
      error: "Tradovate could not be connected. Check the OAuth app, redirect URI, and server logs."
    }
  },
  tradovate: {
    title: "Tradovate OAuth Import",
    description: "Connect Tradovate via OAuth, choose accounts, and automatically import fills into the journal.",
    intro: "You will be redirected to Tradovate. After that, Tradelyst loads the available accounts and you decide which ones to import.",
    connect: "Connect Tradovate",
    environment: "Environment",
    tokenValidUntil: "Token valid until",
    lastSync: "Last sync",
    reconnect: "Reconnect",
    reloadAccounts: "Reload accounts",
    importNow: "Import now",
    accountsToImport: "Accounts to import",
    noAccounts: "No accounts loaded yet. Click \"Reload accounts\".",
    saveSelection: "Save account selection",
    recentJobs: "Recent sync jobs",
    foundImportedFailed: "found {found}, imported {imported}, failed {failed}"
  },
  charts: {
    pnlOverTime: "PnL over time",
    pnlByInstrument: "PnL by instrument",
    pnlByWeekday: "PnL by weekday",
    pnlByHour: "PnL by hour",
    sessionPerformance: "Session performance",
    longVsShort: "Long vs short performance",
    rDistribution: "R-multiple distribution",
    winrateBySetup: "Winrate by setup"
  },
  kpis: {
    netPnl: "Net PnL",
    winrate: "Winrate",
    profitFactor: "Profit factor",
    expectancy: "Expectancy",
    trades: "Trades",
    maxDrawdown: "Max drawdown",
    averageWin: "Average win",
    averageLoss: "Average loss",
    averageR: "Average R",
    bestInstrument: "Best instrument",
    worstHour: "Worst hour",
    bestWeekday: "Best weekday",
    worstInstrument: "Worst instrument"
  }
};

const dictionaries: Record<Locale, Dictionary> = { de, en };

export function normalizeLocale(value?: string | null): Locale {
  return value === "en" ? "en" : "de";
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  );
}
