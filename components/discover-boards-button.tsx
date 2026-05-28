"use client"

import { useState, useTransition } from "react"

import { discoverBoards } from "@/components/handlers/discover-boards"
import { Button } from "@/components/ui/button"

export function DiscoverBoardsButton() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleDiscover() {
    setMessage(null)
    setError(null)

    startTransition(async () => {
      try {
        const summary = await discoverBoards()
        setMessage(
          `Found ${summary.boards} boards (${summary.probeHits} probed, ${summary.crawlHits} crawled, ${summary.searchHits} searched).`
        )
      } catch {
        setError("Board discovery failed. Check server logs for details.")
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleDiscover}
        disabled={isPending}
        className="w-fit"
      >
        {isPending ? "Searching…" : "Search for boards"}
      </Button>
      {message ? (
        <p className="text-xs text-muted-foreground">{message}</p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
