"use client";

import { useMemo, useState } from "react";
import { Edit, Plus, Search } from "lucide-react";

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
            <TradeForm action={createTradeAction} setups={setups} submitLabel="Trade speichern" />
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
  trade,
  setups,
  submitLabel
}: {
  action: (formData: FormData) => void | Promise<void>;
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
        <Field label="Screenshot URL">
          <Input name="screenshotUrl" defaultValue={trade?.screenshotUrl ?? ""} />
        </Field>
        <Field label="Imported From">
          <Input name="importedFrom" defaultValue={trade?.importedFrom ?? "manual"} />
        </Field>
      </div>

      <Field label="Mistake Tags">
        <Input name="mistakeTags" defaultValue={trade?.mistakeTags.join(", ") ?? ""} placeholder="late entry, moved stop" />
      </Field>

      <Field label="Notizen">
        <Textarea name="notes" defaultValue={trade?.notes ?? ""} />
      </Field>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
