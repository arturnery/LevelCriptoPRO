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

export async function createInscricao(nome: string, email: string, telefone: string): Promise<{ inscricao: Inscricao | null; isDuplicate: boolean }> {
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot create inscricao: database not available");
    return { inscricao: null, isDuplicate: false };
  }

  try {
    await db.insert(inscricoes).values({ nome, email, telefone });

    const inscricaoCriada = await db.select().from(inscricoes)
      .where(eq(inscricoes.email, email))
      .limit(1);

    return { inscricao: inscricaoCriada.length > 0 ? inscricaoCriada[0] : null, isDuplicate: false };
  } catch (error: any) {
    const causeMessage = error?.cause?.message || '';
    const errorMessage = error?.message || '';

    const isDuplicateEmail =
      causeMessage.includes('duplicate key') ||
      errorMessage.includes('duplicate key') ||
      error?.code === '23505';

    if (isDuplicateEmail) {
      console.error("[Database] Duplicate email detected:", email);
      const existing = await db.select().from(inscricoes)
        .where(eq(inscricoes.email, email))
        .limit(1);
      return { inscricao: existing.length > 0 ? existing[0] : null, isDuplicate: true };
    }

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
