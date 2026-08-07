/**
 * Traduz um erro de tRPC/Zod na mensagem que o formulário mostra ao usuário.
 *
 * Em vez de uma única frase genérica para tudo, distingue o TIPO de falha:
 * validação de campo, conexão, timeout ou erro do servidor. Cada categoria dá
 * ao usuário uma ação diferente ("verifique sua internet" ≠ "tente em instantes").
 *
 * Lê a estrutura `error.data` (formato padrão do tRPC) e faz duck-typing do
 * erro — não depende de importar @trpc/client, então roda no cliente e nos testes.
 *
 * A duplicata de e-mail NÃO passa por aqui: volta como sucesso
 * (`isDuplicate: true`) e é tratada no onSuccess, não como erro.
 *
 * O detalhe técnico completo continua sendo logado no console pelo
 * mutationCache em client/src/main.tsx — isto aqui é só a mensagem de tela.
 */
export function mensagemDeErro(error: unknown): string {
  const e = error as any;
  const data = e?.data;

  // 1. Validação de campo (Zod no servidor): a mensagem específica do campo.
  const fieldErrors = data?.zodError?.fieldErrors as
    | Record<string, string[] | undefined>
    | undefined;
  if (fieldErrors) {
    const primeiro =
      fieldErrors.email?.[0] ??
      fieldErrors.telefone?.[0] ??
      fieldErrors.nome?.[0];
    if (primeiro) return primeiro;
  }

  const texto = String(e?.message ?? "");
  const httpStatus =
    typeof data?.httpStatus === "number" ? (data.httpStatus as number) : undefined;

  // 2. Timeout: a requisição saiu mas não voltou a tempo.
  if (/timeout|timed out|aborted|abort/i.test(texto)) {
    return "A conexão demorou demais para responder. Verifique sua internet e tente novamente.";
  }

  // 3. Sem resposta válida do servidor: offline, servidor fora do ar, ou uma
  //    resposta que não é do tRPC (ex.: HTML do preview sem backend). Nesses
  //    casos o tRPC não monta `data`, então ele vem nulo.
  const semRespostaDoServidor =
    data == null &&
    (/failed to fetch|networkerror|fetch failed|load failed|unexpected token|not valid json|<!doctype|<html/i.test(
      texto
    ) ||
      e?.name === "TRPCClientError" ||
      texto === "");
  if (semRespostaDoServidor) {
    return "Não foi possível falar com o servidor. Verifique sua conexão e tente novamente.";
  }

  // 4. Erro interno do servidor (banco fora, exceção não tratada).
  if (httpStatus !== undefined && httpStatus >= 500) {
    return "Tivemos um problema ao salvar sua inscrição. Tente novamente em instantes.";
  }

  // 5. Fallback: tipo de erro não reconhecido.
  return "Não foi possível concluir sua inscrição. Tente novamente.";
}
