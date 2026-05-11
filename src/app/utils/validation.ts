// ─── Shared validation helpers ────────────────────────────────────────────────

// ─── Input sanitizers (call before storing in state) ─────────────────────────

/** Strips everything except digits — for MC, DOT, ZIP, year, etc. */
export const sanitizeDigits = (v: string) => v.replace(/\D/g, '');

/** Strips everything except digits and a single decimal point — for price, weight, insurance amounts */
export const sanitizeDecimal = (v: string) => {
  const stripped = v.replace(/[^\d.]/g, '');
  const parts = stripped.split('.');
  return parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : stripped;
};

/** Strips everything except digits and a single hyphen (for EIN: XX-XXXXXXX / SSN: XXX-XX-XXXX) */
export const sanitizeTaxId = (v: string) => v.replace(/[^\d-]/g, '');

/** Basic email format check (internal use only — prefer isBusinessEmail for user-facing validation) */
export const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const BLOCKED_DOMAINS = new Set([
  // Test / placeholder domains
  'test.com', 'test.net', 'test.org', 'test.io', 'test.co',
  'example.com', 'example.net', 'example.org', 'example.io',
  'sample.com', 'fake.com', 'fakeemail.com', 'invalid.com',
  'nomail.com', 'noemail.com', 'notreal.com', 'nope.com',
  'domain.com', 'email.com', 'mail.test', 'user.com',
  // Disposable / throwaway services
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info',
  'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamailblock.com',
  '10minutemail.com', '10minutemail.net', '10minutemail.org',
  'tempmail.com', 'tempmail.net', 'temp-mail.org', 'temp-mail.io',
  'temporarymail.com', 'throwam.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'grr.la',
  'spam4.me', 'trashmail.com', 'trashmail.net', 'trashmail.io',
  'trash-mail.com', 'mailnull.com', 'dispostable.com',
  'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
  'fakeinbox.com', 'fakebox.net', 'mailnesia.com', 'mailtothis.com',
  'dodgit.com', 'spamfree24.org', 'jetable.org', 'spambox.us',
  'anonymbox.com', 'filzmail.com', 'getnada.com', 'mailboxy.fun',
  'discard.email', 'maildrop.cc', 'binkmail.com',
  'nospamfor.us', 'mailexpire.com', 'spamex.com', 'spaml.com',
  'getairmail.com', 'spammotel.com', 'mailscrap.com', 'spamoff.de',
]);

/**
 * Email must pass format check AND come from a non-disposable, non-test domain.
 * Accepts personal providers (gmail, yahoo, etc.) and any legitimate company domain.
 */
export const isBusinessEmail = (v: string): boolean => {
  const email = v.trim().toLowerCase();
  if (!isValidEmail(email)) return false;
  const domain = email.split('@')[1] ?? '';
  if (BLOCKED_DOMAINS.has(domain)) return false;
  // Domain must have a real-looking structure: at least one dot, TLD ≥ 2 chars
  const parts = domain.split('.');
  if (parts.length < 2) return false;
  const tld = parts[parts.length - 1];
  if (tld.length < 2) return false;
  // Local part (before @) must be meaningful
  const local = email.split('@')[0];
  if (local.length < 2) return false;
  return true;
};

export const businessEmailError =
  'Use a real email address (e.g. Gmail, Outlook, or your company domain). Disposable and test addresses are not accepted.';

/**
 * US / Canadian phone number.
 * Accepts: 10 bare digits, or formatted like (555) 123-4567, 555-123-4567, +1 555 123 4567
 */
export const isValidPhone = (v: string) =>
  /^(\+1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(v.trim());

/** Strips all non-digit characters and returns the raw digit string */
export const digitsOnly = (v: string) => v.replace(/\D/g, '');

/** USDOT number: 1–8 digits (no leading zeros required by FMCSA, but no letters) */
export const isValidDotNumber = (v: string) =>
  /^\d{1,8}$/.test(v.trim());

/**
 * MC (Motor Carrier) number.
 * Accepts bare digits only (1–7 digits).
 */
export const isValidMcNumber = (v: string) =>
  /^\d{1,7}$/.test(v.trim());

/**
 * EIN: XX-XXXXXXX (9 digits total, formatted or bare)
 */
export const isValidEIN = (v: string) =>
  /^\d{2}-?\d{7}$/.test(v.trim());

/**
 * SSN: XXX-XX-XXXX (9 digits total, formatted or bare)
 */
export const isValidSSN = (v: string) =>
  /^\d{3}-?\d{2}-?\d{4}$/.test(v.trim());

/** US ZIP code: 5 digits, or 5+4 (ZIP+4) */
export const isValidZip = (v: string) =>
  /^\d{5}(-\d{4})?$/.test(v.trim());

/** City name: 2–100 alphabetic/space/hyphen/apostrophe characters */
export const isValidCity = (v: string) =>
  /^[a-zA-Z\s'\-\.]{2,100}$/.test(v.trim());

/** Street address: at least 5 characters */
export const isValidStreetAddress = (v: string) =>
  v.trim().length >= 5 && v.trim().length <= 200;

/** Generic company / business name: 2–100 printable characters */
export const isValidCompanyName = (v: string) =>
  v.trim().length >= 2 && v.trim().length <= 100;

/** Generic text name (person / city / state) min 2, max given */
export const isValidName = (v: string, min = 2, max = 100) =>
  v.trim().length >= min && v.trim().length <= max;

/** Person first or last name: letters, spaces, hyphens, apostrophes, 2–50 chars */
export const isValidPersonName = (v: string) =>
  /^[a-zA-ZÀ-ÖØ-öø-ÿ'\-\s]{2,50}$/.test(v.trim());

/** Year established: 4-digit year between 1800 and current year */
export const isValidYearEstablished = (v: string) => {
  const n = parseInt(v, 10);
  return !isNaN(n) && String(n).length === 4 && n >= 1800 && n <= new Date().getFullYear();
};

/** VIN: exactly 17 alphanumeric chars, no I/O/Q */
export const isValidVin = (v: string) =>
  /^[A-HJ-NPR-Z0-9]{17}$/i.test(v.trim());

/** Alphanumeric ID (license numbers, auction access #, order IDs): 1–40 printable chars */
export const isValidAlphanumericId = (v: string) =>
  /^[a-zA-Z0-9\-\s]{1,40}$/.test(v.trim());

/**
 * Password strength for new account creation.
 * Min 8 chars, at least one uppercase letter and one digit.
 */
export const isStrongPassword = (v: string) =>
  v.length >= 8 && /[A-Z]/.test(v) && /\d/.test(v);

/** Returns a human-readable password requirement string */
export const passwordRequirementsText =
  'At least 8 characters, one uppercase letter, and one number.';

/**
 * Insurance dollar amount: positive number, max $999,999,999
 */
export const isValidInsuranceAmount = (v: string) => {
  const n = parseFloat(v);
  return !isNaN(n) && n > 0 && n <= 999_999_999;
};

/**
 * Vehicle year: between 1900 and (current year + 2)
 */
export const isValidVehicleYear = (v: string) => {
  const n = parseInt(v, 10);
  const maxYear = new Date().getFullYear() + 2;
  return !isNaN(n) && n >= 1900 && n <= maxYear;
};

/**
 * Positive price / weight: up to $999,999
 */
export const isValidPrice = (v: string) => {
  const n = parseFloat(v);
  return !isNaN(n) && n > 0 && n <= 999_999;
};

export const isValidWeight = (v: string) => {
  const n = parseFloat(v);
  return !isNaN(n) && n > 0 && n <= 100_000;
};

// ─── Batch validator helpers ──────────────────────────────────────────────────

export type FieldErrors = Record<string, string>;

/** Returns a new errors object (or undefined) after running all checks. */
export function buildErrors(checks: Array<[condition: boolean, field: string, message: string]>): FieldErrors {
  const errs: FieldErrors = {};
  for (const [invalid, field, msg] of checks) {
    if (invalid && !errs[field]) errs[field] = msg;
  }
  return errs;
}
