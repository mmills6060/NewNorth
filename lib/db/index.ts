import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"

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
