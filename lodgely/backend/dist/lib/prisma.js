"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Prisma Client Singleton (lib/prisma.ts)
//
// Prisma is our ORM (Object Relational Mapper).
// It lets us query the PostgreSQL database using TypeScript
// instead of writing raw SQL.
//
// WHY A SINGLETON?
// In development, Next.js and ts-node-dev do "hot reloads"
// (restart the code on every file save). If we just wrote
// `new PrismaClient()` directly, every hot-reload would
// create a NEW connection to the database — causing hundreds
// of idle connections and eventually crashing the DB.
//
// The singleton pattern stores one PrismaClient on the global
// object so it is reused across hot-reloads.
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// globalThis is a special JavaScript object that persists
// across module re-imports. We cast it so TypeScript knows
// it might have a `prisma` property.
const globalForPrisma = globalThis;
// Use the existing Prisma instance if it already exists on globalThis,
// otherwise create a brand-new one.
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        // In development: log every SQL query, warnings, and errors so we can debug.
        // In production: only log errors (quieter output).
        log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
    });
// In non-production environments, save the client on globalThis
// so the next hot-reload reuses it instead of creating another one.
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
//# sourceMappingURL=prisma.js.map