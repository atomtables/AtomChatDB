ALTER TABLE "group_template" ADD COLUMN "imageId" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" boolean;--> statement-breakpoint
ALTER TABLE "group_template" DROP COLUMN "image64";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "image64";