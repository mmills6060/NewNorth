export type GreenhouseBoardSlug = string

export interface GreenhouseJobRow {
  id: number
  boardSlug: string
  company: string
  title: string
  location: string
  updatedAt: string
  url: string
}

export interface GreenhouseCacheSnapshot {
  fetchedAt: string
  boardCount: number
  jobCount: number
  jobs: GreenhouseJobRow[]
}

export interface ValidatedBoard {
  slug: GreenhouseBoardSlug
  company: string
}

export interface GreenhouseBoardApiResponse {
  name?: string
}

export interface GreenhouseJobApiItem {
  id: number
  title: string
  updated_at: string
  absolute_url: string
  location?: { name?: string }
}

export interface GreenhouseJobsApiResponse {
  jobs: GreenhouseJobApiItem[]
}

export interface CrawlConfig {
  seedUrls: string[]
  maxPages: number
  maxBoards: number
  concurrency: number
  fetchTimeoutMs: number
  requestDelayMs: number
  maxJobsDisplayed: number
}

export interface CrawlSummary {
  boards: number
  jobs: number
  fetchedAt: string
  pagesCrawled: number
  slugsDiscovered: number
}
