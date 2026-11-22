CREATE TABLE "books"."book_genres" (
	"book_id" uuid NOT NULL,
	"genre" text NOT NULL,
	CONSTRAINT "book_genres_book_id_genre_pk" PRIMARY KEY("book_id","genre")
);
--> statement-breakpoint
ALTER TABLE "books"."book_genres" ADD CONSTRAINT "book_genres_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "books"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "book_genres_genre" ON "books"."book_genres" USING btree ("genre");