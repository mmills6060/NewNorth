import { CRAWL_USER_AGENT } from "@/lib/greenhouse/config"
import { extractBoardSlugsFromText } from "@/lib/greenhouse/extract-board-slugs"
import type { CrawlConfig } from "@/lib/greenhouse/types"

const DEFAULT_SEARCH_QUERIES = [
  "site:boards.greenhouse.io",
  "site:boards.greenhouse.io jobs",
  "boards.greenhouse.io careers",
]

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getSearchQueries(): string[] {
  const fromEnv = process.env.CRAWL_SEARCH_QUERIES?.split(",")
    .map((query) => query.trim())
    .filter(Boolean)

  return fromEnv?.length ? fromEnv : DEFAULT_SEARCH_QUERIES
}

async function searchDuckDuckGo(
  query: string,
  fetchTimeoutMs: number
): Promise<string[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs)

  try {
    const body = new URLSearchParams({ q: query })
    const response = await fetch("https://html.duckduckgo.com/html/", {
      method: "POST",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": CRAWL_USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html",
      },
      body,
    })

    if (!response.ok) return []

    const html = await response.text()
    return extractBoardSlugsFromText(html)
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

export function isBoardSearchEnabled(): boolean {
  const flag = process.env.CRAWL_SEARCH_ENABLED?.trim().toLowerCase()
  if (flag === "false" || flag === "0") return false
  return true
}

export async function searchGreenhouseBoards(
  config: CrawlConfig
): Promise<string[]> {
  if (!isBoardSearchEnabled()) return []

  const slugs = new Set<string>()
  const queries = getSearchQueries()

  for (const query of queries) {
    const found = await searchDuckDuckGo(query, config.fetchTimeoutMs)
    for (const slug of found) {
      slugs.add(slug)
      if (slugs.size >= config.maxBoards) break
    }

    if (slugs.size >= config.maxBoards) break
    await delay(config.requestDelayMs)
  }

  return [...slugs]
}
