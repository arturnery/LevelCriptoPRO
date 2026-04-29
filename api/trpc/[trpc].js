// server/trpc-handler.ts
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    // sameSite "none" required for cross-origin requests (Vercel + Neon)
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
async function notifyOwner(_payload) {
  return false;
}

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/db.ts
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

// drizzle/schema.ts
import { pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
var roleEnum = pgEnum("role", ["user", "admin"]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var inscricoes = pgTable("inscricoes", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  criadoEm: timestamp("criadoEm").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production"
};

// server/db.ts
var _db = null;
function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function getUserByOpenId(openId) {
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createInscricao(nome, email, telefone) {
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot create inscricao: database not available");
    return { inscricao: null, isDuplicate: false };
  }
  try {
    await db.insert(inscricoes).values({ nome, email, telefone });
    const inscricaoCriada = await db.select().from(inscricoes).where(eq(inscricoes.email, email)).limit(1);
    return { inscricao: inscricaoCriada.length > 0 ? inscricaoCriada[0] : null, isDuplicate: false };
  } catch (error) {
    const causeMessage = error?.cause?.message || "";
    const errorMessage = error?.message || "";
    const isDuplicateEmail = causeMessage.includes("duplicate key") || errorMessage.includes("duplicate key") || error?.code === "23505";
    if (isDuplicateEmail) {
      console.error("[Database] Duplicate email detected:", email);
      const existing = await db.select().from(inscricoes).where(eq(inscricoes.email, email)).limit(1);
      return { inscricao: existing.length > 0 ? existing[0] : null, isDuplicate: true };
    }
    console.error("[Database] Failed to create inscricao:", error);
    throw error;
  }
}
async function listInscricoes() {
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot list inscricoes: database not available");
    return [];
  }
  try {
    return await db.select().from(inscricoes).orderBy(inscricoes.criadoEm);
  } catch (error) {
    console.error("[Database] Failed to list inscricoes:", error);
    throw error;
  }
}

// server/routers.ts
import { z as z2 } from "zod";
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
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
    criar: publicProcedure.input(
      z2.object({
        nome: z2.string().min(1, "Nome obrigat\xF3rio"),
        email: z2.string().email("Email inv\xE1lido"),
        telefone: z2.string().min(10, "Telefone inv\xE1lido")
      })
    ).mutation(async ({ input }) => {
      const result = await createInscricao(input.nome, input.email, input.telefone);
      if (!result || !result.inscricao) {
        throw new Error("Falha ao criar inscri\xE7\xE3o");
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
    })
  })
});

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var SDKServer = class {
  getSessionSecret() {
    return new TextEncoder().encode(ENV.cookieSecret);
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) return /* @__PURE__ */ new Map();
    return new Map(Object.entries(parseCookieHeader(cookieHeader)));
  }
  async createSessionToken(openId, options = {}) {
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1e3);
    return new SignJWT({ openId, name: options.name || "" }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(this.getSessionSecret());
  }
  async verifySession(cookieValue) {
    if (!cookieValue) return null;
    try {
      const { payload } = await jwtVerify(cookieValue, this.getSessionSecret(), {
        algorithms: ["HS256"]
      });
      const { openId, name } = payload;
      if (typeof openId !== "string" || !openId) return null;
      return { openId, name: typeof name === "string" ? name : "" };
    } catch {
      return null;
    }
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const session = await this.verifySession(cookies.get(COOKIE_NAME));
    if (!session) {
      throw ForbiddenError("Invalid session");
    }
    const user = await getUserByOpenId(session.openId);
    if (!user) {
      throw ForbiddenError("User not found");
    }
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/trpc-handler.ts
var trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext
});
function handler(req, res) {
  return trpcMiddleware(req, res, () => {
    res.status(404).end();
  });
}
export {
  handler as default
};
