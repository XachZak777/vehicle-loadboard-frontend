// ─── Shared validation helpers ────────────────────────────────────────────────

/** Standard email check */
export const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

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
