import { describe, it, expect } from 'vitest';

/**
 * Test for DrizzleQueryError handling
 * Ensures that duplicate email errors from Drizzle are properly detected
 */

const detectDuplicateEmailError = (error: any): boolean => {
  // DrizzleQueryError tem a mensagem em error.cause.message
  // Precisa verificar error.cause.message primeiro pois error.message pode ser a query
  const causeMessage = error?.cause?.message || '';
  const errorMessage = error?.message || '';
  
  // Check in cause first (where the actual error is)
  if (causeMessage.includes('Duplicate entry') && causeMessage.includes('email')) {
    return true;
  }
  // Fallback to error.message
  if (errorMessage.includes('Duplicate entry') && errorMessage.includes('email')) {
    return true;
  }
  return false;
};

const convertErrorMessage = (error: any): string => {
  const isDuplicate = detectDuplicateEmailError(error);
  if (isDuplicate) {
    return 'Email ja inscrito';
  }
  // Return the cause message if available, otherwise the main message
  return error?.cause?.message || error?.message || 'Erro desconhecido';
};

describe('DrizzleQueryError Handling', () => {
  describe('Duplicate email detection', () => {
    it('should detect duplicate email error from Drizzle', () => {
      const error = {
        message: 'DrizzleQueryError: Failed query...',
        cause: {
          message: "Duplicate entry 'test@example.com' for key 'inscricoes.inscricoes_email_unique'"
        }
      };
      
      const isDuplicate = detectDuplicateEmailError(error);
      expect(isDuplicate).toBe(true);
    });

    it('should detect duplicate email when message is in error.message', () => {
      const error = {
        message: "Duplicate entry 'test@example.com' for key 'inscricoes.inscricoes_email_unique'"
      };
      
      const isDuplicate = detectDuplicateEmailError(error);
      expect(isDuplicate).toBe(true);
    });

    it('should not detect non-duplicate errors', () => {
      const error = {
        message: 'Some other database error',
        cause: {
          message: 'Connection failed'
        }
      };
      
      const isDuplicate = detectDuplicateEmailError(error);
      expect(isDuplicate).toBe(false);
    });
  });

  describe('Error message conversion', () => {
    it('should convert duplicate email error to user-friendly message', () => {
      const error = {
        message: 'DrizzleQueryError: Failed query...',
        cause: {
          message: "Duplicate entry 'arturnery97@gmail.com' for key 'inscricoes.inscricoes_email_unique'"
        }
      };
      
      const message = convertErrorMessage(error);
      expect(message).toBe('Email ja inscrito');
    });

    it('should preserve original error message for non-duplicate errors', () => {
      const error = {
        message: 'Connection timeout',
        cause: null
      };
      
      const message = convertErrorMessage(error);
      expect(message).toBe('Connection timeout');
    });

    it('should handle error.cause.message for non-duplicate errors', () => {
      const error = {
        message: 'DrizzleQueryError: Failed query...',
        cause: {
          message: 'Connection refused'
        }
      };
      
      const message = convertErrorMessage(error);
      expect(message).toBe('Connection refused');
    });
  });

  describe('Real-world Drizzle error scenarios', () => {
    it('should handle the actual error from the user case', () => {
      const error = {
        message: 'DrizzleQueryError: Failed query: insert into `inscricoes` (`id`, `nome`, `email`, `telefone`, `criadoEm`) values (default, ?, ?, ?, default)',
        cause: {
          message: "Duplicate entry 'arturnery97@gmail.com' for key 'inscricoes.inscricoes_email_unique'"
        }
      };
      
      const isDuplicate = detectDuplicateEmailError(error);
      expect(isDuplicate).toBe(true);
      
      const message = convertErrorMessage(error);
      expect(message).toBe('Email ja inscrito');
    });

    it('should handle error without cause', () => {
      const error = {
        message: "Duplicate entry 'test@example.com' for key 'inscricoes.inscricoes_email_unique'"
      };
      
      const isDuplicate = detectDuplicateEmailError(error);
      expect(isDuplicate).toBe(true);
    });

    it('should handle error with null cause', () => {
      const error = {
        message: 'DrizzleQueryError: Failed query...',
        cause: null
      };
      
      const isDuplicate = detectDuplicateEmailError(error);
      expect(isDuplicate).toBe(false);
    });

    it('should handle error with undefined cause', () => {
      const error = {
        message: 'DrizzleQueryError: Failed query...',
        cause: undefined
      };
      
      const isDuplicate = detectDuplicateEmailError(error);
      expect(isDuplicate).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle null error', () => {
      const error = null;
      const isDuplicate = detectDuplicateEmailError(error);
      expect(isDuplicate).toBe(false);
    });

    it('should handle undefined error', () => {
      const error = undefined;
      const isDuplicate = detectDuplicateEmailError(error);
      expect(isDuplicate).toBe(false);
    });

    it('should handle empty error object', () => {
      const error = {};
      const isDuplicate = detectDuplicateEmailError(error);
      expect(isDuplicate).toBe(false);
    });

    it('should be case-sensitive for "Duplicate entry"', () => {
      const error = {
        message: 'duplicate entry test@example.com',
        cause: null
      };
      
      const isDuplicate = detectDuplicateEmailError(error);
      expect(isDuplicate).toBe(false);
    });

    it('should require both "Duplicate entry" and "email"', () => {
      const error1 = {
        message: "Duplicate entry 'test@example.com'",
        cause: null
      };
      
      const error2 = {
        message: "Error with email field",
        cause: null
      };
      
      expect(detectDuplicateEmailError(error1)).toBe(false);
      expect(detectDuplicateEmailError(error2)).toBe(false);
    });
  });
});
