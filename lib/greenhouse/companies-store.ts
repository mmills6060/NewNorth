import { asc, eq } from "drizzle-orm"

import { withDatabase } from "@/lib/db"
import { greenhouseCompanies } from "@/lib/db/schema"
import type { GreenhouseJobRow, ValidatedBoard } from "@/lib/greenhouse/types"

export type CompanySource = "manual" | "discovered"

export interface ScrapeableCompany {
  boardSlug: string
  companyName: string
  source: CompanySource
  sourceInput: string | null
  jobCount: number
  lastSeenAt: Date | null
  createdAt: Date
}

function toScrapeableCompany(
  row: typeof greenhouseCompanies.$inferSelect
): ScrapeableCompany {
  return {
    boardSlug: row.boardSlug,
    companyName: row.companyName,
    source: row.source === "manual" ? "manual" : "discovered",
    sourceInput: row.sourceInput,
    jobCount: row.jobCount,
    lastSeenAt: row.lastSeenAt,
    createdAt: row.createdAt,
  }
}

export async function listScrapeableCompanies(): Promise<ScrapeableCompany[]> {
  return withDatabase(async (db) => {
    const rows = await db
      .select()
      .from(greenhouseCompanies)
      .orderBy(asc(greenhouseCompanies.companyName))

    return rows.map(toScrapeableCompany)
  })
}

export async function getTrackedCompanySlugs(): Promise<string[]> {
  return withDatabase(async (db) => {
    const rows = await db
      .select({ boardSlug: greenhouseCompanies.boardSlug })
      .from(greenhouseCompanies)
      .where(eq(greenhouseCompanies.source, "manual"))

    return rows.map((row) => row.boardSlug)
  })
}

export async function addTrackedCompany(company: {
  boardSlug: string
  companyName: string
  sourceInput?: string
}): Promise<void> {
  await withDatabase(async (db) => {
    await db
      .insert(greenhouseCompanies)
      .values({
        boardSlug: company.boardSlug,
        companyName: company.companyName,
        source: "manual",
        sourceInput: company.sourceInput ?? null,
      })
      .onDuplicateKeyUpdate({
        set: {
          companyName: company.companyName,
          source: "manual",
          sourceInput: company.sourceInput ?? null,
        },
      })
  })
}

export async function removeTrackedCompany(boardSlug: string): Promise<void> {
  await withDatabase(async (db) => {
    await db
      .delete(greenhouseCompanies)
      .where(eq(greenhouseCompanies.boardSlug, boardSlug))
  })
}

export async function syncCompaniesFromCrawl(
  boards: ValidatedBoard[],
  jobs: GreenhouseJobRow[]
): Promise<void> {
  await withDatabase(async (db) => {
    const now = new Date()
    const jobCountBySlug = new Map<string, number>()

    for (const job of jobs) {
      jobCountBySlug.set(
        job.boardSlug,
        (jobCountBySlug.get(job.boardSlug) ?? 0) + 1
      )
    }

    for (const board of boards) {
      const jobCount = jobCountBySlug.get(board.slug) ?? 0

      const [existing] = await db
        .select()
        .from(greenhouseCompanies)
        .where(eq(greenhouseCompanies.boardSlug, board.slug))
        .limit(1)

      if (!existing) {
        await db.insert(greenhouseCompanies).values({
          boardSlug: board.slug,
          companyName: board.company,
          source: "discovered",
          jobCount,
          lastSeenAt: now,
        })
        continue
      }

      if (existing.source === "manual") {
        await db
          .update(greenhouseCompanies)
          .set({
            companyName: board.company,
            jobCount,
            lastSeenAt: now,
          })
          .where(eq(greenhouseCompanies.boardSlug, board.slug))
        continue
      }

      await db
        .update(greenhouseCompanies)
        .set({
          companyName: board.company,
          source: "discovered",
          jobCount,
          lastSeenAt: now,
        })
        .where(eq(greenhouseCompanies.boardSlug, board.slug))
    }
  })
}
