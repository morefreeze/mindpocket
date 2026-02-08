ALTER TABLE "bookmark" ADD COLUMN "source_type" text;--> statement-breakpoint
ALTER TABLE "bookmark" ADD COLUMN "file_url" text;--> statement-breakpoint
ALTER TABLE "bookmark" ADD COLUMN "file_extension" text;--> statement-breakpoint
ALTER TABLE "bookmark" ADD COLUMN "file_size" integer;--> statement-breakpoint
ALTER TABLE "bookmark" ADD COLUMN "ingest_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookmark" ADD COLUMN "ingest_error" text;