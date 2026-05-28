CREATE TABLE `greenhouse_companies` (
	`board_slug` varchar(255) NOT NULL,
	`company_name` varchar(255) NOT NULL,
	`source_input` varchar(2048),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `greenhouse_companies_board_slug` PRIMARY KEY(`board_slug`)
);
