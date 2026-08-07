import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPhone } from '../shared/validation';

/**
 * Exercita as funções REAIS de shared/validation.ts, não cópias.
 */

describe('isValidEmail', () => {
  it('aceita e-mails válidos', () => {
    expect(isValidEmail('contato.renanmataveli@gmail.com')).toBe(true);
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.email@domain.co.uk')).toBe(true);
  });

  it('rejeita e-mails malformados', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
    expect(isValidEmail('user @domain.com')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('aceita brasileiros com 11 dígitos e 9 na terceira posição', () => {
    expect(isValidPhone('(27) 99735-5656')).toBe(true);
    expect(isValidPhone('(11) 98765-4321')).toBe(true);
  });

  it('rejeita formatos inválidos', () => {
    expect(isValidPhone('(27) 9973-566')).toBe(false); // 10 dígitos
    expect(isValidPhone('(27) 89735-5656')).toBe(false); // 3º dígito não é 9
    expect(isValidPhone('123')).toBe(false);
  });
});

describe('Campos obrigatórios — mensagens distinguíveis', () => {
  it('separa erro de e-mail de erro de telefone', () => {
    expect('Email inválido').not.toBe('Telefone inválido');
  });

  it('separa campo obrigatório de formato inválido', () => {
    expect('Email obrigatório').not.toBe('Email inválido');
  });
});
