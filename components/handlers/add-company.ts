"use server"

import { revalidatePath } from "next/cache"

import { addTrackedCompany } from "@/lib/greenhouse/companies-store"
import { normalizeBoardSlug } from "@/lib/greenhouse/extract-board-slugs"
import { validateBoard } from "@/lib/greenhouse/validate-board"

export interface AddCompanyResult {
  ok: boolean
  error?: string
  boardSlug?: string
  companyName?: string
}

export async function addCompany(input: string): Promise<AddCompanyResult> {
  const boardSlug = normalizeBoardSlug(input)
  if (!boardSlug) {
    return {
      ok: false,
      error:
        "Enter a valid Greenhouse board slug (e.g. stripe) or URL (e.g. boards.greenhouse.io/stripe).",
    }
  }

  const board = await validateBoard(boardSlug, 15000)
  if (!board) {
    return {
      ok: false,
      error: `No public Greenhouse board found for "${boardSlug}".`,
    }
  }

  await addTrackedCompany({
    boardSlug: board.slug,
    companyName: board.company,
    sourceInput: input.trim(),
  })

  revalidatePath("/")

  return {
    ok: true,
    boardSlug: board.slug,
    companyName: board.company,
  }
}
