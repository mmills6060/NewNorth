import path from "node:path"

import { drizzle } from "drizzle-orm/mysql2"
import { migrate } from "drizzle-orm/mysql2/migrator"
import mysql from "mysql2/promise"

const migrationsFolder = path.join(process.cwd(), "db/migrations")

let migratePromise: Promise<void> | null = null

export function ensureMigrations(): Promise<void> {
  if (migratePromise) return migratePromise

  migratePromise = runMigrations().catch((error) => {
    migratePromise = null
    throw error
  })

  return migratePromise
}

async function runMigrations(): Promise<void> {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and start MySQL with docker compose up -d."
    )
  }

  const connection = await mysql.createConnection(url)
  const db = drizzle(connection)

  try {
    await migrate(db, { migrationsFolder })
  } finally {
    await connection.end()
  }
}
