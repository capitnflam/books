# books

## Create db

```sql
CREATE USER booksserver WITH ENCRYPTED PASSWORD 'bookspassword';
CREATE DATABASE books;
GRANT ALL ON DATABASE books TO booksserver;
```

`DATABASE_URL="postgres://booksserver:bookspassword@localhost:5433/books"`

    "lint:check": "turbo run lint:check",
    "lint:fix": "turbo run lint:fix",
        "format:check": "turbo run format:check",
    "format:fix": "turbo run format:fix",
