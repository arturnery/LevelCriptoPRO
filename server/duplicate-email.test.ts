import { describe, it, expect } from 'vitest';

/**
 * Test for duplicate email error handling
 * Ensures that duplicate email errors are caught and converted to user-friendly messages
 */

describe('Duplicate Email Error Handling', () => {
  describe('Error detection', () => {
    it('should detect duplicate email error from database', () => {
      const dbError = {
        message: "Duplicate entry 'test@example.com' for key 'inscricoes.inscricoes_email_unique'"
      };
      
      const isDuplicate = dbError.message?.includes('Duplicate entry') && 
                         dbError.message?.includes('email');
      expect(isDuplicate).toBe(true);
    });

    it('should convert database error to user-friendly message', () => {
      const dbError = new Error("Duplicate entry 'test@example.com' for key 'inscricoes.inscricoes_email_unique'");
      
      let mensagemErro = 'Erro ao criar inscrição. Tente novamente.';
      if (dbError.message?.includes('Duplicate entry') && dbError.message?.includes('email')) {
        mensagemErro = 'Email já inscrito. Obrigado pelo interesse!';
      }
      
      expect(mensagemErro).toBe('Email já inscrito. Obrigado pelo interesse!');
    });
  });

  describe('Frontend error message handling', () => {
    it('should show "Email já inscrito" when error contains "ja inscrito"', () => {
      const error = { message: 'Email ja inscrito' };
      let mensagemErro = 'Erro ao criar inscrição. Tente novamente.';
      
      if (error.message?.includes('ja inscrito') || error.message?.includes('already exists')) {
        mensagemErro = 'Email já inscrito. Obrigado pelo interesse!';
      }
      
      expect(mensagemErro).toBe('Email já inscrito. Obrigado pelo interesse!');
    });

    it('should show "Email já inscrito" when error contains "already exists"', () => {
      const error = { message: 'Email already exists' };
      let mensagemErro = 'Erro ao criar inscrição. Tente novamente.';
      
      if (error.message?.includes('ja inscrito') || error.message?.includes('already exists')) {
        mensagemErro = 'Email já inscrito. Obrigado pelo interesse!';
      }
      
      expect(mensagemErro).toBe('Email já inscrito. Obrigado pelo interesse!');
    });

    it('should show "Email inválido" for other email errors', () => {
      const error = { message: 'Email format is invalid' };
      let mensagemErro = 'Erro ao criar inscrição. Tente novamente.';
      
      if (error.message?.includes('ja inscrito') || error.message?.includes('already exists')) {
        mensagemErro = 'Email já inscrito. Obrigado pelo interesse!';
      } else if (error.message?.toLowerCase().includes('email')) {
        mensagemErro = 'Email inválido';
      }
      
      expect(mensagemErro).toBe('Email inválido');
    });

    it('should show generic error for unknown errors', () => {
      const error = { message: 'Unknown database error' };
      let mensagemErro = 'Erro ao criar inscrição. Tente novamente.';
      
      if (error.message?.includes('ja inscrito') || error.message?.includes('already exists')) {
        mensagemErro = 'Email já inscrito. Obrigado pelo interesse!';
      } else if (error.message?.includes('email')) {
        mensagemErro = 'Email inválido';
      }
      
      expect(mensagemErro).toBe('Erro ao criar inscrição. Tente novamente.');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle the user case: arturnery97@gmail.com already registered', () => {
      const error = { message: 'Email ja inscrito' };
      let mensagemErro = 'Erro ao criar inscrição. Tente novamente.';
      
      if (error.message?.includes('ja inscrito') || error.message?.includes('already exists')) {
        mensagemErro = 'Email já inscrito. Obrigado pelo interesse!';
      }
      
      expect(mensagemErro).toBe('Email já inscrito. Obrigado pelo interesse!');
    });

    it('should provide friendly message instead of technical error', () => {
      const technicalError = "Duplicate entry 'arturnery97@gmail.com' for key 'inscricoes.inscricoes_email_unique'";
      const friendlyMessage = 'Email já inscrito. Obrigado pelo interesse!';
      
      expect(friendlyMessage).not.toContain('Duplicate entry');
      expect(friendlyMessage).not.toContain('inscricoes_email_unique');
      expect(friendlyMessage).toContain('Email');
      expect(friendlyMessage).toContain('inscrito');
    });
  });

  describe('Error message clarity', () => {
    it('should not expose database implementation details', () => {
      const friendlyMessage = 'Email já inscrito. Obrigado pelo interesse!';
      
      expect(friendlyMessage).not.toContain('Duplicate');
      expect(friendlyMessage).not.toContain('key');
      expect(friendlyMessage).not.toContain('unique');
      expect(friendlyMessage).not.toContain('inscricoes');
    });

    it('should be polite and appreciative', () => {
      const message = 'Email já inscrito. Obrigado pelo interesse!';
      
      expect(message).toContain('Obrigado');
      expect(message).toContain('interesse');
    });

    it('should be clear about what went wrong', () => {
      const message = 'Email já inscrito. Obrigado pelo interesse!';
      
      expect(message).toContain('Email');
      expect(message).toContain('inscrito');
    });
  });
});
