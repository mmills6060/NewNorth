import { DrizzleQueryError } from "drizzle-orm"
import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"

import { ensureMigrations } from "@/lib/db/migrate"
import * as schema from "@/lib/db/schema"

const globalForDb = globalThis as unknown as {
  mysqlPool?: mysql.Pool
}

function createPool() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Start MySQL with docker compose up -d and copy .env.example to .env.local."
    )
  }

  return mysql.createPool(url)
}

function getPool() {
  if (!globalForDb.mysqlPool) {
    globalForDb.mysqlPool = createPool()
  }

  return globalForDb.mysqlPool
}

export function getDb() {
  return drizzle(getPool(), { schema, mode: "default" })
}

export async function withDatabase<T>(
  operation: (db: ReturnType<typeof getDb>) => Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV !== "production") {
    await ensureMigrations()
  }

  try {
    return await operation(getDb())
  } catch (error) {
    throw formatDatabaseError(error)
  }
}

function formatDatabaseError(error: unknown): Error {
  if (error instanceof DrizzleQueryError) {
    const cause = error.cause instanceof Error ? error.cause.message : String(error.cause ?? "")
    const hint = cause.includes("doesn't exist")
      ? " Run npm run db:migrate (or restart the dev server so migrations apply automatically)."
      : ""

    return new Error(`Database query failed: ${cause || error.message}.${hint}`, {
      cause: error,
    })
  }

  return error instanceof Error ? error : new Error(String(error))
}
