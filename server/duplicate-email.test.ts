import { describe, it, expect } from 'vitest';
import { interpretInsert } from './db';
import type { Inscricao } from '../drizzle/schema';

/**
 * Exercita o interpretInsert REAL de db.ts — o núcleo da detecção de duplicata
 * agora que ela é estrutural (onConflictDoNothing + returning), e não mais
 * parsing da string de erro do banco.
 */

const inscricao = (over: Partial<Inscricao> = {}): Inscricao => ({
  id: 1,
  nome: 'Renan',
  email: 'arturnery97@gmail.com',
  telefone: '11999999999',
  criadoEm: new Date(),
  ...over,
});

describe('interpretInsert', () => {
  it('e-mail novo: returning traz a linha, isDuplicate false', () => {
    const nova = inscricao();
    const r = interpretInsert([nova], []);
    expect(r.isDuplicate).toBe(false);
    expect(r.inscricao).toBe(nova);
  });

  it('e-mail existente: returning vazio, isDuplicate true e devolve o registro atual', () => {
    const existente = inscricao({ id: 42 });
    const r = interpretInsert([], [existente]);
    expect(r.isDuplicate).toBe(true);
    expect(r.inscricao).toBe(existente);
  });

  it('conflito sem registro recuperável: isDuplicate true, inscricao null', () => {
    const r = interpretInsert([], []);
    expect(r.isDuplicate).toBe(true);
    expect(r.inscricao).toBeNull();
  });

  it('a linha nova tem precedência sobre a lista de existentes', () => {
    const nova = inscricao({ id: 1 });
    const outra = inscricao({ id: 2 });
    const r = interpretInsert([nova], [outra]);
    expect(r.inscricao).toBe(nova);
    expect(r.isDuplicate).toBe(false);
  });
});
