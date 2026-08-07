import { describe, it, expect } from 'vitest';
import { mensagemDeErro } from '../shared/formError';

/**
 * Exercita o mensagemDeErro REAL de shared/formError.ts, que o onError do
 * formulário usa. Distingue o TIPO de falha (validação, conexão, timeout,
 * servidor) em vez de uma frase genérica para tudo.
 */

const comZodError = (fieldErrors: Record<string, string[]>) => ({
  data: { zodError: { fieldErrors } },
});

describe('mensagemDeErro — validação de campo (zodError)', () => {
  it('usa a mensagem de e-mail', () => {
    expect(mensagemDeErro(comZodError({ email: ['Email inválido'] }))).toBe('Email inválido');
  });

  it('usa a mensagem de telefone', () => {
    expect(mensagemDeErro(comZodError({ telefone: ['Telefone inválido'] }))).toBe('Telefone inválido');
  });

  it('usa a mensagem de nome', () => {
    expect(mensagemDeErro(comZodError({ nome: ['Nome obrigatório'] }))).toBe('Nome obrigatório');
  });

  it('prioriza e-mail sobre telefone quando ambos falham', () => {
    const erro = comZodError({ email: ['Email inválido'], telefone: ['Telefone inválido'] });
    expect(mensagemDeErro(erro)).toBe('Email inválido');
  });
});

describe('mensagemDeErro — conexão', () => {
  it('reconhece falha de fetch (offline / servidor fora do ar)', () => {
    const erro = { name: 'TRPCClientError', message: 'Failed to fetch', data: null };
    expect(mensagemDeErro(erro)).toMatch(/conexão/i);
  });

  it('reconhece resposta HTML (preview sem backend) que não é do tRPC', () => {
    // Cenário real: POST /api/trpc devolve index.html, o cliente não consegue ler.
    const erro = { name: 'TRPCClientError', message: "Unexpected token '<'", data: null };
    expect(mensagemDeErro(erro)).toBe(
      'Não foi possível falar com o servidor. Verifique sua conexão e tente novamente.'
    );
  });
});

describe('mensagemDeErro — timeout', () => {
  it('reconhece requisição que expirou', () => {
    expect(mensagemDeErro({ message: 'Request timed out', data: null })).toMatch(/demorou demais/i);
  });
});

describe('mensagemDeErro — erro do servidor', () => {
  it('reconhece httpStatus 500', () => {
    const erro = { message: 'Internal Server Error', data: { httpStatus: 500 } };
    expect(mensagemDeErro(erro)).toMatch(/problema ao salvar/i);
  });
});

describe('mensagemDeErro — fallback', () => {
  it('trata null, undefined e objeto vazio', () => {
    expect(mensagemDeErro(null)).toMatch(/tente novamente/i);
    expect(mensagemDeErro(undefined)).toMatch(/tente novamente/i);
    expect(mensagemDeErro({})).toMatch(/tente novamente/i);
  });
});
