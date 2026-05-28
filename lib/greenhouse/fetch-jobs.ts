import type {
  GreenhouseJobRow,
  GreenhouseJobsApiResponse,
  ValidatedBoard,
} from "@/lib/greenhouse/types"
import { CRAWL_USER_AGENT } from "@/lib/greenhouse/config"

const GREENHOUSE_API_BASE = "https://boards-api.greenhouse.io/v1/boards"

async function fetchJobsForBoard(
  board: ValidatedBoard,
  fetchTimeoutMs: number
): Promise<GreenhouseJobRow[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs)

  try {
    const response = await fetch(`${GREENHOUSE_API_BASE}/${board.slug}/jobs`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { "User-Agent": CRAWL_USER_AGENT },
    })

    if (!response.ok) return []

    const data = (await response.json()) as GreenhouseJobsApiResponse

    return (data.jobs ?? []).map((job) => ({
      id: job.id,
      boardSlug: board.slug,
      company: board.company,
      title: job.title,
      location: job.location?.name ?? "—",
      updatedAt: job.updated_at,
      url: job.absolute_url,
    }))
  } catch (error) {
    console.error(`Failed to fetch jobs for board ${board.slug}:`, error)
    return []
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchAllJobs(
  boards: ValidatedBoard[],
  options: { concurrency: number; fetchTimeoutMs: number }
): Promise<GreenhouseJobRow[]> {
  const jobs: GreenhouseJobRow[] = []
  const queue = [...boards]

  async function worker() {
    while (queue.length > 0) {
      const board = queue.shift()
      if (!board) break

      const boardJobs = await fetchJobsForBoard(board, options.fetchTimeoutMs)
      jobs.push(...boardJobs)
    }
  }

  const workers = Array.from(
    { length: Math.min(options.concurrency, queue.length || 1) },
    () => worker()
  )

  await Promise.all(workers)

  return jobs.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}
