"use client"

import { type FormEvent, useRef, useState, useTransition } from "react"

import { addCompany } from "@/components/handlers/add-company"
import { Button } from "@/components/ui/button"

export function AddCompanyForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const input = String(formData.get("company") ?? "")

    startTransition(async () => {
      const result = await addCompany(input)

      if (!result.ok) {
        setError(result.error ?? "Could not add company.")
        return
      }

      formRef.current?.reset()
      setMessage(`Added ${result.companyName} (${result.boardSlug}).`)
    })
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-start"
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="company" className="sr-only">
          Company board slug or Greenhouse URL
        </label>
        <input
          id="company"
          name="company"
          type="text"
          required
          disabled={isPending}
          placeholder="stripe or boards.greenhouse.io/stripe"
          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
        />
        {message ? (
          <p className="text-xs text-muted-foreground">{message}</p>
        ) : null}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
      <Button type="submit" disabled={isPending} variant="outline">
        {isPending ? "Adding…" : "Add company"}
      </Button>
    </form>
  )
}
