import { describe, it, expect } from 'vitest';
import { criarInscricaoSchema } from '../shared/validation';

/**
 * Exercita o schema REAL de input de inscricoes.criar (server/routers.ts o usa
 * direto). Este é o contrato de API — o que um curl consegue ou não enviar.
 *
 * Regressão do bug corrigido: antes o servidor usava z.string().min(10) sobre a
 * string mascarada, então media parênteses e hífen. Um telefone de puro lixo
 * com 10+ caracteres entrava. Agora a validação conta DÍGITOS.
 */

describe('criarInscricaoSchema', () => {
  it('aceita um registro brasileiro válido (forma normalizada)', () => {
    const r = criarInscricaoSchema.safeParse({
      nome: 'Renan',
      email: 'user@example.com',
      telefone: '11999999999',
    });
    expect(r.success).toBe(true);
  });

  it('aceita internacional com prefixo +', () => {
    const r = criarInscricaoSchema.safeParse({
      nome: 'John',
      email: 'john@example.com',
      telefone: '+15550000',
    });
    expect(r.success).toBe(true);
  });

  it('REPROVA telefone de lixo que o antigo min(10) deixava passar', () => {
    const r = criarInscricaoSchema.safeParse({
      nome: 'Atacante',
      email: 'x@example.com',
      telefone: 'aaaaaaaaaa', // 10 caracteres, 0 dígitos
    });
    expect(r.success).toBe(false);
  });

  it('reprova e-mail malformado', () => {
    const r = criarInscricaoSchema.safeParse({
      nome: 'Ana',
      email: 'sem-arroba',
      telefone: '11999999999',
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const campos = r.error.issues.map((i) => i.path[0]);
      expect(campos).toContain('email');
    }
  });

  it('reprova fixo brasileiro (10 dígitos, sem 9) — mesma regra do cliente', () => {
    const r = criarInscricaoSchema.safeParse({
      nome: 'Ana',
      email: 'ana@example.com',
      telefone: '1133334444',
    });
    expect(r.success).toBe(false);
  });

  it('reprova nome vazio', () => {
    const r = criarInscricaoSchema.safeParse({
      nome: '',
      email: 'ana@example.com',
      telefone: '11999999999',
    });
    expect(r.success).toBe(false);
  });
});
