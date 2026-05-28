CREATE TABLE `greenhouse_crawl_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fetched_at` timestamp NOT NULL,
	`board_count` int NOT NULL,
	`job_count` int NOT NULL,
	`pages_crawled` int NOT NULL,
	`slugs_discovered` int NOT NULL,
	CONSTRAINT `greenhouse_crawl_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `greenhouse_jobs` (
	`board_slug` varchar(255) NOT NULL,
	`greenhouse_id` bigint NOT NULL,
	`company` varchar(255) NOT NULL,
	`title` varchar(500) NOT NULL,
	`location` varchar(255) NOT NULL,
	`updated_at` timestamp NOT NULL,
	`url` varchar(2048) NOT NULL,
	`crawled_at` timestamp NOT NULL,
	CONSTRAINT `greenhouse_jobs_board_slug_greenhouse_id_pk` PRIMARY KEY(`board_slug`,`greenhouse_id`)
);
