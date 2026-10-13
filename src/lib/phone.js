/**
 * Pakistani Mobile Phone Number Normalization & Validation Utility.
 * Ensures orders have verified 11-digit mobile numbers for WhatsApp & calling.
 */

/**
 * Normalizes input phone string into clean 11-digit format (03XXXXXXXXX).
 * Handles formats like:
 * - 0300 1234567 -> 03001234567
 * - 0300-1234567 -> 03001234567
 * - +92 300 1234567 -> 03001234567
 * - 923001234567 -> 03001234567
 * - 3001234567 -> 03001234567
 */
export function normalizePakistaniPhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');

  if (digits.startsWith('923') && digits.length === 12) {
    return '0' + digits.slice(2);
  }
  if (digits.startsWith('00923') && digits.length === 14) {
    return '0' + digits.slice(4);
  }
  if (digits.startsWith('3') && digits.length === 10) {
    return '0' + digits;
  }
  return digits;
}

/**
 * Validates if the phone number is a valid 11-digit Pakistani mobile number.
 * Must start with '03' and have exactly 11 digits.
 * Rejects obvious dummy inputs (e.g. 03000000000, 03111111111, 03123456789).
 */
export function isValidPakistaniPhone(raw) {
  if (!raw) return false;
  const norm = normalizePakistaniPhone(raw);

  // Must be strictly 11 digits starting with 03
  if (!/^03\d{9}$/.test(norm)) {
    return false;
  }

  const rest = norm.slice(2);

  // Reject repeating dummy digits (e.g. 03000000000, 03111111111, 03999999999)
  if (/^(\d)\1{8}$/.test(rest)) {
    return false;
  }

  // Reject sequential test numbers
  if (rest === '123456789' || rest === '987654321') {
    return false;
  }

  return true;
}

/**
 * Formats 11-digit mobile number for clean display: 0300 1234567
 */
export function formatPhoneDisplay(raw) {
  const norm = normalizePakistaniPhone(raw);
  if (norm.length === 11 && norm.startsWith('03')) {
    return `${norm.slice(0, 4)} ${norm.slice(4)}`;
  }
  return raw;
}
