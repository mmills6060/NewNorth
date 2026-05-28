import type { CrawlConfig } from "@/lib/greenhouse/types"

const DEFAULT_SEED_URLS = [
  "https://jobspipe.dev/sources/greenhouse",
  "https://www.ycombinator.com/jobs",
]

const KNOWN_CRAWL_HOST_SUFFIXES = [
  "ycombinator.com",
  "jobspipe.dev",
  "workatastartup.com",
  "github.com",
  "gist.github.com",
]

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed <= 0) return fallback
  return parsed
}

export function getCrawlConfig(): CrawlConfig {
  const envSeeds = process.env.CRAWL_SEED_URLS?.split(",")
    .map((url) => url.trim())
    .filter(Boolean)

  return {
    seedUrls: envSeeds?.length ? envSeeds : DEFAULT_SEED_URLS,
    maxPages: parsePositiveInt(process.env.CRAWL_MAX_PAGES, 100),
    maxBoards: parsePositiveInt(process.env.CRAWL_MAX_BOARDS, 500),
    concurrency: parsePositiveInt(process.env.CRAWL_CONCURRENCY, 5),
    fetchTimeoutMs: parsePositiveInt(process.env.CRAWL_FETCH_TIMEOUT_MS, 15000),
    requestDelayMs: parsePositiveInt(process.env.CRAWL_REQUEST_DELAY_MS, 300),
    maxJobsDisplayed: parsePositiveInt(process.env.CRAWL_MAX_JOBS_DISPLAYED, 500),
  }
}

export function getAllowedCrawlHosts(seedUrls: string[]): Set<string> {
  const hosts = new Set<string>()

  for (const seedUrl of seedUrls) {
    try {
      hosts.add(new URL(seedUrl).hostname)
    } catch {
      continue
    }
  }

  for (const suffix of KNOWN_CRAWL_HOST_SUFFIXES) {
    hosts.add(suffix)
  }

  return hosts
}

export function isHostAllowed(hostname: string, allowedHosts: Set<string>): boolean {
  if (allowedHosts.has(hostname)) return true

  for (const allowed of allowedHosts) {
    if (hostname === allowed || hostname.endsWith(`.${allowed}`)) return true
  }

  return false
}

export const CRAWL_USER_AGENT =
  "NewNorth-GreenhouseCrawler/1.0 (+https://github.com/newnorth; job-discovery)"
