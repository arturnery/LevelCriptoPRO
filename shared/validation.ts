import { z } from "zod";

/**
 * Fonte única de verdade da validação de inscrição.
 *
 * Cliente (client/src/pages/Home.tsx) e servidor (server/routers.ts) importam
 * daqui — não há mais lógica duplicada entre os dois lados, e os testes exercitam
 * exatamente estas funções em vez de uma cópia que diverge com o tempo.
 *
 * Regra do telefone (dual-mode):
 *  - Brasileiro: 11 dígitos, com 9 na terceira posição — (XX) 9XXXX-XXXX.
 *  - Internacional: prefixo "+" e 7 a 15 dígitos, formato livre.
 */

/** Número internacional é identificado só pelo prefixo "+". */
export function isInternational(value: string): boolean {
  return value.trimStart().startsWith("+");
}

/** Só os dígitos, descartando qualquer caractere de apresentação. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formata para exibição no campo enquanto o usuário digita.
 * Internacional passa quase livre; brasileiro recebe a máscara (XX) 9XXXX-XXXX.
 */
export function formatPhone(value: string): string {
  if (isInternational(value)) {
    // Internacional: permite + e dígitos, espaços, hífens — sem forçar máscara.
    return value.replace(/[^\d+\s\-()]/g, "").slice(0, 20);
  }
  let numbers = onlyDigits(value);
  if (numbers.length > 11) numbers = numbers.slice(0, 11);
  if (numbers.length === 0) return "";
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

/**
 * Forma canônica que trafega para a API e é gravada no banco: dados, não
 * apresentação. Internacional vira "+" seguido dos dígitos; brasileiro, só
 * os dígitos. É isto que corrige a máscara vazando para o contrato.
 */
export function normalizePhone(value: string): string {
  const digits = onlyDigits(value);
  return isInternational(value) ? `+${digits}` : digits;
}

/** Aceita tanto a forma normalizada quanto a mascarada — conta dígitos, não pontuação. */
export function isValidPhone(value: string): boolean {
  const digits = onlyDigits(value);
  if (isInternational(value)) {
    return digits.length >= 7 && digits.length <= 15;
  }
  return digits.length === 11 && digits[2] === "9";
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Mensagem de erro específica do telefone, para o campo do formulário.
 * String vazia significa telefone válido.
 */
export function phoneErrorMessage(value: string): string {
  if (isInternational(value)) {
    return isValidPhone(value)
      ? ""
      : "Telefone internacional inválido. Use o formato: +55 11 99999-9999";
  }
  const numbers = onlyDigits(value);
  if (numbers.length === 0) return "Por favor, insira seu telefone";
  if (numbers.length < 11) {
    const faltam = 11 - numbers.length;
    return `Telefone incompleto. Faltam ${faltam} dígito${faltam > 1 ? "s" : ""}. Use o formato: (XX) 9XXXX-XXXX`;
  }
  if (numbers.length > 11) {
    return "Telefone com muitos dígitos. Use o formato: (XX) 9XXXX-XXXX";
  }
  if (numbers[2] !== "9") {
    return "Telefone inválido. O 3º dígito deve ser 9. Use o formato: (XX) 9XXXX-XXXX";
  }
  return "";
}

// --- Schemas Zod: declarados uma vez, usados no servidor e no cliente ---

export const nomeSchema = z.string().min(1, "Nome obrigatório");
export const emailSchema = z.string().refine(isValidEmail, "Email inválido");
export const telefoneSchema = z.string().refine(isValidPhone, "Telefone inválido");

/** Input de inscricoes.criar. O servidor valida DADOS (dígitos), não apresentação. */
export const criarInscricaoSchema = z.object({
  nome: nomeSchema,
  email: emailSchema,
  telefone: telefoneSchema,
});

export type CriarInscricaoInput = z.infer<typeof criarInscricaoSchema>;
