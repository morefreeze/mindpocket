CREATE TABLE "bookmark" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"folder_id" text,
	"type" text DEFAULT 'link' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text,
	"content" text,
	"cover_image" text,
	"metadata" jsonb,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "folder" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"emoji" text DEFAULT '📁' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmark_tag" (
	"bookmark_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "bookmark_tag_bookmark_id_tag_id_pk" PRIMARY KEY("bookmark_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tag_userId_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_folder_id_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folder"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder" ADD CONSTRAINT "folder_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmark_tag" ADD CONSTRAINT "bookmark_tag_bookmark_id_bookmark_id_fk" FOREIGN KEY ("bookmark_id") REFERENCES "public"."bookmark"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmark_tag" ADD CONSTRAINT "bookmark_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag" ADD CONSTRAINT "tag_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookmark_userId_idx" ON "bookmark" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookmark_folderId_idx" ON "bookmark" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "bookmark_type_idx" ON "bookmark" USING btree ("type");--> statement-breakpoint
CREATE INDEX "bookmark_createdAt_idx" ON "bookmark" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "folder_userId_idx" ON "folder" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookmarkTag_tagId_idx" ON "bookmark_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "tag_userId_idx" ON "tag" USING btree ("user_id");