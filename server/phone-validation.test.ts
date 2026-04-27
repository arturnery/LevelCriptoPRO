import { describe, it, expect } from 'vitest';

/**
 * Phone validation helper functions
 * These functions mirror the logic used in Home.tsx for testing purposes
 */

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return '';
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const validatePhone = (phoneNumber: string) => {
  const numbers = phoneNumber.replace(/\D/g, '');
  return numbers.length === 11 && numbers[2] === '9';
};

const getPhoneErrorMessage = (phoneNumber: string) => {
  const numbers = phoneNumber.replace(/\D/g, '');
  if (numbers.length === 0) {
    return 'Por favor, insira seu telefone';
  }
  if (numbers.length < 11) {
    const faltam = 11 - numbers.length;
    return `Telefone incompleto. Faltam ${faltam} dígito${faltam > 1 ? 's' : ''}. Use o formato: (XX) 9XXXX-XXXX`;
  }
  if (numbers.length > 11) {
    return `Telefone com muitos dígitos. Use o formato: (XX) 9XXXX-XXXX`;
  }
  if (numbers[2] !== '9') {
    return 'Telefone inválido. O 3º dígito deve ser 9. Use o formato: (XX) 9XXXX-XXXX';
  }
  return 'Telefone inválido. Use o formato: (XX) 9XXXX-XXXX';
};

describe('Phone Validation', () => {
  describe('formatPhone', () => {
    it('should format a valid 11-digit phone number', () => {
      const result = formatPhone('27997355656');
      expect(result).toBe('(27) 99735-5656');
    });

    it('should format a valid 11-digit phone with special characters', () => {
      const result = formatPhone('(27) 99735-5656');
      expect(result).toBe('(27) 99735-5656');
    });

    it('should format partial phone numbers', () => {
      expect(formatPhone('27')).toBe('(27');
      expect(formatPhone('279')).toBe('(27) 9');
      expect(formatPhone('27997')).toBe('(27) 997');
    });

    it('should return empty string for empty input', () => {
      expect(formatPhone('')).toBe('');
    });

    it('should ignore non-numeric characters', () => {
      expect(formatPhone('(27) 9973-5566')).toBe('(27) 99735-566');
    });
  });

  describe('validatePhone', () => {
    it('should accept valid phone numbers with 11 digits and 9 as 3rd digit', () => {
      expect(validatePhone('(27) 99735-5656')).toBe(true);
      expect(validatePhone('11987654321')).toBe(true);
      expect(validatePhone('(11) 98765-4321')).toBe(true);
    });

    it('should reject phone numbers with less than 11 digits', () => {
      expect(validatePhone('(27) 9973-566')).toBe(false);
      expect(validatePhone('2799735566')).toBe(false);
    });

    it('should reject phone numbers with more than 11 digits', () => {
      expect(validatePhone('(27) 99735-56561')).toBe(false);
      expect(validatePhone('279973556611')).toBe(false);
    });

    it('should reject phone numbers where 3rd digit is not 9', () => {
      expect(validatePhone('(27) 89735-5656')).toBe(false);
      expect(validatePhone('27897355656')).toBe(false);
      expect(validatePhone('(11) 87654-3210')).toBe(false);
    });

    it('should reject empty phone numbers', () => {
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('getPhoneErrorMessage', () => {
    it('should return specific error for empty phone', () => {
      const message = getPhoneErrorMessage('');
      expect(message).toBe('Por favor, insira seu telefone');
    });

    it('should return specific error for incomplete phone (1 digit missing)', () => {
      const message = getPhoneErrorMessage('(27) 9973-566');
      // (27) 9973-566 = 27 + 9973 + 566 = 9 digits, needs 11, so faltam 2
      expect(message).toContain('Faltam 2 dígitos');
      expect(message).toContain('Use o formato');
    });

    it('should return specific error for incomplete phone (multiple digits missing)', () => {
      const message = getPhoneErrorMessage('(27) 99');
      expect(message).toContain('Faltam 7 dígitos');
      expect(message).toContain('Use o formato');
    });

    it('should return specific error for phone with too many digits', () => {
      const message = getPhoneErrorMessage('(27) 99735-56561');
      expect(message).toContain('muitos dígitos');
    });

    it('should return specific error when 3rd digit is not 9', () => {
      const message = getPhoneErrorMessage('(27) 89735-5656');
      expect(message).toContain('3º dígito deve ser 9');
    });

    it('should provide helpful format example in all error messages', () => {
      expect(getPhoneErrorMessage('123')).toContain('(XX) 9XXXX-XXXX');
      expect(getPhoneErrorMessage('(27) 8973-5656')).toContain('(XX) 9XXXX-XXXX');
    });
  });

  describe('Integration: User scenarios', () => {
    it('should handle the example from the bug report: (27) 99735-5656', () => {
      const phone = '(27) 99735-5656';
      // (27) 99735-5656 = 27 + 99735 + 5656 = 11 digits, and 3rd digit is 9, so it's VALID
      const isValid = validatePhone(phone);
      expect(isValid).toBe(true);
    });

    it('should handle phone with 10 digits (missing 1): (27) 9973-5656', () => {
      const phone = '(27) 9973-5656';
      const isValid = validatePhone(phone);
      expect(isValid).toBe(false);
      
      const errorMsg = getPhoneErrorMessage(phone);
      expect(errorMsg).toContain('incompleto');
      expect(errorMsg).toContain('Faltam 1 dígito');
      expect(errorMsg).toContain('(XX) 9XXXX-XXXX');
    });

    it('should handle phone with invalid 3rd digit: (27) 89735-5656', () => {
      const phone = '(27) 89735-5656';
      const isValid = validatePhone(phone);
      expect(isValid).toBe(false);
      
      const errorMsg = getPhoneErrorMessage(phone);
      expect(errorMsg).toContain('3º dígito deve ser 9');
      expect(errorMsg).toContain('(XX) 9XXXX-XXXX');
    });
  });
});
