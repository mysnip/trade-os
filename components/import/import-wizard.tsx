"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import { CheckCircle2, FileSpreadsheet, Loader2, Upload, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { detectAdapter, importAdapters } from "@/lib/import/adapters";
import type { ColumnMapping, ImportField, RawImportRow, ValidationIssue } from "@/lib/import/types";
import { importFieldLabels, requiredImportFields } from "@/lib/import/types";

const fields = Object.keys(importFieldLabels) as ImportField[];

type ImportResult = {
  status: string;
  rowsTotal: number;
  rowsImported: number;
  rowsFailed: number;
  errorLog: ValidationIssue[];
};

export function ImportWizard() {
  const [filename, setFilename] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<RawImportRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [source, setSource] = useState("generic-csv");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const missingRequired = useMemo(
    () => requiredImportFields.filter((field) => !mapping[field]),
    [mapping]
  );

  async function parseFile(file: File) {
    setError(null);
    setResult(null);
    setFilename(file.name);

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension === "xlsx" || extension === "xls") {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedRows = XLSX.utils.sheet_to_json<RawImportRow>(sheet, { defval: "" });
      hydrateRows(parsedRows);
      return;
    }

    Papa.parse<RawImportRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parseResult) => hydrateRows(parseResult.data),
      error: (parseError) => setError(parseError.message)
    });
  }

  function hydrateRows(parsedRows: RawImportRow[]) {
    const cleanRows = parsedRows.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").trim().length > 0)
    );
    const discoveredHeaders = Object.keys(cleanRows[0] ?? {});
    const adapter = detectAdapter(discoveredHeaders);
    setRows(cleanRows);
    setHeaders(discoveredHeaders);
    setSource(adapter.id);
    setMapping(adapter.suggestMapping(discoveredHeaders));
  }

  async function submitImport() {
    setLoading(true);
    setError(null);
    setResult(null);
    const response = await fetch("/api/import/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, source, rows, mapping })
    });
    const body = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(body.error ?? "Import fehlgeschlagen.");
      return;
    }
    setResult(body);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Datei hochladen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-background/50 px-4 text-center hover:bg-secondary/40">
            <FileSpreadsheet className="mb-3 h-8 w-8 text-primary" />
            <span className="font-medium">CSV oder XLSX auswählen</span>
            <span className="mt-1 text-sm text-muted-foreground">
              Generic, Tradovate, NinjaTrader und ähnliche Broker-Exports
            </span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void parseFile(file);
              }}
            />
          </label>
          {filename ? <div className="text-sm text-muted-foreground">Geladen: {filename}</div> : null}
        </CardContent>
      </Card>

      {headers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>2. Quelle und Spalten-Mapping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="mb-2 text-sm font-medium">Import-Quelle</div>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {importAdapters.map((adapter) => (
                      <SelectItem key={adapter.id} value={adapter.id}>
                        {adapter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md border p-3 text-sm">
                <div className="font-medium">{rows.length}</div>
                <div className="text-muted-foreground">erkannte Zeilen</div>
              </div>
              <div className="rounded-md border p-3 text-sm">
                <div className="font-medium">{headers.length}</div>
                <div className="text-muted-foreground">erkannte Spalten</div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {fields.map((field) => (
                <div key={field} className="space-y-2">
                  <div className="text-sm font-medium">
                    {importFieldLabels[field]}
                    {requiredImportFields.includes(field) ? <span className="text-primary"> *</span> : null}
                  </div>
                  <Select
                    value={mapping[field] ?? "__none__"}
                    onValueChange={(value) =>
                      setMapping((current) => ({
                        ...current,
                        [field]: value === "__none__" ? undefined : value
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nicht mappen</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {missingRequired.length > 0 ? (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                Pflichtfelder fehlen: {missingRequired.map((field) => importFieldLabels[field]).join(", ")}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {rows.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>3. Vorschau und Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.slice(0, 8).map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 5).map((row, index) => (
                  <TableRow key={index}>
                    {headers.slice(0, 8).map((header) => (
                      <TableCell key={header}>{String(row[header] ?? "")}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button onClick={submitImport} disabled={loading || missingRequired.length > 0}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Trades importieren
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Import-Ergebnis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              {result.rowsImported} von {result.rowsTotal} Zeilen importiert, {result.rowsFailed} fehlerhaft.
            </div>
            {result.errorLog.length > 0 ? (
              <div className="max-h-56 overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zeile</TableHead>
                      <TableHead>Feld</TableHead>
                      <TableHead>Fehler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.errorLog.slice(0, 25).map((issue, index) => (
                      <TableRow key={`${issue.rowIndex}-${index}`}>
                        <TableCell>{issue.rowIndex}</TableCell>
                        <TableCell>{issue.field ?? "-"}</TableCell>
                        <TableCell>{issue.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
