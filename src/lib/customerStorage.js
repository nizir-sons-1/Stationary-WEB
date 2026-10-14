/**
 * Customer profile persistence utilities.
 * Handles loading, saving, and clearing customer details (name, phone, address)
 * from browser localStorage with safe exception handling for private browsing / SSR.
 */

export const CUSTOMER_STORAGE_KEY = 'nazir_saved_customer';

export function loadSavedCustomer() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomerInfo(info) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(info));
  } catch {
    // Ignore storage quota / private browsing errors
  }
}

export function clearSavedCustomer() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
