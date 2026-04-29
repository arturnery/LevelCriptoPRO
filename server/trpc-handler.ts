import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { Request, Response } from "express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

export default function handler(req: Request, res: Response) {
  return trpcMiddleware(req, res, () => {
    res.status(404).end();
  });
}
