CREATE SCHEMA "books";
--> statement-breakpoint
CREATE TABLE "books"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"authentication_id" text NOT NULL,
	"display_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
