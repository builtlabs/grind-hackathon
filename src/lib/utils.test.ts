import { formatNumber } from './utils';

describe('utils', () => {
  describe('formatNumber', () => {
    it('should format numbers correctly', () => {
      expect(formatNumber(0.000012345678)).toBe('0.0000123');
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(999.999)).toBe('1K');
      expect(formatNumber(1234)).toBe('1.23K');
      expect(formatNumber(123456)).toBe('123K');
      expect(formatNumber(1234567)).toBe('1.23M');
      expect(formatNumber(123456789)).toBe('123M');
      expect(formatNumber(1234567890)).toBe('1.23B');
      expect(formatNumber(123456789012)).toBe('123B');
      expect(formatNumber(1234567890123)).toBe('1.23T');
      expect(formatNumber(123456789012345)).toBe('123T');
      // The formatting only goes up to trillions...
      expect(formatNumber(1234567890123450)).toBe('1230T');
    });
  });
});
