CREATE TABLE `instructor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL
);
--> statement-breakpoint
CREATE TABLE `instructor_identities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`instructor_id` integer NOT NULL,
	`name` text NOT NULL,
	`image_url` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`instructor_id`) REFERENCES `instructor`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workshop` (
	`id` integer PRIMARY KEY NOT NULL,
	`school_id` integer NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`is_visible_on_discovery_page` integer NOT NULL,
	`is_canceled` integer NOT NULL,
	`is_delisted` integer NOT NULL,
	`connected_course_id` integer,
	`start_datetime` text NOT NULL,
	`end_datetime` text NOT NULL,
	`duration_min` integer NOT NULL,
	`timezone` text NOT NULL,
	`has_internal_recording` integer NOT NULL,
	`is_recording_public` integer NOT NULL,
	`num_signups` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workshop_instructors` (
	`workshop_id` integer NOT NULL,
	`instructor_id` integer NOT NULL,
	PRIMARY KEY(`workshop_id`, `instructor_id`),
	FOREIGN KEY (`workshop_id`) REFERENCES `workshop`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`instructor_id`) REFERENCES `instructor`(`id`) ON UPDATE no action ON DELETE no action
);
