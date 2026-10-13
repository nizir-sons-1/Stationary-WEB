import { describe, it, expect, beforeEach } from 'vitest';
import {
  CUSTOMER_STORAGE_KEY,
  loadSavedCustomer,
  saveCustomerInfo,
  clearSavedCustomer,
} from '../../pages/Cart';

describe('Cart Customer Storage Helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty object when nothing is saved in localStorage', () => {
    expect(loadSavedCustomer()).toEqual({});
  });

  it('saves and loads customer information correctly', () => {
    const profile = {
      fullName: 'Muhammad Ali',
      phone: '03001234567',
      email: 'ali@example.com',
      address: 'Shop 12, Urdu Bazar, Lahore',
    };

    saveCustomerInfo(profile);
    const loaded = loadSavedCustomer();

    expect(loaded).toEqual(profile);
    expect(localStorage.getItem(CUSTOMER_STORAGE_KEY)).toBe(JSON.stringify(profile));
  });

  it('gracefully handles corrupted JSON in localStorage', () => {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, '{invalid_json:::');
    expect(loadSavedCustomer()).toEqual({});
  });

  it('clears saved customer information from localStorage', () => {
    saveCustomerInfo({ fullName: 'Test User' });
    expect(loadSavedCustomer().fullName).toBe('Test User');

    clearSavedCustomer();
    expect(loadSavedCustomer()).toEqual({});
    expect(localStorage.getItem(CUSTOMER_STORAGE_KEY)).toBeNull();
  });
});
