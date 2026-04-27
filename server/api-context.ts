import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import { sdk } from "./_core/sdk";
import { getUserByOpenId } from "./db";
import type { User } from "../drizzle/schema";

// Context compatible with the fetch adapter (Vercel serverless)
// Provides a stub `req` and `res` so existing routers work without changes
export async function createContext(opts: FetchCreateContextFnOptions) {
  const cookieHeader = opts.req.headers.get("cookie") ?? "";
  const cookies = parseCookieHeader(cookieHeader);
  const sessionCookie = cookies[COOKIE_NAME];

  let user: User | null = null;
  try {
    const session = await sdk.verifySession(sessionCookie);
    if (session) {
      user = (await getUserByOpenId(session.openId)) ?? null;
    }
  } catch {
    user = null;
  }

  // Stub res so auth.logout can call clearCookie without errors in serverless
  const res = {
    clearCookie: (name: string, options?: Record<string, unknown>) => {
      opts.resHeaders.append(
        "Set-Cookie",
        `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`
      );
    },
  };

  return {
    req: opts.req as unknown as import("express").Request,
    res: res as unknown as import("express").Response,
    user,
  };
}
