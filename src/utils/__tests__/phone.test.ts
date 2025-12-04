import { formatPhone } from '../phone';

describe('formatPhone', () => {
  it('removes non-digit characters', () => {
    expect(formatPhone('+1 (412) 555-1234')).toBe('(412) 555-1234');
  });

  it('formats 1–3 digits after country code', () => {
    expect(formatPhone('+141')).toBe('41');
    expect(formatPhone('+1412')).toBe('412');
  });

  it('formats 4–6 digits as (XXX) XXX', () => {
    expect(formatPhone('+141255')).toBe('(412) 55');
    expect(formatPhone('+1412555')).toBe('(412) 555');
  });

  it('formats 7+ digits as (XXX) XXX-XXXX', () => {
    expect(formatPhone('+14125551234')).toBe('(412) 555-1234');
  });

  it('handles empty or weird input gracefully', () => {
    expect(formatPhone('')).toBe('');
    expect(formatPhone('abc')).toBe('');
    expect(formatPhone('+1')).toBe('');
  });
});
