const RESERVED_SLUGS = new Set([
  "embed",
  "jobs",
  "job_board",
  "v1",
  "boards",
])

const BOARD_SLUG_PATTERN =
  /(?:boards\.greenhouse\.io|boards-api\.greenhouse\.io\/v1\/boards)\/([a-zA-Z0-9][a-zA-Z0-9_-]*)/gi

const ENCODED_BOARD_SLUG_PATTERN =
  /boards(?:\.|%2E)greenhouse(?:\.|%2E)io(?:\/|%2F)([a-zA-Z0-9][a-zA-Z0-9_-]*)/gi

function safeDecodeUri(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function addSlug(slugs: Set<string>, raw: string | undefined) {
  const slug = raw?.toLowerCase()
  if (!slug || RESERVED_SLUGS.has(slug)) return
  slugs.add(slug)
}

export function normalizeBoardSlug(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const fromUrl = extractBoardSlugsFromText(trimmed)
  if (fromUrl.length > 0) return fromUrl[0] ?? null

  const slug = trimmed.toLowerCase().replace(/^\/+|\/+$/g, "")
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(slug)) return null
  if (RESERVED_SLUGS.has(slug)) return null

  return slug
}

export function extractBoardSlugsFromText(text: string): string[] {
  const slugs = new Set<string>()
  const sources = [text, safeDecodeUri(text)]

  for (const source of sources) {
    for (const match of source.matchAll(BOARD_SLUG_PATTERN)) {
      addSlug(slugs, match[1])
    }

    for (const match of source.matchAll(ENCODED_BOARD_SLUG_PATTERN)) {
      addSlug(slugs, match[1])
    }

    for (const match of source.matchAll(/uddg=([^&"'\\s]+)/gi)) {
      const decoded = safeDecodeUri(match[1] ?? "")
      for (const slugMatch of decoded.matchAll(BOARD_SLUG_PATTERN)) {
        addSlug(slugs, slugMatch[1])
      }
    }
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
