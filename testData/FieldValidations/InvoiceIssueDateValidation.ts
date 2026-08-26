export type InvoiceIssueDateScenario = {
  name: string;
  invoicePrefix: string;
  shouldError: boolean;
  issueDateValue: Date | string | number;
  issueDateFormat: string;
};

function randomAlphaNumeric(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function buildDynamicInvoiceNumber(prefix: string): string {
  return `${prefix}-${Date.now()}-${randomAlphaNumeric(4)}`;
}

/** Calendar date in Asia/Muscat as YYYY-MM-DD (IBR-171-OM). */
function muscatYmd(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Muscat",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Tomorrow in Asia/Muscat (YYYY-MM-DD) — must fail IBR-171-OM. */
export function muscatTomorrowYmd(): string {
  const [y, m, d] = muscatYmd().split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1, 12, 0, 0));
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(next);
}

/**
 * Aligns with testcase matrix date coverage:
 * correct YYYY-MM-DD, other allowed dd-mm-yyyy, wrong format, text, whitespace,
 * future date (IBR-171-OM / Asia/Muscat).
 */
export function createInvoiceIssueDateScenarios(): InvoiceIssueDateScenario[] {
  return [
    {
      name: "correct YYYY-MM-DD format",
      invoicePrefix: "INV-DATE",
      shouldError: false,
      issueDateValue: new Date(),
      issueDateFormat: "yyyy-mm-dd",
    },
    {
      name: "allowed dd-mm-yyyy format",
      invoicePrefix: "INV-DATEFMT",
      shouldError: false,
      issueDateValue: new Date(),
      issueDateFormat: "dd-mm-yyyy",
    },
    {
      name: "a future date (Muscat tomorrow)",
      invoicePrefix: "INV-DATE-FUTURE",
      shouldError: true,
      issueDateValue: muscatTomorrowYmd(),
      issueDateFormat: "yyyy-mm-dd",
    },
    {
      name: "an invalid calendar date 31/02/2026",
      invoicePrefix: "INV-DATE-BADFMT",
      shouldError: true,
      issueDateValue: "31/02/2026",
      issueDateFormat: "@",
    },
    {
      name: "non-date text",
      invoicePrefix: "INV-DATE-INVALID",
      shouldError: true,
      issueDateValue: "tesr2345",
      issueDateFormat: "@",
    },
    {
      name: "whitespace only",
      invoicePrefix: "INV-DATE-WS",
      shouldError: true,
      issueDateValue: "        ",
      issueDateFormat: "@",
    },
  ];
}

/** Shared inputs for explicit tests in field-validation specs (invalid date). */
export const invoiceIssueDateInvalidRi8 = {
  invoicePrefix: "INV-DATE-INVALID",
  issueDateValue: "31/02/2026" as const,
  issueDateFormat: "@",
};

export const invoiceIssueDateEmpty = {
  invoicePrefix: "INV-DATE-EMPTY",
  issueDateValue: "" as const,
  issueDateFormat: "yyyy-mm-dd",
};
