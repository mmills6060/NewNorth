import { getCrawlConfig } from "@/lib/greenhouse/config"
import { discoverBoards } from "@/lib/greenhouse/discover-boards"
import { fetchAllJobs } from "@/lib/greenhouse/fetch-jobs"
import { saveCrawlResults } from "@/lib/greenhouse/jobs-store"
import { validateBoards } from "@/lib/greenhouse/validate-board"
import type { CrawlSummary } from "@/lib/greenhouse/types"

export async function runGreenhouseCrawl(): Promise<CrawlSummary> {
  const config = getCrawlConfig()
  const { slugs, pagesCrawled } = await discoverBoards(config)

  const validatedBoards = await validateBoards(slugs, {
    concurrency: config.concurrency,
    fetchTimeoutMs: config.fetchTimeoutMs,
  })

  const allJobs = await fetchAllJobs(validatedBoards, {
    concurrency: config.concurrency,
    fetchTimeoutMs: config.fetchTimeoutMs,
  })

  const { fetchedAt, jobCount } = await saveCrawlResults(allJobs, {
    boardCount: validatedBoards.length,
    pagesCrawled,
    slugsDiscovered: slugs.length,
  })

  return {
    boards: validatedBoards.length,
    jobs: jobCount,
    fetchedAt,
    pagesCrawled,
    slugsDiscovered: slugs.length,
  }
}
