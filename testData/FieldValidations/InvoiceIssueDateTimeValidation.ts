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

export const INVOICE_ISSUE_TIME_FIELD = "Invoice Issue Time";

export type InvoiceIssueTimeScenario = {
  title: string;
  /** Empty string leaves the cell blank (optional field). */
  value: string;
  shouldError: boolean;
};

/**
 * Optional `hh:mm:ss` (00–23 : 00–59 : 00–59).
 * Valid time and a blank cell are accepted. Hour 24, minute 60, second 60,
 * a minus sign, and a special symbol on the hour, minute, or second are rejected.
 */
export function createInvoiceIssueTimeScenarios(): InvoiceIssueTimeScenario[] {
  return [
    {
      title:
        "Invoice Issue Time 08:30:15 should be accepted. (Invoice Issue Time)",
      value: "08:30:15",
      shouldError: false,
    },
    {
      title:
        "A blank Invoice Issue Time should be accepted. (Invoice Issue Time)",
      value: "",
      shouldError: false,
    },
    {
      title:
        "Invoice Issue Time 24:00:00 should be rejected with an error. (Invoice Issue Time)",
      value: "24:00:00",
      shouldError: true,
    },
    {
      title:
        "Invoice Issue Time 12:60:00 should be rejected with an error. (Invoice Issue Time)",
      value: "12:60:00",
      shouldError: true,
    },
    {
      title:
        "Invoice Issue Time 12:00:60 should be rejected with an error. (Invoice Issue Time)",
      value: "12:00:60",
      shouldError: true,
    },
    {
      title:
        "Invoice Issue Time -08:30:15 should be rejected with an error. (Invoice Issue Time)",
      value: "-08:30:15",
      shouldError: true,
    },
    {
      title:
        "Invoice Issue Time 08:-30:15 should be rejected with an error. (Invoice Issue Time)",
      value: "08:-30:15",
      shouldError: true,
    },
    {
      title:
        "Invoice Issue Time 08:30:-15 should be rejected with an error. (Invoice Issue Time)",
      value: "08:30:-15",
      shouldError: true,
    },
    {
      title:
        "Invoice Issue Time @8:30:15 should be rejected with an error. (Invoice Issue Time)",
      value: "@8:30:15",
      shouldError: true,
    },
    {
      title:
        "Invoice Issue Time 08:@0:15 should be rejected with an error. (Invoice Issue Time)",
      value: "08:@0:15",
      shouldError: true,
    },
    {
      title:
        "Invoice Issue Time 08:30:@5 should be rejected with an error. (Invoice Issue Time)",
      value: "08:30:@5",
      shouldError: true,
    },
  ];
}
