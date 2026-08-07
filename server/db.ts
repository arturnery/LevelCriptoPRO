import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { InsertUser, users, inscricoes, InsertInscricao, Inscricao } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Decide o resultado a partir das linhas que o insert e o select devolveram.
 * Função pura, sem I/O — é o núcleo testável da detecção de duplicata.
 *
 * `inserted` não-vazio => o insert gravou, e-mail é novo.
 * `inserted` vazio     => onConflictDoNothing não gravou, e-mail já existia;
 *                         o registro atual vem de `existing`.
 */
export function interpretInsert(
  inserted: Inscricao[],
  existing: Inscricao[]
): { inscricao: Inscricao | null; isDuplicate: boolean } {
  if (inserted.length > 0) {
    return { inscricao: inserted[0], isDuplicate: false };
  }
  return { inscricao: existing.length > 0 ? existing[0] : null, isDuplicate: true };
}

export async function createInscricao(nome: string, email: string, telefone: string): Promise<{ inscricao: Inscricao | null; isDuplicate: boolean }> {
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot create inscricao: database not available");
    return { inscricao: null, isDuplicate: false };
  }

  try {
    // onConflictDoNothing + returning: o caminho feliz resolve em uma única ida
    // ao banco e devolve a linha direto, sem o select extra de antes. A duplicata
    // deixa de depender de parsing da string de erro (que era MySQL, não Postgres).
    const inserted = await db
      .insert(inscricoes)
      .values({ nome, email, telefone })
      .onConflictDoNothing({ target: inscricoes.email })
      .returning();

    if (inserted.length > 0) {
      return interpretInsert(inserted, []);
    }

    // Conflito de e-mail: nada foi gravado, buscar o registro que já existe.
    const existing = await db.select().from(inscricoes)
      .where(eq(inscricoes.email, email))
      .limit(1);
    return interpretInsert([], existing);
  } catch (error) {
    console.error("[Database] Failed to create inscricao:", error);
    throw error;
  }
}

export async function listInscricoes(): Promise<Inscricao[]> {
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot list inscricoes: database not available");
    return [];
  }

  try {
    return await db.select().from(inscricoes)
      .orderBy(inscricoes.criadoEm);
  } catch (error) {
    console.error("[Database] Failed to list inscricoes:", error);
    throw error;
  }
}
