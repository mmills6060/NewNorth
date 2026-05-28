import Link from "next/link"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getGreenhouseSnapshot } from "@/lib/greenhouse/jobs-store"
import { getCrawlConfig } from "@/lib/greenhouse/config"

function formatDate(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(new Date(isoDate))
  } catch {
    return isoDate
  }
}

export async function JobsTable() {
  const { maxJobsDisplayed } = getCrawlConfig()
  const cache = await getGreenhouseSnapshot(maxJobsDisplayed)

  if (!cache || cache.jobs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        <p>No jobs cached yet.</p>
        <p className="mt-2">Use Refresh jobs above to discover and load postings.</p>
      </div>
    )
  }

  const isTruncated = cache.jobCount > cache.jobs.length
  const caption = isTruncated
    ? `Showing ${cache.jobs.length} of ${cache.jobCount} open roles from ${cache.boardCount} boards. Last updated ${formatDate(cache.fetchedAt)}.`
    : `${cache.jobCount} open roles from ${cache.boardCount} boards. Last updated ${formatDate(cache.fetchedAt)}.`

  return (
    <Table>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Link</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cache.jobs.map((job) => (
          <TableRow key={`${job.boardSlug}-${job.id}`}>
            <TableCell className="font-medium">{job.company}</TableCell>
            <TableCell>{job.title}</TableCell>
            <TableCell>{job.location}</TableCell>
            <TableCell>{formatDate(job.updatedAt)}</TableCell>
            <TableCell className="text-right">
              <Link
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                View
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
