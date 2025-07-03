CREATE TABLE "guests" (
	"id" text PRIMARY KEY NOT NULL,
	"ipAddr" text NOT NULL,
	"username" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "guests_ipAddr_unique" UNIQUE("ipAddr"),
	CONSTRAINT "guests_username_unique" UNIQUE("username")
);
