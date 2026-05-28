const RESERVED_SLUGS = new Set([
  "embed",
  "jobs",
  "job_board",
  "v1",
  "boards",
])

const BOARD_SLUG_PATTERN =
  /(?:boards\.greenhouse\.io|boards-api\.greenhouse\.io\/v1\/boards)\/([a-zA-Z0-9][a-zA-Z0-9_-]*)/gi

export function extractBoardSlugsFromText(text: string): string[] {
  const slugs = new Set<string>()
  const matches = text.matchAll(BOARD_SLUG_PATTERN)

  for (const match of matches) {
    const slug = match[1]?.toLowerCase()
    if (!slug || RESERVED_SLUGS.has(slug)) continue
    slugs.add(slug)
  }

  return [...slugs]
}

export function extractLinksFromHtml(html: string, baseUrl: string): string[] {
  const links = new Set<string>()
  const hrefPattern = /href=["']([^"']+)["']/gi
  const matches = html.matchAll(hrefPattern)

  for (const match of matches) {
    const href = match[1]
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) continue

    try {
      const resolved = new URL(href, baseUrl).href
      if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
        links.add(resolved)
      }
    } catch {
      continue
    }
  }

  return [...links]
}
