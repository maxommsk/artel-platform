// src/lib/db.ts
export interface Env {
  DB: D1Database;
}
export const db = (process.env as any).DB as D1Database;
export const getDB = (env: Env) => env.DB;

