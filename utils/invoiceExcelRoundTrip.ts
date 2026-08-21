import path from "node:path";
import { runPythonForStdout } from "./pythonRunner";

export type InvoiceExcelRoundTripRead = {
  dataRowCount: number;
  invoiceNumber: string;
  filled: Record<string, string>;
};

export type InvoiceExcelRoundTripCompare = {
  invoiceNumber: string;
  dataRowCount: number;
  mismatches: string[];
};

const SCRIPT = path.join(__dirname, "invoice_excel_roundtrip.py");

function parseJson<T>(stdout: string, label: string): T {
  try {
    return JSON.parse(stdout.trim()) as T;
  } catch {
    throw new Error(`Invalid ${label} JSON: ${stdout.slice(0, 500)}`);
  }
}

export function readInvoiceExcelRoundTrip(filePath: string): InvoiceExcelRoundTripRead {
  const stdout = runPythonForStdout(SCRIPT, ["read", filePath]);
  const parsed = parseJson<InvoiceExcelRoundTripRead>(stdout, "round-trip read");
  return {
    dataRowCount: Number(parsed.dataRowCount) || 0,
    invoiceNumber: String(parsed.invoiceNumber ?? ""),
    filled: parsed.filled && typeof parsed.filled === "object" ? parsed.filled : {},
  };
}

export function compareInvoiceExcelRoundTrip(
  uploadPath: string,
  downloadPath: string
): InvoiceExcelRoundTripCompare {
  const stdout = runPythonForStdout(SCRIPT, ["compare", uploadPath, downloadPath]);
  const parsed = parseJson<InvoiceExcelRoundTripCompare>(stdout, "round-trip compare");
  return {
    invoiceNumber: String(parsed.invoiceNumber ?? ""),
    dataRowCount: Number(parsed.dataRowCount) || 0,
    mismatches: Array.isArray(parsed.mismatches) ? parsed.mismatches.map(String) : [],
  };
}

export function formatRoundTripMismatchMessage(
  invoiceNumber: string,
  mismatches: string[]
): string {
  const lines = mismatches.map((m) => `- ${m}`).join("\n");
  return `Downloaded Excel missing or mismatch for invoice ${invoiceNumber}:\n${lines}`;
}
