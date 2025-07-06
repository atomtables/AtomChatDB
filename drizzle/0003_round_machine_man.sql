ALTER TABLE "template_newsgroup" DROP CONSTRAINT "template_newsgroup_replyTo_template_newsgroup_id_fk";
--> statement-breakpoint
ALTER TABLE "template_newsgroup" ADD CONSTRAINT "template_newsgroup_replyTo_template_newsgroup_id_fk" FOREIGN KEY ("replyTo") REFERENCES "public"."template_newsgroup"("id") ON DELETE cascade ON UPDATE cascade;