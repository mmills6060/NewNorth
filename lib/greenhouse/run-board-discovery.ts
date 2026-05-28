import { getTrackedCompanySlugs, syncCompaniesFromCrawl } from "@/lib/greenhouse/companies-store"
import { getCrawlConfig } from "@/lib/greenhouse/config"
import { discoverAllBoards } from "@/lib/greenhouse/discover-all-boards"
import { validateBoards } from "@/lib/greenhouse/validate-board"
import type { BoardDiscoverySummary } from "@/lib/greenhouse/types"

export async function runBoardDiscovery(): Promise<BoardDiscoverySummary> {
  const config = getCrawlConfig()
  const trackedSlugs = await getTrackedCompanySlugs()

  const {
    slugs: discoveredSlugs,
    pagesCrawled,
    searchHits,
    crawlHits,
    probeHits,
  } = await discoverAllBoards(config)

  const slugs = [...new Set([...trackedSlugs, ...discoveredSlugs])].slice(
    0,
    config.maxBoards
  )

  const validatedBoards = await validateBoards(slugs, {
    concurrency: config.concurrency,
    fetchTimeoutMs: config.fetchTimeoutMs,
  })

  await syncCompaniesFromCrawl(validatedBoards, [])

  return {
    boards: validatedBoards.length,
    fetchedAt: new Date().toISOString(),
    pagesCrawled,
    slugsDiscovered: slugs.length,
    searchHits,
    crawlHits,
    probeHits,
    newlyValidated: validatedBoards.length,
  }
}
