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
  roles ||--o{ user_roles : "role_id (on delete cascade)"
  users |o--o{ user_roles : "granted_by (on delete set null)"
  feature_flags {
    serial id PK
    text key UK
    text description "nullable"
    boolean enabled_for_all "default false"
    timestamp created_at "default now()"
    timestamp updated_at "default now()"
  }
  role_permissions {
    integer role_id PK,FK
    text permission PK
  }
  roles {
    serial id PK
    text name UK
    text description "nullable"
    timestamp created_at "default now()"
    timestamp updated_at "default now()"
  }
  user_feature_flags {
    integer user_id PK,FK
    integer feature_flag_id PK,FK
    integer granted_by FK "nullable"
    timestamp created_at "default now()"
  }
  user_roles {
    integer user_id PK,FK
    integer role_id PK,FK
    integer granted_by FK "nullable"
    timestamp created_at "default now()"
  }
  users {
    serial id PK
    text authentication_id UK
    text display_name "nullable"
    timestamp created_at "default now()"
    timestamp updated_at "default now()"
  }
```
