CREATE TABLE "groups" (
	"address" text PRIMARY KEY NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_chatgroup" (
	"id" text PRIMARY KEY NOT NULL,
	"content" varchar(1999) NOT NULL,
	"image64" text,
	"username" text NOT NULL,
	"authorId" text,
	"sentByGuest" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_newsgroup" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"content" varchar(1999) NOT NULL,
	"replyTo" text,
	"image64" text,
	"username" text NOT NULL,
	"authorId" text,
	"sentByGuest" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_newsgroup" ADD CONSTRAINT "template_newsgroup_replyTo_template_newsgroup_id_fk" FOREIGN KEY ("replyTo") REFERENCES "public"."template_newsgroup"("id") ON DELETE no action ON UPDATE no action;