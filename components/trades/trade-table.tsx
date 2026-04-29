"use client";

import { useId, useMemo, useState } from "react";
import { Edit, ImagePlus, Plus, Search, X } from "lucide-react";

import { createTradeAction, updateTradeAction } from "@/app/trades/actions";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { interpolate } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

export type TradeRow = {
  id: string;
  instrument: string;
  direction: "LONG" | "SHORT";
  entryTime: string;
  exitTime: string | null;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  broker: string | null;
  accountName: string | null;
  grossPnl: number | null;
  netPnl: number;
  commission: number | null;
  fees: number | null;
  riskAmount: number | null;
  rMultiple: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  session: "ASIA" | "LONDON" | "NEW_YORK" | "OTHER";
  setupId: string | null;
  setupName: string | null;
  notes: string | null;
  emotionBefore: string | null;
  emotionAfter: string | null;
  mistakeTags: string[];
  screenshotUrl: string | null;
  importedFrom: string | null;
};

export type SetupOption = {
  id: string;
  name: string;
};

export function TradeTable({ trades, setups }: { trades: TradeRow[]; setups: SetupOption[] }) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const [instrument, setInstrument] = useState("all");
  const [session, setSession] = useState("all");
  const [direction, setDirection] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const instruments = useMemo(() => Array.from(new Set(trades.map((trade) => trade.instrument))).sort(), [trades]);
  const allMistakeTags = useMemo(
    () =>
      Array.from(new Set(trades.flatMap((trade) => trade.mistakeTags).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [trades]
  );
  const filtered = useMemo(() => {
    return trades.filter((trade) => {
      const haystack = `${trade.instrument} ${trade.setupName ?? ""} ${trade.notes ?? ""} ${trade.mistakeTags.join(" ")}`.toLowerCase();
      return (
        (!query || haystack.includes(query.toLowerCase())) &&
        (instrument === "all" || trade.instrument === instrument) &&
        (session === "all" || trade.session === session) &&
        (direction === "all" || trade.direction === direction) &&
        (outcome === "all" || (outcome === "win" ? trade.netPnl > 0 : trade.netPnl < 0)) &&
        (!dateFrom || new Date(trade.entryTime) >= new Date(dateFrom)) &&
        (!dateTo || new Date(trade.entryTime) <= new Date(`${dateTo}T23:59:59`))
      );
    });
  }, [dateFrom, dateTo, direction, instrument, outcome, query, session, trades]);
  const dateLocale = locale === "de" ? "de-DE" : "en-US";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              {t.trades.addManual}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.trades.addManualTitle}</DialogTitle>
            </DialogHeader>
            <TradeForm
              action={createTradeAction}
              allMistakeTags={allMistakeTags}
              setups={setups}
              submitLabel={t.trades.saveTrade}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder={t.trades.searchPlaceholder} value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <Select value={instrument} onValueChange={setInstrument}>
          <SelectTrigger><SelectValue placeholder="Instrument" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.trades.allInstruments}</SelectItem>
            {instruments.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={session} onValueChange={setSession}>
          <SelectTrigger><SelectValue placeholder={t.trades.session} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.trades.allSessions}</SelectItem>
            <SelectItem value="ASIA">{t.trades.sessionLabels.ASIA}</SelectItem>
            <SelectItem value="LONDON">{t.trades.sessionLabels.LONDON}</SelectItem>
            <SelectItem value="NEW_YORK">{t.trades.sessionLabels.NEW_YORK}</SelectItem>
            <SelectItem value="OTHER">{t.trades.sessionLabels.OTHER}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={outcome} onValueChange={setOutcome}>
          <SelectTrigger><SelectValue placeholder={t.trades.outcome} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.trades.allOutcomes}</SelectItem>
            <SelectItem value="win">{t.trades.winners}</SelectItem>
            <SelectItem value="loss">{t.trades.losers}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Select value={direction} onValueChange={setDirection}>
          <SelectTrigger><SelectValue placeholder={t.trades.direction} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.trades.longShort}</SelectItem>
            <SelectItem value="LONG">Long</SelectItem>
            <SelectItem value="SHORT">Short</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        <div className="rounded-md border p-3 text-sm text-muted-foreground">
          {interpolate(t.trades.shown, { shown: filtered.length, total: trades.length })}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.trades.date}</TableHead>
            <TableHead>{t.trades.instrument}</TableHead>
            <TableHead>{t.trades.direction}</TableHead>
            <TableHead>{t.trades.session}</TableHead>
            <TableHead>{t.trades.setup}</TableHead>
            <TableHead>PnL</TableHead>
            <TableHead>R</TableHead>
            <TableHead>{t.trades.tags}</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>{new Date(trade.entryTime).toLocaleString(dateLocale)}</TableCell>
              <TableCell className="font-medium">{trade.instrument}</TableCell>
              <TableCell>{trade.direction}</TableCell>
              <TableCell>{t.trades.sessionLabels[trade.session]}</TableCell>
              <TableCell>{trade.setupName ?? <span className="text-muted-foreground">{t.common.unassigned}</span>}</TableCell>
              <TableCell className={trade.netPnl >= 0 ? "text-primary" : "text-destructive"}>
                {formatCurrency(trade.netPnl)}
              </TableCell>
              <TableCell>{trade.rMultiple?.toFixed(2) ?? "-"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {trade.mistakeTags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" title={t.trades.editTrade}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{interpolate(t.trades.editTitle, { instrument: trade.instrument })}</DialogTitle>
                    </DialogHeader>
                    <TradeForm
                      action={updateTradeAction}
                      allMistakeTags={allMistakeTags}
                      trade={trade}
                      setups={setups}
                      submitLabel={t.trades.saveChanges}
                    />
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function datePart(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function timePart(value?: string | null) {
  if (!value) return "";
  return value.slice(11, 16);
}

function numberValue(value?: number | null) {
  return value === null || value === undefined ? "" : String(value);
}

function TradeForm({
  action,
  allMistakeTags,
  trade,
  setups,
  submitLabel
}: {
  action: (formData: FormData) => void | Promise<void>;
  allMistakeTags: string[];
  trade?: TradeRow;
  setups: SetupOption[];
  submitLabel: string;
}) {
  const { t } = useI18n();
  const today = new Date().toISOString();

  return (
    <form action={action} className="space-y-5">
      {trade ? <input type="hidden" name="id" value={trade.id} /> : null}

      <Tabs defaultValue="essentials" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-3">
          <TabsTrigger value="essentials">{t.trades.formTabs.essentials}</TabsTrigger>
          <TabsTrigger value="execution">{t.trades.formTabs.execution}</TabsTrigger>
          <TabsTrigger value="journal">{t.trades.formTabs.journal}</TabsTrigger>
        </TabsList>

        <TabsContent value="essentials" className="space-y-4">
          <FormSection title={t.trades.formSections.essentials} description={t.trades.formSections.essentialsHelp}>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={t.trades.instrument}>
                <Input name="instrument" defaultValue={trade?.instrument ?? ""} placeholder="NQ" required />
              </Field>
              <Field label={t.trades.direction}>
                <Select name="direction" defaultValue={trade?.direction ?? "LONG"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LONG">Long</SelectItem>
                    <SelectItem value="SHORT">Short</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t.trades.fields.quantity}>
                <Input type="number" step="any" name="quantity" defaultValue={numberValue(trade?.quantity) || "1"} required />
              </Field>
              <Field label={t.trades.fields.netPnl}>
                <Input type="number" step="any" name="netPnl" defaultValue={numberValue(trade?.netPnl)} required />
              </Field>
            </div>
          </FormSection>

          <FormSection title={t.trades.formSections.timing}>
            <div className="grid gap-3 md:grid-cols-5">
              <Field label={t.trades.fields.entryDate}>
                <Input type="date" name="entryDate" defaultValue={datePart(trade?.entryTime) || datePart(today)} required />
              </Field>
              <Field label={t.trades.fields.entryTime}>
                <Input type="time" name="entryTime" defaultValue={timePart(trade?.entryTime) || "09:30"} required />
              </Field>
              <Field label={t.trades.fields.exitDate}>
                <Input type="date" name="exitDate" defaultValue={datePart(trade?.exitTime)} />
              </Field>
              <Field label={t.trades.fields.exitTime}>
                <Input type="time" name="exitTime" defaultValue={timePart(trade?.exitTime)} />
              </Field>
              <Field label={t.trades.session}>
                <Select name="session" defaultValue={trade?.session ?? "AUTO"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTO">{t.common.autoDetect}</SelectItem>
                    <SelectItem value="ASIA">{t.trades.sessionLabels.ASIA}</SelectItem>
                    <SelectItem value="LONDON">{t.trades.sessionLabels.LONDON}</SelectItem>
                    <SelectItem value="NEW_YORK">{t.trades.sessionLabels.NEW_YORK}</SelectItem>
                    <SelectItem value="OTHER">{t.trades.sessionLabels.OTHER}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FormSection>
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <FormSection title={t.trades.formSections.execution}>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label={t.trades.fields.entryPrice}>
                <Input type="number" step="any" name="entryPrice" defaultValue={numberValue(trade?.entryPrice)} required />
              </Field>
              <Field label={t.trades.fields.exitPrice}>
                <Input type="number" step="any" name="exitPrice" defaultValue={numberValue(trade?.exitPrice)} />
              </Field>
              <Field label={t.trades.fields.rMultiple}>
                <Input type="number" step="any" name="rMultiple" defaultValue={numberValue(trade?.rMultiple)} placeholder={t.trades.rAutoPlaceholder} />
              </Field>
              <Field label={t.trades.fields.riskAmount}>
                <Input type="number" step="any" name="riskAmount" defaultValue={numberValue(trade?.riskAmount)} />
              </Field>
              <Field label={t.trades.fields.stopLoss}>
                <Input type="number" step="any" name="stopLoss" defaultValue={numberValue(trade?.stopLoss)} />
              </Field>
              <Field label={t.trades.fields.takeProfit}>
                <Input type="number" step="any" name="takeProfit" defaultValue={numberValue(trade?.takeProfit)} />
              </Field>
            </div>
          </FormSection>

          <FormSection title={t.trades.formSections.costs}>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label={t.trades.fields.grossPnl}>
                <Input type="number" step="any" name="grossPnl" defaultValue={numberValue(trade?.grossPnl)} />
              </Field>
              <Field label={t.trades.fields.commission}>
                <Input type="number" step="any" name="commission" defaultValue={numberValue(trade?.commission)} />
              </Field>
              <Field label={t.trades.fields.fees}>
                <Input type="number" step="any" name="fees" defaultValue={numberValue(trade?.fees)} />
              </Field>
              <Field label={t.trades.fields.broker}>
                <Input name="broker" defaultValue={trade?.broker ?? ""} placeholder="Tradovate" />
              </Field>
              <Field label={t.trades.fields.account}>
                <Input name="accountName" defaultValue={trade?.accountName ?? ""} placeholder="Evaluation" />
              </Field>
              <Field label={t.trades.fields.importedFrom}>
                <Input name="importedFrom" defaultValue={trade?.importedFrom ?? "manual"} />
              </Field>
            </div>
          </FormSection>
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          <FormSection title={t.trades.formSections.journal}>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label={t.trades.setup}>
                <Select name="setupId" defaultValue={trade?.setupId ?? "none"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.trades.noSetup}</SelectItem>
                    {setups.map((setup) => <SelectItem key={setup.id} value={setup.id}>{setup.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t.trades.fields.emotionBefore}>
                <Input name="emotionBefore" defaultValue={trade?.emotionBefore ?? ""} />
              </Field>
              <Field label={t.trades.fields.emotionAfter}>
                <Input name="emotionAfter" defaultValue={trade?.emotionAfter ?? ""} />
              </Field>
            </div>

            <Field label={t.trades.fields.mistakeTags}>
              <TagInput
                initialTags={trade?.mistakeTags ?? []}
                name="mistakeTags"
                suggestions={allMistakeTags}
              />
            </Field>

            <Field label={t.trades.fields.notes}>
              <Textarea name="notes" defaultValue={trade?.notes ?? ""} className="min-h-28" />
            </Field>
          </FormSection>

          <FormSection title={t.trades.formSections.media}>
            <Field label={t.trades.fields.screenshot}>
              <ScreenshotInput initialValue={trade?.screenshotUrl ?? ""} />
            </Field>
          </FormSection>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 -mx-1 flex justify-end border-t bg-background/95 px-1 pt-4 backdrop-blur">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

function TagInput({
  initialTags,
  name,
  suggestions
}: {
  initialTags: string[];
  name: string;
  suggestions: string[];
}) {
  const { t } = useI18n();
  const [tags, setTags] = useState(() => uniqueTags(initialTags));
  const [draft, setDraft] = useState("");
  const normalizedDraft = draft.trim().toLowerCase();
  const visibleSuggestions = suggestions
    .filter((suggestion) => !tags.some((tag) => tag.toLowerCase() === suggestion.toLowerCase()))
    .filter((suggestion) => !normalizedDraft || suggestion.toLowerCase().includes(normalizedDraft))
    .slice(0, 6);
  const hasExactSuggestion = visibleSuggestions.some(
    (suggestion) => suggestion.toLowerCase() === normalizedDraft
  );

  function addTag(value: string) {
    const tag = value.trim().replace(/^,+|,+$/g, "");
    if (!tag) return;
    setTags((current) => uniqueTags([...current, tag]));
    setDraft("");
  }

  function removeTag(value: string) {
    setTags((current) => current.filter((tag) => tag !== value));
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={tags.join(", ")} />
      <div className="min-h-10 rounded-md border bg-background px-2 py-2 focus-within:ring-2 focus-within:ring-ring">
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                className="rounded-sm p-0.5 hover:bg-background/80"
                onClick={() => removeTag(tag)}
                title={interpolate(t.trades.removeTag, { tag })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            className="min-w-36 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground"
            placeholder={tags.length ? t.trades.addTag : t.trades.tagPlaceholder}
            value={draft}
            onBlur={() => addTag(draft)}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                addTag(draft);
              }
              if (event.key === "Backspace" && !draft && tags.length > 0) {
                event.preventDefault();
                setTags((current) => current.slice(0, -1));
              }
            }}
          />
        </div>
      </div>
      {visibleSuggestions.length > 0 || normalizedDraft ? (
        <div className="flex flex-wrap gap-2">
          {visibleSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="rounded-md border px-2.5 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => addTag(suggestion)}
            >
              {suggestion}
            </button>
          ))}
          {normalizedDraft && !hasExactSuggestion ? (
            <button
              type="button"
              className="rounded-md border border-primary/50 px-2.5 py-1 text-xs text-primary hover:bg-primary/10"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => addTag(draft)}
            >
              {interpolate(t.trades.newTag, { tag: draft.trim() })}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ScreenshotInput({ initialValue }: { initialValue: string }) {
  const { t } = useI18n();
  const id = useId();
  const [screenshotUrl, setScreenshotUrl] = useState(initialValue);
  const [busy, setBusy] = useState(false);

  async function handleFile(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      setScreenshotUrl(await compressImageToDataUrl(file));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="screenshotUrl" value={screenshotUrl} />
      {screenshotUrl ? (
        <div className="overflow-hidden rounded-md border bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={screenshotUrl} alt={t.trades.screenshotAlt} className="max-h-56 w-full object-contain" />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button asChild type="button" variant="outline">
          <label htmlFor={id} className="cursor-pointer">
            <ImagePlus className="h-4 w-4" />
            {busy ? t.common.processing : screenshotUrl ? t.trades.replaceScreenshot : t.trades.uploadScreenshot}
          </label>
        </Button>
        {screenshotUrl ? (
          <Button type="button" variant="ghost" onClick={() => setScreenshotUrl("")}>
            {t.common.remove}
          </Button>
        ) : null}
      </div>
      <input
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <p className="text-xs text-muted-foreground">
        {t.trades.screenshotHelp}
      </p>
    </div>
  );
}

function uniqueTags(values: string[]) {
  const seen = new Set<string>();
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

async function compressImageToDataUrl(file: File) {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function FormSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-md border bg-card/40 p-4">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
