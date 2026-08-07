import { describe, it, expect } from 'vitest';
import { nomeSchema, criarInscricaoSchema } from '../shared/validation';

/**
 * Exercita o nomeSchema REAL de shared/validation.ts — o mesmo que o servidor
 * usa em inscricoes.criar, não uma cópia local com z.string().min(1).
 */

describe('nomeSchema', () => {
  describe('Nomes válidos', () => {
    it('aceita nomes de um caractere', () => {
      expect(() => nomeSchema.parse('a')).not.toThrow();
      expect(() => nomeSchema.parse('A')).not.toThrow();
    });

    it('aceita nomes longos e compostos', () => {
      expect(() => nomeSchema.parse('João da Silva Santos')).not.toThrow();
      expect(() => nomeSchema.parse('Renan Mataveli')).not.toThrow();
    });

    it('aceita acentos, apóstrofos e números', () => {
      expect(() => nomeSchema.parse('José')).not.toThrow();
      expect(() => nomeSchema.parse("O'Brien")).not.toThrow();
      expect(() => nomeSchema.parse('2Pac')).not.toThrow();
    });
  });

  describe('Nomes inválidos', () => {
    it('rejeita string vazia com mensagem clara', () => {
      const result = nomeSchema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nome obrigatório');
      }
    });
  });

  describe('Dentro do schema completo de inscrição', () => {
    it('reprova o registro inteiro quando o nome falta', () => {
      const result = criarInscricaoSchema.safeParse({
        nome: '',
        email: 'user@example.com',
        telefone: '11999999999',
      });
      expect(result.success).toBe(false);
    });
  });
});
