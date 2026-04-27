import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createInscricao, listInscricoes } from "./db";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Router para gerenciar inscrições na lista de espera
   * Expõe dois endpoints:
   * - inscricoes.criar: POST para criar nova inscrição
   * - inscricoes.listar: GET para listar todas as inscrições
   */
  inscricoes: router({
    /**
     * Criar uma nova inscrição
     * 
     * Input:
     *   - email: string (obrigatório, deve ser email válido)
     *   - telefone: string (obrigatório)
     * 
     * Output:
     *   - id: número único
     *   - email: email do usuário
     *   - telefone: telefone do usuário
     *   - criadoEm: data/hora da inscrição
     * 
     * Exemplo de uso no frontend:
     * const { mutate } = trpc.inscricoes.criar.useMutation();
     * mutate({ email: 'teste@example.com', telefone: '(11) 99999-9999' });
     */
    criar: publicProcedure
      .input(
        z.object({
          nome: z.string().min(1, "Nome obrigatório"),
          email: z.string().email("Email inválido"),
          telefone: z.string().min(10, "Telefone inválido"),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createInscricao(input.nome, input.email, input.telefone);
        if (!result || !result.inscricao) {
          throw new Error("Falha ao criar inscrição");
        }
        return { ...result.inscricao, isDuplicate: result.isDuplicate };
      }),

    /**
     * Listar todas as inscrições
     * 
     * Input: nenhum
     * 
     * Output:
     *   Array de inscrições com:
     *   - id: número único
     *   - email: email do usuário
     *   - telefone: telefone do usuário
     *   - criadoEm: data/hora da inscrição
     * 
     * Exemplo de uso no frontend:
     * const { data } = trpc.inscricoes.listar.useQuery();
     */
    listar: publicProcedure.query(async () => {
      return await listInscricoes();
    }),
  }),
});

export type AppRouter = typeof appRouter;
