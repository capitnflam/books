CREATE TABLE "books"."feature_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"description" text,
	"enabled_for_all" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "books"."role_permissions" (
	"role_id" integer NOT NULL,
	"permission" text NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_pk" PRIMARY KEY("role_id","permission")
);
--> statement-breakpoint
CREATE TABLE "books"."roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "books"."user_feature_flags" (
	"user_id" integer NOT NULL,
	"feature_flag_id" integer NOT NULL,
	"granted_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_feature_flags_user_id_feature_flag_id_pk" PRIMARY KEY("user_id","feature_flag_id")
);
--> statement-breakpoint
CREATE TABLE "books"."user_roles" (
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"granted_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
ALTER TABLE "books"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "books"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" ADD CONSTRAINT "user_feature_flags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "books"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" ADD CONSTRAINT "user_feature_flags_feature_flag_id_feature_flags_id_fk" FOREIGN KEY ("feature_flag_id") REFERENCES "books"."feature_flags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."user_feature_flags" ADD CONSTRAINT "user_feature_flags_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "books"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "books"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "books"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."user_roles" ADD CONSTRAINT "user_roles_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "books"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books"."users" ADD CONSTRAINT "users_authentication_id_unique" UNIQUE("authentication_id");