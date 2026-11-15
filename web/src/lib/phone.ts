/**
 * Normalize an Israeli mobile number to E.164 (+9725XXXXXXXX).
 * Only Israeli mobile numbers (05X) are accepted: one free scan per real
 * phone is the main anti-abuse control, and local mobiles are much harder
 * to mass-produce than virtual international numbers.
 */
export function normalizeIsraeliMobile(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  let national: string;
  if (digits.startsWith("+972")) national = "0" + digits.slice(4);
  else if (digits.startsWith("00972")) national = "0" + digits.slice(5);
  else if (digits.startsWith("972")) national = "0" + digits.slice(3);
  else national = digits;
  if (!/^05\d{8}$/.test(national)) return null;
  return "+972" + national.slice(1);
}

/** 050-123-4567 style, for display. */
export function formatIsraeliMobile(e164: string): string {
  const national = "0" + e164.replace("+972", "");
  return `${national.slice(0, 3)}-${national.slice(3, 6)}-${national.slice(6)}`;
}

/** Hide the middle digits, e.g. 050-***-4567. */
export function maskPhone(e164: string): string {
  const f = formatIsraeliMobile(e164);
  return `${f.slice(0, 4)}***${f.slice(7)}`;
}
