ALTER TABLE "books"."user_roles" DROP CONSTRAINT "user_roles_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "books"."user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "books"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
-- Every user has a role: give the default one to users without any. On a fresh database
-- no role exists yet, and the seed does this once it has created them.
INSERT INTO "books"."user_roles" ("user_id", "role_id")
SELECT "u"."id", "r"."id"
FROM "books"."users" AS "u"
CROSS JOIN "books"."roles" AS "r"
WHERE "r"."is_default"
  AND NOT EXISTS (SELECT 1 FROM "books"."user_roles" AS "ur" WHERE "ur"."user_id" = "u"."id");
