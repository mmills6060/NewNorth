import {
  bigint,
  int,
  mysqlTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core"

export const greenhouseJobs = mysqlTable(
  "greenhouse_jobs",
  {
    boardSlug: varchar("board_slug", { length: 255 }).notNull(),
    greenhouseId: bigint("greenhouse_id", { mode: "number" }).notNull(),
    company: varchar("company", { length: 255 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    url: varchar("url", { length: 2048 }).notNull(),
    crawledAt: timestamp("crawled_at").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.boardSlug, table.greenhouseId] }),
  })
)

export const greenhouseCrawlRuns = mysqlTable("greenhouse_crawl_runs", {
  id: int("id").primaryKey().autoincrement(),
  fetchedAt: timestamp("fetched_at").notNull(),
  boardCount: int("board_count").notNull(),
  jobCount: int("job_count").notNull(),
  pagesCrawled: int("pages_crawled").notNull(),
  slugsDiscovered: int("slugs_discovered").notNull(),
})
