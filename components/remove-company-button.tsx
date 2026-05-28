"use client"

import { useTransition } from "react"

import { removeCompany } from "@/components/handlers/remove-company"
import { Button } from "@/components/ui/button"

interface RemoveCompanyButtonProps {
  boardSlug: string
}

export function RemoveCompanyButton({ boardSlug }: RemoveCompanyButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    startTransition(async () => {
      await removeCompany(boardSlug)
    })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={handleRemove}
      className="shrink-0 text-destructive hover:text-destructive"
    >
      {isPending ? "Removing…" : "Remove"}
    </Button>
  )
}
