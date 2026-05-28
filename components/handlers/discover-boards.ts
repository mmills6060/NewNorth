"use server"

import { revalidatePath } from "next/cache"

import { runBoardDiscovery } from "@/lib/greenhouse/run-board-discovery"
import type { BoardDiscoverySummary } from "@/lib/greenhouse/types"

export async function discoverBoards(): Promise<BoardDiscoverySummary> {
  const summary = await runBoardDiscovery()
  revalidatePath("/")
  return summary
}
