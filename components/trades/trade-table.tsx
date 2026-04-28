"use client";

import { useId, useMemo, useState } from "react";
import { Edit, ImagePlus, Plus, Search, X } from "lucide-react";

import { createTradeAction, updateTradeAction } from "@/app/trades/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Trade manuell hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Trade manuell hinzufügen</DialogTitle>
            </DialogHeader>
            <TradeForm
              action={createTradeAction}
              allMistakeTags={allMistakeTags}
              setups={setups}
              submitLabel="Trade speichern"
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Suche nach Instrument, Setup, Tags..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <Select value={instrument} onValueChange={setInstrument}>
          <SelectTrigger><SelectValue placeholder="Instrument" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Instrumente</SelectItem>
            {instruments.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={session} onValueChange={setSession}>
          <SelectTrigger><SelectValue placeholder="Session" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Sessions</SelectItem>
            <SelectItem value="ASIA">Asia</SelectItem>
            <SelectItem value="LONDON">London</SelectItem>
            <SelectItem value="NEW_YORK">New York</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={outcome} onValueChange={setOutcome}>
          <SelectTrigger><SelectValue placeholder="Gewinn/Verlust" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Outcomes</SelectItem>
            <SelectItem value="win">Gewinner</SelectItem>
            <SelectItem value="loss">Verlierer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Select value={direction} onValueChange={setDirection}>
          <SelectTrigger><SelectValue placeholder="Direction" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Long & Short</SelectItem>
            <SelectItem value="LONG">Long</SelectItem>
            <SelectItem value="SHORT">Short</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        <div className="rounded-md border p-3 text-sm text-muted-foreground">
          {filtered.length} von {trades.length} Trades angezeigt
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Instrument</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Session</TableHead>
            <TableHead>Setup</TableHead>
            <TableHead>PnL</TableHead>
            <TableHead>R</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>{new Date(trade.entryTime).toLocaleString()}</TableCell>
              <TableCell className="font-medium">{trade.instrument}</TableCell>
              <TableCell>{trade.direction}</TableCell>
              <TableCell>{trade.session}</TableCell>
              <TableCell>{trade.setupName ?? <span className="text-muted-foreground">Unassigned</span>}</TableCell>
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
                    <Button variant="ghost" size="icon" title="Trade bearbeiten">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{trade.instrument} Trade bearbeiten</DialogTitle>
                    </DialogHeader>
                    <TradeForm
                      action={updateTradeAction}
                      allMistakeTags={allMistakeTags}
                      trade={trade}
                      setups={setups}
                      submitLabel="Änderungen speichern"
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
  const today = new Date().toISOString();

  return (
    <form action={action} className="space-y-5">
      {trade ? <input type="hidden" name="id" value={trade.id} /> : null}

      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Broker">
          <Input name="broker" defaultValue={trade?.broker ?? ""} placeholder="Tradovate" />
        </Field>
        <Field label="Account">
          <Input name="accountName" defaultValue={trade?.accountName ?? ""} placeholder="Evaluation" />
        </Field>
        <Field label="Instrument">
          <Input name="instrument" defaultValue={trade?.instrument ?? ""} placeholder="NQ" required />
        </Field>
        <Field label="Direction">
          <Select name="direction" defaultValue={trade?.direction ?? "LONG"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LONG">Long</SelectItem>
              <SelectItem value="SHORT">Short</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Entry Date">
          <Input type="date" name="entryDate" defaultValue={datePart(trade?.entryTime) || datePart(today)} required />
        </Field>
        <Field label="Entry Time">
          <Input type="time" name="entryTime" defaultValue={timePart(trade?.entryTime) || "09:30"} required />
        </Field>
        <Field label="Exit Date">
          <Input type="date" name="exitDate" defaultValue={datePart(trade?.exitTime)} />
        </Field>
        <Field label="Exit Time">
          <Input type="time" name="exitTime" defaultValue={timePart(trade?.exitTime)} />
        </Field>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Entry Price">
          <Input type="number" step="any" name="entryPrice" defaultValue={numberValue(trade?.entryPrice)} required />
        </Field>
        <Field label="Exit Price">
          <Input type="number" step="any" name="exitPrice" defaultValue={numberValue(trade?.exitPrice)} />
        </Field>
        <Field label="Quantity">
          <Input type="number" step="any" name="quantity" defaultValue={numberValue(trade?.quantity) || "1"} required />
        </Field>
        <Field label="Net PnL">
          <Input type="number" step="any" name="netPnl" defaultValue={numberValue(trade?.netPnl)} required />
        </Field>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Gross PnL">
          <Input type="number" step="any" name="grossPnl" defaultValue={numberValue(trade?.grossPnl)} />
        </Field>
        <Field label="Commission">
          <Input type="number" step="any" name="commission" defaultValue={numberValue(trade?.commission)} />
        </Field>
        <Field label="Fees">
          <Input type="number" step="any" name="fees" defaultValue={numberValue(trade?.fees)} />
        </Field>
        <Field label="Risk Amount">
          <Input type="number" step="any" name="riskAmount" defaultValue={numberValue(trade?.riskAmount)} />
        </Field>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Field label="R Multiple">
          <Input type="number" step="any" name="rMultiple" defaultValue={numberValue(trade?.rMultiple)} placeholder="Auto if risk exists" />
        </Field>
        <Field label="Stop Loss">
          <Input type="number" step="any" name="stopLoss" defaultValue={numberValue(trade?.stopLoss)} />
        </Field>
        <Field label="Take Profit">
          <Input type="number" step="any" name="takeProfit" defaultValue={numberValue(trade?.takeProfit)} />
        </Field>
        <Field label="Session">
          <Select name="session" defaultValue={trade?.session ?? "AUTO"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="AUTO">Auto erkennen</SelectItem>
              <SelectItem value="ASIA">Asia</SelectItem>
              <SelectItem value="LONDON">London</SelectItem>
              <SelectItem value="NEW_YORK">New York</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Setup">
          <Select name="setupId" defaultValue={trade?.setupId ?? "none"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Kein Setup</SelectItem>
              {setups.map((setup) => <SelectItem key={setup.id} value={setup.id}>{setup.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Emotion vorher">
          <Input name="emotionBefore" defaultValue={trade?.emotionBefore ?? ""} />
        </Field>
        <Field label="Emotion nachher">
          <Input name="emotionAfter" defaultValue={trade?.emotionAfter ?? ""} />
        </Field>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Screenshot">
          <ScreenshotInput initialValue={trade?.screenshotUrl ?? ""} />
        </Field>
        <Field label="Imported From">
          <Input name="importedFrom" defaultValue={trade?.importedFrom ?? "manual"} />
        </Field>
      </div>

      <Field label="Mistake Tags">
        <TagInput
          initialTags={trade?.mistakeTags ?? []}
          name="mistakeTags"
          suggestions={allMistakeTags}
        />
      </Field>

      <Field label="Notizen">
        <Textarea name="notes" defaultValue={trade?.notes ?? ""} />
      </Field>

      <Button type="submit">{submitLabel}</Button>
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
                title={`${tag} entfernen`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            className="min-w-36 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground"
            placeholder={tags.length ? "Tag hinzufügen..." : "late entry, moved stop"}
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
              Neues Tag &quot;{draft.trim()}&quot;
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ScreenshotInput({ initialValue }: { initialValue: string }) {
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
          <img src={screenshotUrl} alt="Trade screenshot preview" className="max-h-56 w-full object-contain" />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button asChild type="button" variant="outline">
          <label htmlFor={id} className="cursor-pointer">
            <ImagePlus className="h-4 w-4" />
            {busy ? "Verarbeite..." : screenshotUrl ? "Screenshot ersetzen" : "Screenshot hochladen"}
          </label>
        </Button>
        {screenshotUrl ? (
          <Button type="button" variant="ghost" onClick={() => setScreenshotUrl("")}>
            Entfernen
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
        MVP: Das Bild wird komprimiert und direkt am Trade gespeichert.
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
