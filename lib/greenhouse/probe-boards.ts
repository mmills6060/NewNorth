import { getBoardCandidates } from "@/lib/greenhouse/board-candidates"
import { CRAWL_USER_AGENT } from "@/lib/greenhouse/config"
import type { CrawlConfig } from "@/lib/greenhouse/types"

const GREENHOUSE_API_BASE = "https://boards-api.greenhouse.io/v1/boards"

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed <= 0) return fallback
  return parsed
}

export function isBoardProbeEnabled(): boolean {
  const flag = process.env.CRAWL_PROBE_ENABLED?.trim().toLowerCase()
  if (flag === "false" || flag === "0") return false
  return true
}

function getMaxProbeCandidates(): number {
  return parsePositiveInt(process.env.CRAWL_PROBE_MAX_CANDIDATES, 400)
}

async function probeSlug(
  slug: string,
  fetchTimeoutMs: number
): Promise<string | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs)

  try {
    const response = await fetch(`${GREENHOUSE_API_BASE}/${slug}`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { "User-Agent": CRAWL_USER_AGENT },
    })

    return response.ok ? slug : null
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export async function probeGreenhouseBoards(
  config: CrawlConfig
): Promise<string[]> {
  if (!isBoardProbeEnabled()) return []

  const candidates = getBoardCandidates().slice(0, getMaxProbeCandidates())
  const validated = new Set<string>()
  const queue = [...candidates]

  async function worker() {
    while (queue.length > 0) {
      const slug = queue.shift()
      if (!slug) break

      const match = await probeSlug(slug, config.fetchTimeoutMs)
      if (match) validated.add(match)

      if (validated.size >= config.maxBoards) break

      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(config.requestDelayMs, 100))
      )
    }
  }

  const workers = Array.from(
    { length: Math.min(config.concurrency, queue.length || 1) },
    () => worker()
  )

  await Promise.all(workers)

  return [...validated]
}
