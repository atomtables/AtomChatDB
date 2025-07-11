CREATE TABLE "group_template" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"content" varchar(1999) NOT NULL,
	"replyTo" text,
	"image64" text,
	"username" text NOT NULL,
	"authorId" text,
	"sentByGuest" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DROP TABLE "template_chatgroup" CASCADE;--> statement-breakpoint
DROP TABLE "template_newsgroup" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image64" text;--> statement-breakpoint
ALTER TABLE "group_template" ADD CONSTRAINT "group_template_replyTo_group_template_id_fk" FOREIGN KEY ("replyTo") REFERENCES "public"."group_template"("id") ON DELETE no action ON UPDATE no action;