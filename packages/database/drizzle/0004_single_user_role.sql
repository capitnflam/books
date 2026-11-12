-- A user keeps one role: the one with the most permissions (so admins stay admins),
-- or the earliest granted on a tie. Their other roles are removed.
DELETE FROM "books"."user_roles" AS "ur"
USING (
  SELECT "user_id", "role_id",
    row_number() OVER (
      PARTITION BY "user_id"
      ORDER BY (
        SELECT count(*) FROM "books"."role_permissions" AS "rp" WHERE "rp"."role_id" = "user_roles"."role_id"
      ) DESC, "created_at" ASC, "role_id" ASC
    ) AS "rank"
  FROM "books"."user_roles"
) AS "ranked"
WHERE "ur"."user_id" = "ranked"."user_id"
  AND "ur"."role_id" = "ranked"."role_id"
  AND "ranked"."rank" > 1;--> statement-breakpoint
ALTER TABLE "books"."user_roles" DROP CONSTRAINT "user_roles_user_id_role_id_pk";--> statement-breakpoint
ALTER TABLE "books"."user_roles" ADD PRIMARY KEY ("user_id");
