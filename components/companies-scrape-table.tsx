import Link from "next/link"

import { AddCompanyForm } from "@/components/add-company-form"
import { AutoDiscoverBoards } from "@/components/auto-discover-boards"
import { DiscoverBoardsButton } from "@/components/discover-boards-button"
import { RemoveCompanyButton } from "@/components/remove-company-button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listScrapeableCompanies } from "@/lib/greenhouse/companies-store"

function formatDate(date: Date | null): string {
  if (!date) return "—"

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(date)
  } catch {
    return "—"
  }
}

function boardUrl(boardSlug: string): string {
  return `https://boards.greenhouse.io/${boardSlug}`
}

export async function CompaniesScrapeTable() {
  const companies = await listScrapeableCompanies()
  const lastSeenAt = companies.reduce<Date | null>((latest, company) => {
    if (!company.lastSeenAt) return latest
    if (!latest || company.lastSeenAt > latest) return company.lastSeenAt
    return latest
  }, null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          Greenhouse boards you can scrape. Discovery probes known company slugs,
          crawls seed pages, and runs web search — or add boards manually.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <DiscoverBoardsButton />
        <AutoDiscoverBoards
          companyCount={companies.length}
          lastSeenAt={lastSeenAt?.toISOString() ?? null}
        />
      </div>

      <AddCompanyForm />

      {companies.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          <p>No companies yet.</p>
          <p className="mt-2">
            Add a board above or run Refresh jobs to discover companies from seed
            pages.
          </p>
        </div>
      ) : (
        <Table>
          <TableCaption>
            {companies.length} companies available to scrape.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Board slug</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Open jobs</TableHead>
              <TableHead>Last seen</TableHead>
              <TableHead className="text-right">Board</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.boardSlug}>
                <TableCell className="font-medium">
                  {company.companyName}
                </TableCell>
                <TableCell>{company.boardSlug}</TableCell>
                <TableCell className="capitalize">{company.source}</TableCell>
                <TableCell className="text-right">{company.jobCount}</TableCell>
                <TableCell>{formatDate(company.lastSeenAt)}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={boardUrl(company.boardSlug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <RemoveCompanyButton boardSlug={company.boardSlug} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
