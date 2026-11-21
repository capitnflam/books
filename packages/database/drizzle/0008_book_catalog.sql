CREATE TYPE "books"."contributor_role" AS ENUM('author', 'editor', 'illustrator', 'translator', 'narrator', 'introduction');--> statement-breakpoint
CREATE TYPE "books"."edition_format" AS ENUM('hardcover', 'paperback', 'mass_market_paperback', 'ebook', 'audiobook', 'other');--> statement-breakpoint
CREATE TABLE "books"."authors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"sort_name" text NOT NULL,
	"biography" text,
	"birth_year" smallint,
	"death_year" smallint,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "authors_lifespan" CHECK ("books"."authors"."death_year" is null or "books"."authors"."birth_year" is null or "books"."authors"."death_year" >= "books"."authors"."birth_year")
);
--> statement-breakpoint
CREATE TABLE "books"."book_contributors" (
	"book_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"role" "books"."contributor_role" DEFAULT 'author' NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "book_contributors_book_id_author_id_role_pk" PRIMARY KEY("book_id","author_id","role")
);
--> statement-breakpoint
CREATE TABLE "books"."book_series" (
	"book_id" uuid NOT NULL,
	"series_id" uuid NOT NULL,
	"position" numeric(6, 2),
	CONSTRAINT "book_series_book_id_series_id_pk" PRIMARY KEY("book_id","series_id"),
	CONSTRAINT "book_series_position" CHECK ("books"."book_series"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "books"."book_subjects" (
	"book_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	CONSTRAINT "book_subjects_book_id_subject_id_pk" PRIMARY KEY("book_id","subject_id")
);
--> statement-breakpoint
CREATE TABLE "books"."books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"sort_title" text NOT NULL,
	"description" text,
	"original_language" text,
	"first_published_year" smallint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books"."edition_contributors" (
	"edition_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"role" "books"."contributor_role" NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "edition_contributors_edition_id_author_id_role_pk" PRIMARY KEY("edition_id","author_id","role")
);
--> statement-breakpoint
CREATE TABLE "books"."editions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"title" text,
	"subtitle" text,
	"edition_statement" text,
	"publisher_id" uuid,
	"published_year" smallint,
	"published_on" date,
	"isbn13" text,
	"isbn10" text,
	"language" text,
	"format" "books"."edition_format",
	"page_count" integer,
	"duration_minutes" integer,
	"cover_image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "editions_isbn13_unique" UNIQUE("isbn13"),
	CONSTRAINT "editions_isbn10_unique" UNIQUE("isbn10"),
	CONSTRAINT "editions_isbn13_format" CHECK ("books"."editions"."isbn13" ~ '^97[89][0-9]{10}$'),
	CONSTRAINT "editions_isbn10_format" CHECK ("books"."editions"."isbn10" ~ '^[0-9]{9}[0-9X]$'),
	CONSTRAINT "editions_page_count" CHECK ("books"."editions"."page_count" > 0),
	CONSTRAINT "editions_duration_minutes" CHECK ("books"."editions"."duration_minutes" > 0),
	CONSTRAINT "editions_published_on_year" CHECK ("books"."editions"."published_on" is null or ("books"."editions"."published_year" is not null and extract(year from "books"."editions"."published_on") = "books"."editions"."published_year"))
);
--> statement-breakpoint
CREATE TABLE "books"."publishers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "publishers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "books"."series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"sort_name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books"."subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subjects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "books"."book_contributors" ADD CONSTRAINT "book_contributors_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "books"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."book_contributors" ADD CONSTRAINT "book_contributors_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "books"."authors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."book_series" ADD CONSTRAINT "book_series_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "books"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."book_series" ADD CONSTRAINT "book_series_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "books"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."book_subjects" ADD CONSTRAINT "book_subjects_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "books"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."book_subjects" ADD CONSTRAINT "book_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "books"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."edition_contributors" ADD CONSTRAINT "edition_contributors_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "books"."editions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."edition_contributors" ADD CONSTRAINT "edition_contributors_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "books"."authors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."editions" ADD CONSTRAINT "editions_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "books"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."editions" ADD CONSTRAINT "editions_publisher_id_publishers_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "books"."publishers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "authors_name_trgm" ON "books"."authors" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "authors_sort_name" ON "books"."authors" USING btree ("sort_name");--> statement-breakpoint
CREATE INDEX "book_contributors_author_id" ON "books"."book_contributors" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "book_series_series_id_position" ON "books"."book_series" USING btree ("series_id","position");--> statement-breakpoint
CREATE INDEX "book_subjects_subject_id" ON "books"."book_subjects" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "books_title_trgm" ON "books"."books" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "books_sort_title" ON "books"."books" USING btree ("sort_title");--> statement-breakpoint
CREATE INDEX "books_first_published_year" ON "books"."books" USING btree ("first_published_year");--> statement-breakpoint
CREATE INDEX "edition_contributors_author_id" ON "books"."edition_contributors" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "editions_book_id" ON "books"."editions" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "editions_publisher_id" ON "books"."editions" USING btree ("publisher_id");--> statement-breakpoint
CREATE INDEX "editions_title_trgm" ON "books"."editions" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "series_name_trgm" ON "books"."series" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "series_sort_name" ON "books"."series" USING btree ("sort_name");