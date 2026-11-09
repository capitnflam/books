ALTER TABLE "books"."role_permissions" DROP CONSTRAINT "role_permissions_role_id_roles_id_fk";--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" DROP CONSTRAINT "user_feature_flags_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" DROP CONSTRAINT "user_feature_flags_feature_flag_id_feature_flags_id_fk";--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" DROP CONSTRAINT "user_feature_flags_granted_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "books"."user_roles" DROP CONSTRAINT "user_roles_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "books"."user_roles" DROP CONSTRAINT "user_roles_role_id_roles_id_fk";--> statement-breakpoint
ALTER TABLE "books"."user_roles" DROP CONSTRAINT "user_roles_granted_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "books"."users" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "books"."roles" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "books"."feature_flags" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "books"."role_permissions" ADD COLUMN "new_role_id" uuid;--> statement-breakpoint
UPDATE "books"."role_permissions" AS rp SET "new_role_id" = r."new_id" FROM "books"."roles" AS r WHERE rp."role_id" = r."id";--> statement-breakpoint
ALTER TABLE "books"."user_roles" ADD COLUMN "new_user_id" uuid, ADD COLUMN "new_role_id" uuid, ADD COLUMN "new_granted_by" uuid;--> statement-breakpoint
UPDATE "books"."user_roles" AS ur SET "new_user_id" = u."new_id" FROM "books"."users" AS u WHERE ur."user_id" = u."id";--> statement-breakpoint
UPDATE "books"."user_roles" AS ur SET "new_role_id" = r."new_id" FROM "books"."roles" AS r WHERE ur."role_id" = r."id";--> statement-breakpoint
UPDATE "books"."user_roles" AS ur SET "new_granted_by" = u."new_id" FROM "books"."users" AS u WHERE ur."granted_by" = u."id";--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" ADD COLUMN "new_user_id" uuid, ADD COLUMN "new_feature_flag_id" uuid, ADD COLUMN "new_granted_by" uuid;--> statement-breakpoint
UPDATE "books"."user_feature_flags" AS uff SET "new_user_id" = u."new_id" FROM "books"."users" AS u WHERE uff."user_id" = u."id";--> statement-breakpoint
UPDATE "books"."user_feature_flags" AS uff SET "new_feature_flag_id" = f."new_id" FROM "books"."feature_flags" AS f WHERE uff."feature_flag_id" = f."id";--> statement-breakpoint
UPDATE "books"."user_feature_flags" AS uff SET "new_granted_by" = u."new_id" FROM "books"."users" AS u WHERE uff."granted_by" = u."id";--> statement-breakpoint
ALTER TABLE "books"."role_permissions" DROP CONSTRAINT "role_permissions_role_id_permission_pk";--> statement-breakpoint
ALTER TABLE "books"."user_roles" DROP CONSTRAINT "user_roles_user_id_role_id_pk";--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" DROP CONSTRAINT "user_feature_flags_user_id_feature_flag_id_pk";--> statement-breakpoint
ALTER TABLE "books"."role_permissions" DROP COLUMN "role_id";--> statement-breakpoint
ALTER TABLE "books"."role_permissions" RENAME COLUMN "new_role_id" TO "role_id";--> statement-breakpoint
ALTER TABLE "books"."role_permissions" ALTER COLUMN "role_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "books"."user_roles" DROP COLUMN "user_id", DROP COLUMN "role_id", DROP COLUMN "granted_by";--> statement-breakpoint
ALTER TABLE "books"."user_roles" RENAME COLUMN "new_user_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "books"."user_roles" RENAME COLUMN "new_role_id" TO "role_id";--> statement-breakpoint
ALTER TABLE "books"."user_roles" RENAME COLUMN "new_granted_by" TO "granted_by";--> statement-breakpoint
ALTER TABLE "books"."user_roles" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "books"."user_roles" ALTER COLUMN "role_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" DROP COLUMN "user_id", DROP COLUMN "feature_flag_id", DROP COLUMN "granted_by";--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" RENAME COLUMN "new_user_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" RENAME COLUMN "new_feature_flag_id" TO "feature_flag_id";--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" RENAME COLUMN "new_granted_by" TO "granted_by";--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" ALTER COLUMN "feature_flag_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "books"."users" DROP CONSTRAINT "users_pkey";--> statement-breakpoint
ALTER TABLE "books"."roles" DROP CONSTRAINT "roles_pkey";--> statement-breakpoint
ALTER TABLE "books"."feature_flags" DROP CONSTRAINT "feature_flags_pkey";--> statement-breakpoint
ALTER TABLE "books"."users" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "books"."roles" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "books"."feature_flags" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "books"."users" RENAME COLUMN "new_id" TO "id";--> statement-breakpoint
ALTER TABLE "books"."roles" RENAME COLUMN "new_id" TO "id";--> statement-breakpoint
ALTER TABLE "books"."feature_flags" RENAME COLUMN "new_id" TO "id";--> statement-breakpoint
ALTER TABLE "books"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY("id");--> statement-breakpoint
ALTER TABLE "books"."roles" ADD CONSTRAINT "roles_pkey" PRIMARY KEY("id");--> statement-breakpoint
ALTER TABLE "books"."feature_flags" ADD CONSTRAINT "feature_flags_pkey" PRIMARY KEY("id");--> statement-breakpoint
ALTER TABLE "books"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_permission_pk" PRIMARY KEY("role_id","permission");--> statement-breakpoint
ALTER TABLE "books"."user_roles" ADD CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id");--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" ADD CONSTRAINT "user_feature_flags_user_id_feature_flag_id_pk" PRIMARY KEY("user_id","feature_flag_id");--> statement-breakpoint
ALTER TABLE "books"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "books"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" ADD CONSTRAINT "user_feature_flags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "books"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" ADD CONSTRAINT "user_feature_flags_feature_flag_id_feature_flags_id_fk" FOREIGN KEY ("feature_flag_id") REFERENCES "books"."feature_flags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" ADD CONSTRAINT "user_feature_flags_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "books"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "books"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "books"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."user_roles" ADD CONSTRAINT "user_roles_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "books"."users"("id") ON DELETE set null ON UPDATE no action;
