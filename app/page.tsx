import { CrawlButton } from "@/components/crawl-button"
import { JobsTable } from "@/components/jobs-table"

export default function Page() {
  return (
    <main className="min-h-svh bg-background p-6 md:p-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Open roles</h1>
            <p className="text-sm text-muted-foreground">
              Job postings discovered from public Greenhouse job boards.
            </p>
          </div>
          <CrawlButton />
        </header>
        <JobsTable />
      </div>
    </main>
  )
}
