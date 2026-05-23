/**
 * Helpers for the home electricity meter reference code and the
 * Libyan mobile number used during registration / profile editing.
 */

/**
 * Generate an auto meter reference, e.g. "MTR-AJ-04821".
 * Region defaults to AJ (Ajdabiya). Editable later by the user.
 */
export function generateMeterRef(regionCode = 'AJ') {
  const digits = Math.floor(10000 + Math.random() * 90000); // 5 digits
  return `MTR-${regionCode}-${digits}`;
}

/**
 * Libyan mobile number validation.
 * Accepts 10-digit local form starting 09 (e.g. 0912345678)
 * or the international +218 9XXXXXXXX form.
 */
export function isValidLibyanMobile(value) {
  if (!value) return false;
  const cleaned = value.replace(/[\s-]/g, '');
  return /^09\d{8}$/.test(cleaned) || /^\+2189\d{8}$/.test(cleaned);
}

/** Normalize a mobile number for storage (strip spaces / dashes). */
export function normalizeMobile(value) {
  return (value ?? '').replace(/[\s-]/g, '');
}
