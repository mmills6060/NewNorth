"use client"

import { useEffect, useRef, useState } from "react"

import { discoverBoards } from "@/components/handlers/discover-boards"

const SESSION_KEY = "newnorth-board-discovery-ran"

const STALE_MS = 6 * 60 * 60 * 1000

interface AutoDiscoverBoardsProps {
  companyCount: number
  lastSeenAt: string | null
}

export function AutoDiscoverBoards({
  companyCount,
  lastSeenAt,
}: AutoDiscoverBoardsProps) {
  const startedRef = useRef(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (startedRef.current) return
    if (sessionStorage.getItem(SESSION_KEY) === "1") return

    const lastSeenMs = lastSeenAt ? new Date(lastSeenAt).getTime() : 0
    const isStale = Date.now() - lastSeenMs > STALE_MS
    const shouldRun = companyCount === 0 || isStale

    if (!shouldRun) return

    startedRef.current = true
    sessionStorage.setItem(SESSION_KEY, "1")

    discoverBoards()
      .then((summary) => {
        setStatus(
          `Auto-discovery found ${summary.boards} boards. Run Refresh jobs to load postings.`
        )
      })
      .catch(() => {
        setStatus(null)
        sessionStorage.removeItem(SESSION_KEY)
      })
  }, [companyCount, lastSeenAt])

  if (!status) return null

  return <p className="text-xs text-muted-foreground">{status}</p>
}
