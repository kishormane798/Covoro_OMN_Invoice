/** Invoice # helpers for min/max and negative field-validation specs. */
export function buildInvoiceNumber(value: string, maxLen = 64): string {
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen);
}

export function randomAlphaNumeric(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
