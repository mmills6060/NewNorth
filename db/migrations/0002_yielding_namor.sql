ALTER TABLE `greenhouse_companies` ADD `source` varchar(20) DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE `greenhouse_companies` ADD `job_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `greenhouse_companies` ADD `last_seen_at` timestamp;