import {
  CRAWL_USER_AGENT,
  getAllowedCrawlHosts,
  isHostAllowed,
} from "@/lib/greenhouse/config"
import {
  extractBoardSlugsFromText,
  extractLinksFromHtml,
} from "@/lib/greenhouse/extract-board-slugs"
import type { CrawlConfig } from "@/lib/greenhouse/types"

export interface DiscoveryResult {
  slugs: string[]
  pagesCrawled: number
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchPageHtml(
  url: string,
  fetchTimeoutMs: number
): Promise<string | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs)

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": CRAWL_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    })

    if (!response.ok) return null

    const contentType = response.headers.get("content-type") ?? ""
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return null
    }

    return await response.text()
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export async function discoverBoards(
  config: CrawlConfig
): Promise<DiscoveryResult> {
  const allowedHosts = getAllowedCrawlHosts(config.seedUrls)
  const discoveredSlugs = new Set<string>()
  const visited = new Set<string>()
  const queue: string[] = [...config.seedUrls]
  let pagesCrawled = 0

  while (queue.length > 0 && pagesCrawled < config.maxPages) {
    const url = queue.shift()
    if (!url || visited.has(url)) continue

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      continue
    }

    if (!isHostAllowed(parsedUrl.hostname, allowedHosts)) continue

    visited.add(url)
    pagesCrawled++

    const html = await fetchPageHtml(url, config.fetchTimeoutMs)
    if (!html) {
      await delay(config.requestDelayMs)
      continue
    }

    for (const slug of extractBoardSlugsFromText(html)) {
      discoveredSlugs.add(slug)
      if (discoveredSlugs.size >= config.maxBoards) break
    }

    if (discoveredSlugs.size >= config.maxBoards) break

    for (const link of extractLinksFromHtml(html, url)) {
      if (visited.has(link) || queue.includes(link)) continue
      if (queue.length + visited.size >= config.maxPages * 2) continue

      try {
        const linkHost = new URL(link).hostname
        if (isHostAllowed(linkHost, allowedHosts)) queue.push(link)
      } catch {
        continue
      }
    }

    await delay(config.requestDelayMs)
  }

  const slugs = [...discoveredSlugs].slice(0, config.maxBoards)

  return { slugs, pagesCrawled }
}
