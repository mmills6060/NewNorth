"use server"

import { revalidatePath } from "next/cache"

import { runGreenhouseCrawl } from "@/lib/greenhouse/run-crawl"
import type { CrawlSummary } from "@/lib/greenhouse/types"

export async function startCrawl(): Promise<CrawlSummary> {
  const summary = await runGreenhouseCrawl()
  revalidatePath("/")
  return summary
}
