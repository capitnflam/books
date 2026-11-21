# Database ERD

<!-- Generated from src/db/schema.ts by `pnpm --filter @books/database run db:erd`. Do not edit by hand. -->

Tables of the `books` PostgreSQL schema. `PK` primary key, `FK` foreign key, `UK` unique.

```mermaid
erDiagram
  books ||--o{ book_contributors : "book_id (on delete cascade)"
  authors ||--o{ book_contributors : "author_id (on delete restrict)"
  books ||--o{ book_series : "book_id (on delete cascade)"
  series ||--o{ book_series : "series_id (on delete cascade)"
  books ||--o{ book_subjects : "book_id (on delete cascade)"
  subjects ||--o{ book_subjects : "subject_id (on delete cascade)"
  editions ||--o{ edition_contributors : "edition_id (on delete cascade)"
  authors ||--o{ edition_contributors : "author_id (on delete restrict)"
  books ||--o{ editions : "book_id (on delete cascade)"
  publishers |o--o{ editions : "publisher_id (on delete set null)"
  roles ||--o{ role_permissions : "role_id (on delete cascade)"
  users ||--o{ user_feature_flags : "user_id (on delete cascade)"
  feature_flags ||--o{ user_feature_flags : "feature_flag_id (on delete cascade)"
  users |o--o{ user_feature_flags : "granted_by (on delete set null)"
  users ||--o{ user_roles : "user_id (on delete cascade)"
  roles ||--o{ user_roles : "role_id (on delete restrict)"
  users |o--o{ user_roles : "granted_by (on delete set null)"
  authors {
    uuid id PK "default gen_random_uuid()"
    text name
    text sort_name
    text biography "nullable"
    smallint birth_year "nullable"
    smallint death_year "nullable"
    text image_url "nullable"
    timestamp created_at "default now()"
    timestamp updated_at "default now()"
  }
  book_contributors {
    uuid book_id PK,FK
    uuid author_id PK,FK
    contributor_role role PK "default 'author'"
    smallint position "default 0"
  }
  book_series {
    uuid book_id PK,FK
    uuid series_id PK,FK
    numeric(6,_2) position "nullable"
  }
  book_subjects {
    uuid book_id PK,FK
    uuid subject_id PK,FK
  }
  books {
    uuid id PK "default gen_random_uuid()"
    text title
    text subtitle "nullable"
    text sort_title
    text description "nullable"
    text original_language "nullable"
    smallint first_published_year "nullable"
    timestamp created_at "default now()"
    timestamp updated_at "default now()"
  }
  edition_contributors {
    uuid edition_id PK,FK
    uuid author_id PK,FK
    contributor_role role PK
    smallint position "default 0"
  }
  editions {
    uuid id PK "default gen_random_uuid()"
    uuid book_id FK
    text title "nullable"
    text subtitle "nullable"
    text edition_statement "nullable"
    uuid publisher_id FK "nullable"
    smallint published_year "nullable"
    date published_on "nullable"
    text isbn13 UK "nullable"
    text isbn10 UK "nullable"
    text language "nullable"
    edition_format format "nullable"
    integer page_count "nullable"
    integer duration_minutes "nullable"
    text cover_image_url "nullable"
    timestamp created_at "default now()"
    timestamp updated_at "default now()"
  }
  feature_flags {
    uuid id PK "default gen_random_uuid()"
    text key UK
    text description "nullable"
    timestamp created_at "default now()"
    timestamp updated_at "default now()"
  }
  publishers {
    uuid id PK "default gen_random_uuid()"
    text name UK
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
  series {
    uuid id PK "default gen_random_uuid()"
    text name
    text sort_name
    text description "nullable"
    timestamp created_at "default now()"
    timestamp updated_at "default now()"
  }
  subjects {
    uuid id PK "default gen_random_uuid()"
    text name UK
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
