CREATE TABLE `instructor` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`image_url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workshop` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`image_url` text NOT NULL,
	`is_canceled` integer NOT NULL,
	`is_delisted` integer NOT NULL,
	`is_featured` integer NOT NULL,
	`start_timestamp` integer NOT NULL,
	`end_timestamp` integer NOT NULL,
	`duration_min` integer NOT NULL,
	`has_internal_recording` integer NOT NULL,
	`is_recording_public` integer NOT NULL,
	`num_signups` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workshop_instructors` (
	`workshop_id` integer NOT NULL,
	`instructor_id` text NOT NULL,
	PRIMARY KEY(`workshop_id`, `instructor_id`),
	FOREIGN KEY (`workshop_id`) REFERENCES `workshop`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`instructor_id`) REFERENCES `instructor`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workshop_tag` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workshop_tags` (
	`workshop_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`workshop_id`, `tag_id`),
	FOREIGN KEY (`workshop_id`) REFERENCES `workshop`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `workshop_tag`(`id`) ON UPDATE no action ON DELETE no action
);
