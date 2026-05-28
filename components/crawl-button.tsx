"use client"

import { useState, useTransition } from "react"

import { startCrawl } from "@/components/handlers/start-crawl"
import { Button } from "@/components/ui/button"

export function CrawlButton() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleStartCrawl() {
    setMessage(null)
    setError(null)

    startTransition(async () => {
      try {
        const summary = await startCrawl()
        setMessage(
          `Crawl complete: ${summary.jobs} jobs from ${summary.boards} boards (${summary.pagesCrawled} pages scanned).`
        )
      } catch {
        setError("Crawl failed. Check server logs for details.")
      }
    })
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <Button
        type="button"
        onClick={handleStartCrawl}
        disabled={isPending}
        className="shrink-0"
      >
        {isPending ? "Crawling…" : "Refresh jobs"}
      </Button>
      {message ? (
        <p className="max-w-sm text-right text-xs text-muted-foreground">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="max-w-sm text-right text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
