import { describe, it, expect } from 'vitest';
import { normalizePakistaniPhone, isValidPakistaniPhone, formatPhoneDisplay } from '../phone';

describe('Pakistani Phone Number Utility', () => {
  it('normalizes various phone input formats to clean 11 digits', () => {
    expect(normalizePakistaniPhone('0300 1234567')).toBe('03001234567');
    expect(normalizePakistaniPhone('0300-1234567')).toBe('03001234567');
    expect(normalizePakistaniPhone('+92 300 1234567')).toBe('03001234567');
    expect(normalizePakistaniPhone('923001234567')).toBe('03001234567');
    expect(normalizePakistaniPhone('3001234567')).toBe('03001234567');
    expect(normalizePakistaniPhone('00923001234567')).toBe('03001234567');
  });

  it('validates genuine Pakistani mobile numbers as true', () => {
    expect(isValidPakistaniPhone('03001234567')).toBe(true);
    expect(isValidPakistaniPhone('03202220001')).toBe(true);
    expect(isValidPakistaniPhone('03459876543')).toBe(true);
    expect(isValidPakistaniPhone('+92 300 1234567')).toBe(true);
    expect(isValidPakistaniPhone('0333 4567890')).toBe(true);
  });

  it('rejects numbers that are not 11 digits or not starting with 03', () => {
    expect(isValidPakistaniPhone('')).toBe(false);
    expect(isValidPakistaniPhone('12345')).toBe(false);
    expect(isValidPakistaniPhone('0300123456')).toBe(false); // 10 digits
    expect(isValidPakistaniPhone('030012345678')).toBe(false); // 12 digits
    expect(isValidPakistaniPhone('04235876543')).toBe(false); // Lahore PTCL landline (starts with 042)
    expect(isValidPakistaniPhone('02135876543')).toBe(false); // Karachi PTCL landline (starts with 021)
    expect(isValidPakistaniPhone('abcdefghijk')).toBe(false);
  });

  it('rejects obvious fake or dummy sequence numbers', () => {
    expect(isValidPakistaniPhone('03000000000')).toBe(false);
    expect(isValidPakistaniPhone('03111111111')).toBe(false);
    expect(isValidPakistaniPhone('03999999999')).toBe(false);
    expect(isValidPakistaniPhone('03123456789')).toBe(false);
  });

  it('formats 11-digit numbers for display', () => {
    expect(formatPhoneDisplay('03001234567')).toBe('0300 1234567');
    expect(formatPhoneDisplay('+923202220001')).toBe('0320 2220001');
  });
});
