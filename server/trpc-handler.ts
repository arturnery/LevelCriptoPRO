import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { Request, Response } from "express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

export default function handler(req: Request, res: Response) {
  // Vercel passes a raw Node.js IncomingMessage which lacks req.path.
  // tRPC's Express adapter requires req.path to extract the procedure name.
  if (!req.path && req.url) {
    (req as any).path = req.url.split("?")[0];
  }
  return trpcMiddleware(req, res, () => {
    res.status(404).end();
  });
}
