# books

## Create db

```sql
CREATE USER booksserver WITH ENCRYPTED PASSWORD 'bookspassword';
CREATE DATABASE books;
GRANT ALL ON DATABASE books TO booksserver;
```

## shadcn/ui monorepo template

This is a TanStack Start monorepo template with shadcn/ui.

### Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/webapp
```

This will place the ui components in the `packages/ui/src/components` directory.

### Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from '@books/ui/components/button';
```
