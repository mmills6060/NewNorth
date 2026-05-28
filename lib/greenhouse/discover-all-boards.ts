import { discoverBoards } from "@/lib/greenhouse/discover-boards"
import { probeGreenhouseBoards } from "@/lib/greenhouse/probe-boards"
import { searchGreenhouseBoards } from "@/lib/greenhouse/search-boards"
import type { CrawlConfig } from "@/lib/greenhouse/types"

export interface AllBoardsDiscoveryResult {
  slugs: string[]
  pagesCrawled: number
  searchHits: number
  crawlHits: number
  probeHits: number
}

export async function discoverAllBoards(
  config: CrawlConfig
): Promise<AllBoardsDiscoveryResult> {
  const [crawlResult, searchSlugs, probeSlugs] = await Promise.all([
    discoverBoards(config),
    searchGreenhouseBoards(config),
    probeGreenhouseBoards(config),
  ])

  const slugs = [
    ...new Set([...probeSlugs, ...crawlResult.slugs, ...searchSlugs]),
  ].slice(0, config.maxBoards)

  return {
    slugs,
    pagesCrawled: crawlResult.pagesCrawled,
    searchHits: searchSlugs.length,
    crawlHits: crawlResult.slugs.length,
    probeHits: probeSlugs.length,
  }
}
