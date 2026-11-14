# Database ERD

<!-- Generated from src/db/schema.ts by `pnpm --filter @books/database run db:erd`. Do not edit by hand. -->

Tables of the `books` PostgreSQL schema. `PK` primary key, `FK` foreign key, `UK` unique.

```mermaid
erDiagram
  roles ||--o{ role_permissions : "role_id (on delete cascade)"
  users ||--o{ user_feature_flags : "user_id (on delete cascade)"
  feature_flags ||--o{ user_feature_flags : "feature_flag_id (on delete cascade)"
  users |o--o{ user_feature_flags : "granted_by (on delete set null)"
  users ||--o{ user_roles : "user_id (on delete cascade)"
  roles ||--o{ user_roles : "role_id (on delete restrict)"
  users |o--o{ user_roles : "granted_by (on delete set null)"
  feature_flags {
    uuid id PK "default gen_random_uuid()"
    text key UK
    text description "nullable"
    timestamp created_at "default now()"
    timestamp updated_at "default now()"
  }
  role_permissions {
    uuid role_id PK,FK
    text permission PK
  }
  roles {
    uuid id PK "default gen_random_uuid()"
    text name UK
    text description "nullable"
    boolean is_default "default false"
    timestamp created_at "default now()"
    timestamp updated_at "default now()"
  }
  user_feature_flags {
    uuid user_id PK,FK
    uuid feature_flag_id PK,FK
    uuid granted_by FK "nullable"
    timestamp created_at "default now()"
  }
  user_roles {
    uuid user_id PK,FK
    uuid role_id FK
    uuid granted_by FK "nullable"
    timestamp created_at "default now()"
  }
  users {
    uuid id PK "default gen_random_uuid()"
    text authentication_id UK
    text display_name "nullable"
    timestamp created_at "default now()"
    timestamp updated_at "default now()"
  }
```
