import {
  getTrackedCompanySlugs,
  syncCompaniesFromCrawl,
} from "@/lib/greenhouse/companies-store"
import { getCrawlConfig } from "@/lib/greenhouse/config"
import { discoverAllBoards } from "@/lib/greenhouse/discover-all-boards"
import { fetchAllJobs } from "@/lib/greenhouse/fetch-jobs"
import { saveCrawlResults } from "@/lib/greenhouse/jobs-store"
import { validateBoards } from "@/lib/greenhouse/validate-board"
import type { CrawlSummary } from "@/lib/greenhouse/types"

export async function runGreenhouseCrawl(): Promise<CrawlSummary> {
  const config = getCrawlConfig()
  const { slugs: discoveredSlugs, pagesCrawled } = await discoverAllBoards(config)
  const trackedSlugs = await getTrackedCompanySlugs()
  const slugs = [...new Set([...trackedSlugs, ...discoveredSlugs])].slice(
    0,
    config.maxBoards
  )

  const validatedBoards = await validateBoards(slugs, {
    concurrency: config.concurrency,
    fetchTimeoutMs: config.fetchTimeoutMs,
  })

  const allJobs = await fetchAllJobs(validatedBoards, {
    concurrency: config.concurrency,
    fetchTimeoutMs: config.fetchTimeoutMs,
  })

  await syncCompaniesFromCrawl(validatedBoards, allJobs)

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
