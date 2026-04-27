"use client";

import { useMemo, useState } from "react";
import { Edit, Search } from "lucide-react";

import { updateTradeAction } from "@/app/trades/actions";
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
  netPnl: number;
  rMultiple: number | null;
  session: "ASIA" | "LONDON" | "NEW_YORK" | "OTHER";
  setupId: string | null;
  setupName: string | null;
  notes: string | null;
  emotionBefore: string | null;
  emotionAfter: string | null;
  mistakeTags: string[];
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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{trade.instrument} Trade bearbeiten</DialogTitle>
                    </DialogHeader>
                    <form action={updateTradeAction} className="space-y-4">
                      <input type="hidden" name="id" value={trade.id} />
                      <div className="space-y-2">
                        <Label>Setup</Label>
                        <Select name="setupId" defaultValue={trade.setupId ?? "none"}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Kein Setup</SelectItem>
                            {setups.map((setup) => <SelectItem key={setup.id} value={setup.id}>{setup.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`before-${trade.id}`}>Emotion vorher</Label>
                          <Input id={`before-${trade.id}`} name="emotionBefore" defaultValue={trade.emotionBefore ?? ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`after-${trade.id}`}>Emotion nachher</Label>
                          <Input id={`after-${trade.id}`} name="emotionAfter" defaultValue={trade.emotionAfter ?? ""} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`tags-${trade.id}`}>Mistake Tags</Label>
                        <Input id={`tags-${trade.id}`} name="mistakeTags" defaultValue={trade.mistakeTags.join(", ")} placeholder="late entry, moved stop" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`notes-${trade.id}`}>Notizen</Label>
                        <Textarea id={`notes-${trade.id}`} name="notes" defaultValue={trade.notes ?? ""} />
                      </div>
                      <Button type="submit">Speichern</Button>
                    </form>
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
