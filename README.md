# books

## Create db

```sql
CREATE USER booksserver WITH ENCRYPTED PASSWORD 'bookspassword';
CREATE DATABASE books;
GRANT ALL ON DATABASE books TO booksserver;
```

`DATABASE_URL="postgres://booksserver:bookspassword@localhost:5433/books"`
