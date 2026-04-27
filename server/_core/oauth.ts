import type { Express } from "express";

// OAuth via Manus platform has been removed.
// To add social login in the future, implement a standard OAuth provider here
// (e.g. Google OAuth via googleapis, or use a library like better-auth).
export function registerOAuthRoutes(_app: Express) {}
