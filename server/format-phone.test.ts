import { describe, it, expect } from 'vitest';
import { formatPhone } from '../shared/validation';

/**
 * Exercita o formatPhone REAL de shared/validation.ts (dual-mode), não uma cópia.
 */

describe('formatPhone - brasileiro', () => {
  it('formata um número de 11 dígitos', () => {
    expect(formatPhone('27997355656')).toBe('(27) 99735-5656');
  });

  it('formata parciais enquanto o usuário digita', () => {
    expect(formatPhone('27')).toBe('(27');
    expect(formatPhone('279')).toBe('(27) 9');
    expect(formatPhone('2799735')).toBe('(27) 99735');
    expect(formatPhone('27997355')).toBe('(27) 99735-5');
  });

  it('trunca em 11 dígitos', () => {
    expect(formatPhone('279973556661')).toBe('(27) 99735-5666'); // 12 → 11
    expect(formatPhone('27997355666123456789')).toBe('(27) 99735-5666'); // 20 → 11
  });

  it('ignora letras e pontuação', () => {
    expect(formatPhone('(27) 99735-5656abc!@#')).toBe('(27) 99735-5656');
    expect(formatPhone('27 99735 5656')).toBe('(27) 99735-5656');
  });

  it('retorna vazio para entrada vazia', () => {
    expect(formatPhone('')).toBe('');
  });
});

describe('formatPhone - internacional', () => {
  it('mantém o + e não força máscara brasileira', () => {
    expect(formatPhone('+1 555 0000')).toBe('+1 555 0000');
    expect(formatPhone('+44 20 7946 0958')).toBe('+44 20 7946 0958');
  });

  it('remove caracteres inválidos mas preserva + espaço - ( )', () => {
    expect(formatPhone('+1 (555) 000-0abc')).toBe('+1 (555) 000-0');
  });
});
