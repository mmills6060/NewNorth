import { count, desc } from "drizzle-orm"

import { withDatabase } from "@/lib/db"
import {
  greenhouseCrawlRuns,
  greenhouseJobs,
} from "@/lib/db/schema"
import type {
  GreenhouseCacheSnapshot,
  GreenhouseJobRow,
} from "@/lib/greenhouse/types"

const INSERT_BATCH_SIZE = 200

function toJobRow(
  job: typeof greenhouseJobs.$inferSelect
): GreenhouseJobRow {
  return {
    id: job.greenhouseId,
    boardSlug: job.boardSlug,
    company: job.company,
    title: job.title,
    location: job.location,
    updatedAt: job.updatedAt.toISOString(),
    url: job.url,
  }
}

export async function saveCrawlResults(
  jobs: GreenhouseJobRow[],
  meta: {
    boardCount: number
    pagesCrawled: number
    slugsDiscovered: number
  }
): Promise<{ fetchedAt: string; jobCount: number }> {
  const crawledAt = new Date()
  const fetchedAt = crawledAt.toISOString()

  await withDatabase(async (db) => {
    await db.transaction(async (tx) => {
    await tx.delete(greenhouseJobs)

    for (let i = 0; i < jobs.length; i += INSERT_BATCH_SIZE) {
      const batch = jobs.slice(i, i + INSERT_BATCH_SIZE)
      if (batch.length === 0) continue

      await tx.insert(greenhouseJobs).values(
        batch.map((job) => ({
          boardSlug: job.boardSlug,
          greenhouseId: job.id,
          company: job.company,
          title: job.title,
          location: job.location,
          updatedAt: new Date(job.updatedAt),
          url: job.url,
          crawledAt,
        }))
      )
    }

    await tx.insert(greenhouseCrawlRuns).values({
      fetchedAt: crawledAt,
      boardCount: meta.boardCount,
      jobCount: jobs.length,
      pagesCrawled: meta.pagesCrawled,
      slugsDiscovered: meta.slugsDiscovered,
    })
    })
  })

  return { fetchedAt, jobCount: jobs.length }
}

export async function getGreenhouseSnapshot(
  maxJobs: number
): Promise<GreenhouseCacheSnapshot | null> {
  return withDatabase(async (db) => {
    const [latestRun] = await db
      .select()
      .from(greenhouseCrawlRuns)
      .orderBy(desc(greenhouseCrawlRuns.fetchedAt))
      .limit(1)

    if (!latestRun) return null

    const [jobCountRow] = await db
      .select({ value: count() })
      .from(greenhouseJobs)

    const jobCount = jobCountRow?.value ?? 0
    if (jobCount === 0) return null

    const rows = await db
      .select()
      .from(greenhouseJobs)
      .orderBy(desc(greenhouseJobs.updatedAt))
      .limit(maxJobs)

    return {
      fetchedAt: latestRun.fetchedAt.toISOString(),
      boardCount: latestRun.boardCount,
      jobCount,
      jobs: rows.map(toJobRow),
    }
  })
}
