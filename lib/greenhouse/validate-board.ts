import type {
  GreenhouseBoardApiResponse,
  ValidatedBoard,
} from "@/lib/greenhouse/types"
import { CRAWL_USER_AGENT } from "@/lib/greenhouse/config"

const GREENHOUSE_API_BASE = "https://boards-api.greenhouse.io/v1/boards"

export async function validateBoard(
  slug: string,
  fetchTimeoutMs: number
): Promise<ValidatedBoard | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs)

  try {
    const response = await fetch(`${GREENHOUSE_API_BASE}/${slug}`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { "User-Agent": CRAWL_USER_AGENT },
    })

    if (!response.ok) return null

    const data = (await response.json()) as GreenhouseBoardApiResponse
    const company = data.name?.trim() || slug

    return { slug, company }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export async function validateBoards(
  slugs: string[],
  options: { concurrency: number; fetchTimeoutMs: number }
): Promise<ValidatedBoard[]> {
  const validated: ValidatedBoard[] = []
  const queue = [...new Set(slugs)]

  async function worker() {
    while (queue.length > 0) {
      const slug = queue.shift()
      if (!slug) break

      const board = await validateBoard(slug, options.fetchTimeoutMs)
      if (board) validated.push(board)
    }
  }

  const workers = Array.from(
    { length: Math.min(options.concurrency, queue.length || 1) },
    () => worker()
  )

  await Promise.all(workers)
  return validated
}
