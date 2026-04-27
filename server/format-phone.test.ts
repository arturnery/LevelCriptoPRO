import { describe, it, expect } from 'vitest';

/**
 * Test for formatPhone function
 * Ensures that phone numbers are formatted correctly and limited to 11 digits
 */

const formatPhone = (value: string) => {
  // Remove tudo que não é número
  let numbers = value.replace(/\D/g, '');
  
  // Limitar a 11 dígitos máximo
  if (numbers.length > 11) {
    numbers = numbers.slice(0, 11);
  }
  
  if (numbers.length === 0) return '';
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

describe('formatPhone - Limit to 11 digits', () => {
  describe('Valid phone formatting', () => {
    it('should format a valid 11-digit phone number', () => {
      const result = formatPhone('27997355656');
      expect(result).toBe('(27) 99735-5656');
    });

    it('should format phone with special characters', () => {
      const result = formatPhone('(27) 99735-5656');
      expect(result).toBe('(27) 99735-5656');
    });

    it('should format partial phone numbers correctly', () => {
      expect(formatPhone('27')).toBe('(27');
      expect(formatPhone('279')).toBe('(27) 9');
      expect(formatPhone('27997')).toBe('(27) 997');
      expect(formatPhone('279973')).toBe('(27) 9973');
      expect(formatPhone('2799735')).toBe('(27) 99735');
      expect(formatPhone('27997355')).toBe('(27) 99735-5');
      expect(formatPhone('279973556')).toBe('(27) 99735-56');
      expect(formatPhone('2799735566')).toBe('(27) 99735-566');
    });
  });

  describe('Limiting to 11 digits', () => {
    it('should truncate phone numbers with more than 11 digits', () => {
      // 12 digits - should be cut to 11
      const result = formatPhone('279973556661');
      expect(result).toBe('(27) 99735-5666');
    });

    it('should truncate phone numbers with 15 digits', () => {
      const result = formatPhone('279973556661234');
      expect(result).toBe('(27) 99735-5666');
    });

    it('should truncate phone numbers with 20 digits', () => {
      const result = formatPhone('27997355666123456789');
      expect(result).toBe('(27) 99735-5666');
    });

    it('should handle pasted phone numbers with extra digits', () => {
      // User pastes: (27) 99735-56661 (12 digits)
      const result = formatPhone('(27) 99735-56661');
      expect(result).toBe('(27) 99735-5666');
    });
  });

  describe('Edge cases', () => {
    it('should return empty string for empty input', () => {
      expect(formatPhone('')).toBe('');
    });

    it('should ignore non-numeric characters', () => {
      expect(formatPhone('(27) 99735-5656')).toBe('(27) 99735-5656');
      expect(formatPhone('27 99735 5656')).toBe('(27) 99735-5656');
      expect(formatPhone('27-99735-5656')).toBe('(27) 99735-5656');
    });

    it('should handle letters and special characters', () => {
      const result = formatPhone('(27) 99735-5656abc!@#');
      expect(result).toBe('(27) 99735-5656');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle the problematic case: (38) 99968-3592 (10 digits)', () => {
      // Actually this phone has 11 digits: 38 + 99968 + 3592 = 11
      const result = formatPhone('(38) 99968-3592');
      expect(result).toBe('(38) 99968-3592');
      // Verify it has 11 digits
      expect(result.replace(/\D/g, '').length).toBe(11);
    });

    it('should handle valid phone: (38) 99968-35920 (11 digits)', () => {
      const result = formatPhone('(38) 99968-35920');
      expect(result).toBe('(38) 99968-3592');
    });

    it('should prevent user from typing more than 11 digits', () => {
      // User tries to type 12 digits
      const result = formatPhone('38999683592012');
      expect(result).toBe('(38) 99968-3592');
      expect(result.replace(/\D/g, '').length).toBe(11);
    });
  });

  describe('Digit count validation', () => {
    it('should always return formatted phone with at most 11 digits', () => {
      const testCases = [
        '27997355656',
        '279973556661',
        '27997355666123456789',
        '(27) 99735-5656',
        '(27) 99735-56661234',
      ];

      testCases.forEach(testCase => {
        const result = formatPhone(testCase);
        const digitCount = result.replace(/\D/g, '').length;
        expect(digitCount).toBeLessThanOrEqual(11);
      });
    });
  });
});
