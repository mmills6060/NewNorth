import { NextResponse } from "next/server"

import { runGreenhouseCrawl } from "@/lib/greenhouse/run-crawl"

export const maxDuration = 300

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRAWL_SECRET?.trim()
  if (!secret) return process.env.NODE_ENV !== "production"

  const headerSecret = request.headers.get("x-crawl-secret")
  if (headerSecret === secret) return true

  try {
    const url = new URL(request.url)
    return url.searchParams.get("secret") === secret
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const summary = await runGreenhouseCrawl()
    return NextResponse.json(summary)
  } catch (error) {
    console.error("Greenhouse crawl failed:", error)
    return NextResponse.json(
      { error: "Crawl failed. Check server logs for details." },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  return POST(request)
}
