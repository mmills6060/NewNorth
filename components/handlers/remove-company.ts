"use server"

import { revalidatePath } from "next/cache"

import { removeTrackedCompany } from "@/lib/greenhouse/companies-store"

export async function removeCompany(boardSlug: string): Promise<void> {
  await removeTrackedCompany(boardSlug)
  revalidatePath("/")
}
