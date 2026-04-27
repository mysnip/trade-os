import { guessColumnMapping } from "@/lib/import/columnMapping";

export const genericCsvAdapter = {
  id: "generic-csv",
  label: "Generic CSV/XLSX",
  detect(headers: string[]) {
    const mapping = guessColumnMapping(headers);
    return Object.keys(mapping).length >= 4;
  },
  suggestMapping: guessColumnMapping
};
