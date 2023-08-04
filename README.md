# books

## Create db

```sql
CREATE USER booksserver WITH ENCRYPTED PASSWORD 'bookspassword';
CREATE DATABASE books;
GRANT ALL PRIVILEGES ON DATABASE books TO booksserver;
GRANT ALL PRIVILEGES ON SCHEMA public TO booksserver;
```
