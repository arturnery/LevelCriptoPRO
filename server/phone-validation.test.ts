import { describe, it, expect } from 'vitest';
import { isValidPhone, phoneErrorMessage, isInternational } from '../shared/validation';

/**
 * Exercita as funções REAIS de shared/validation.ts (as mesmas que cliente e
 * servidor usam), não uma cópia. Se a validação mudar, este teste acompanha.
 */

describe('isValidPhone (brasileiro)', () => {
  it('aceita 11 dígitos com 9 na terceira posição', () => {
    expect(isValidPhone('(27) 99735-5656')).toBe(true);
    expect(isValidPhone('11987654321')).toBe(true);
    expect(isValidPhone('(11) 98765-4321')).toBe(true);
  });

  it('aceita a forma normalizada (só dígitos)', () => {
    expect(isValidPhone('27997355656')).toBe(true);
  });

  it('rejeita 10 dígitos, terceiro dígito ≠ 9 e lixo', () => {
    expect(isValidPhone('(27) 9973-566')).toBe(false); // 10 dígitos
    expect(isValidPhone('(27) 89735-5656')).toBe(false); // 3º dígito não é 9
    expect(isValidPhone('123')).toBe(false); // curto demais
    expect(isValidPhone('aaaaaaaaaa')).toBe(false); // sem dígitos
  });
});

describe('isValidPhone (internacional)', () => {
  it('aceita prefixo + com 7 a 15 dígitos', () => {
    expect(isValidPhone('+1 555 0000')).toBe(true);
    expect(isValidPhone('+44 20 7946 0958')).toBe(true);
    expect(isValidPhone('+15550000')).toBe(true); // normalizado
  });

  it('rejeita menos de 7 ou mais de 15 dígitos', () => {
    expect(isValidPhone('+123456')).toBe(false); // 6 dígitos
    expect(isValidPhone('+1234567890123456')).toBe(false); // 16 dígitos
  });
});

describe('isInternational', () => {
  it('detecta apenas pelo prefixo +', () => {
    expect(isInternational('+55 11 99999-9999')).toBe(true);
    expect(isInternational('  +1 555')).toBe(true);
    expect(isInternational('(11) 99999-9999')).toBe(false);
  });
});

describe('phoneErrorMessage', () => {
  it('retorna string vazia para telefone válido', () => {
    expect(phoneErrorMessage('(27) 99735-5656')).toBe('');
    expect(phoneErrorMessage('+1 555 0000')).toBe('');
  });

  it('avisa quantos dígitos faltam no brasileiro incompleto', () => {
    expect(phoneErrorMessage('(27) 99735-56')).toBe(
      'Telefone incompleto. Faltam 2 dígitos. Use o formato: (XX) 9XXXX-XXXX'
    );
    expect(phoneErrorMessage('2799735565')).toContain('Faltam 1 dígito.');
  });

  it('pede o telefone quando está vazio', () => {
    expect(phoneErrorMessage('')).toBe('Por favor, insira seu telefone');
  });

  it('avisa quando o terceiro dígito não é 9', () => {
    expect(phoneErrorMessage('(27) 89735-5656')).toContain('O 3º dígito deve ser 9');
  });

  it('reclama de internacional fora do intervalo de 7 a 15 dígitos', () => {
    expect(phoneErrorMessage('+123')).toBe(
      'Telefone internacional inválido. Use o formato: +55 11 99999-9999'
    );
  });
});
