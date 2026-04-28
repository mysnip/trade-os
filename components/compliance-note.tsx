import { ShieldCheck } from "lucide-react";

export function ComplianceNote() {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <p>
        Tradelyst ist keine Signal-Plattform und bietet keine Anlageberatung. Die App analysiert
        ausschließlich vergangene Trades, Verhaltensmuster und Prozessqualität. Keine Gewinnversprechen.
      </p>
    </div>
  );
}
