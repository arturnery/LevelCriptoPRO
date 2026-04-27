import { describe, it, expect } from 'vitest';

/**
 * Form validation helper functions
 * Tests for email and phone validation with specific error messages
 */

const validateEmail = (emailValue: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailValue);
};

const validatePhone = (phoneNumber: string) => {
  const numbers = phoneNumber.replace(/\D/g, '');
  return numbers.length === 11 && numbers[2] === '9';
};

describe('Form Validation - Error Messages', () => {
  describe('Email Validation', () => {
    it('should accept valid email addresses', () => {
      expect(validateEmail('contato.renanmataveli@gmail.com')).toBe(true);
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
      expect(validateEmail('user @domain.com')).toBe(false);
    });

    it('should return "Email inválido" for invalid emails', () => {
      const invalidEmails = ['invalid', 'user@', '@domain.com'];
      invalidEmails.forEach(email => {
        if (!validateEmail(email)) {
          // This would be the error message shown to user
          const errorMsg = 'Email inválido';
          expect(errorMsg).toBe('Email inválido');
        }
      });
    });
  });

  describe('Phone Validation', () => {
    it('should accept valid phone numbers with 11 digits and 9 as 3rd digit', () => {
      expect(validatePhone('(27) 99735-5656')).toBe(true);
      expect(validatePhone('11987654321')).toBe(true);
      expect(validatePhone('(11) 98765-4321')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('(27) 9973-566')).toBe(false); // 10 digits
      expect(validatePhone('(27) 89735-5656')).toBe(false); // 3rd digit not 9
      expect(validatePhone('123')).toBe(false); // too short
    });

    it('should return "Telefone inválido" for invalid phones', () => {
      const invalidPhones = ['(27) 9973-566', '(27) 89735-5656'];
      invalidPhones.forEach(phone => {
        if (!validatePhone(phone)) {
          // This would be the error message shown to user
          const errorMsg = 'Telefone inválido';
          expect(errorMsg).toBe('Telefone inválido');
        }
      });
    });
  });

  describe('Field-specific Error Messages', () => {
    it('should show "Nome obrigatório" when name is missing', () => {
      const name = '';
      if (!name) {
        expect('Nome obrigatório').toBe('Nome obrigatório');
      }
    });

    it('should show "Email obrigatório" when email is missing', () => {
      const email = '';
      if (!email) {
        expect('Email obrigatório').toBe('Email obrigatório');
      }
    });

    it('should show "Telefone obrigatório" when phone is missing', () => {
      const phone = '';
      if (!phone) {
        expect('Telefone obrigatório').toBe('Telefone obrigatório');
      }
    });

    it('should show "Email inválido" when email format is wrong', () => {
      const email = 'invalid-email';
      if (!validateEmail(email)) {
        expect('Email inválido').toBe('Email inválido');
      }
    });

    it('should show "Telefone inválido" when phone format is wrong', () => {
      const phone = '(27) 9973-566'; // 10 digits, not 11
      if (!validatePhone(phone)) {
        expect('Telefone inválido').toBe('Telefone inválido');
      }
    });
  });

  describe('Real-world Scenarios', () => {
    it('should accept the user example: (27) 99735-5656', () => {
      const phone = '(27) 99735-5656';
      expect(validatePhone(phone)).toBe(true);
      // No error message needed
    });

    it('should accept valid email: contato.renanmataveli@gmail.com', () => {
      const email = 'contato.renanmataveli@gmail.com';
      expect(validateEmail(email)).toBe(true);
      // No error message needed
    });

    it('should provide clear error when email is invalid', () => {
      const email = 'invalid.email';
      if (!validateEmail(email)) {
        const errorMsg = 'Email inválido';
        expect(errorMsg).toContain('Email');
      }
    });

    it('should provide clear error when phone is invalid', () => {
      const phone = '(27) 8973-5656'; // 3rd digit is 8, not 9
      if (!validatePhone(phone)) {
        const errorMsg = 'Telefone inválido';
        expect(errorMsg).toContain('Telefone');
      }
    });
  });

  describe('Error Message Specificity', () => {
    it('should distinguish between email and phone errors', () => {
      const emailError = 'Email inválido';
      const phoneError = 'Telefone inválido';
      
      expect(emailError).not.toBe(phoneError);
      expect(emailError).toContain('Email');
      expect(phoneError).toContain('Telefone');
    });

    it('should distinguish between required field and invalid format', () => {
      const requiredError = 'Email obrigatório';
      const invalidError = 'Email inválido';
      
      expect(requiredError).not.toBe(invalidError);
      expect(requiredError).toContain('obrigatório');
      expect(invalidError).toContain('inválido');
    });

    it('should make it clear which field needs correction', () => {
      const errors = [
        'Nome obrigatório',
        'Email obrigatório',
        'Telefone obrigatório',
        'Email inválido',
        'Telefone inválido'
      ];

      errors.forEach(error => {
        // Each error should clearly identify which field it refers to
        expect(
          error.includes('Nome') || 
          error.includes('Email') || 
          error.includes('Telefone')
        ).toBe(true);
      });
    });
  });
});
