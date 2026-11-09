import { fileURLToPath } from 'node:url';

import { is, SQL } from 'drizzle-orm';
import { getTableConfig, PgDialect, PgTable } from 'drizzle-orm/pg-core';

import type { PgColumn } from 'drizzle-orm/pg-core';

/** `packages/database/ERD.md`. */
export const ERD_PATH = fileURLToPath(new URL('../../ERD.md', import.meta.url));

const dialect = new PgDialect();

function renderDefault(column: PgColumn): string | undefined {
  if (!column.hasDefault || column.default === undefined) {
    return undefined;
  }
  if (is(column.default, SQL)) {
    return dialect.sqlToQuery(column.default).sql;
  }
  // Mermaid comments are double-quoted, so show strings with single quotes.
  return typeof column.default === 'string' ? `'${column.default}'` : String(column.default);
}

function renderTable(table: PgTable): string[] {
  const config = getTableConfig(table);
  const primaryKeyColumns = new Set(
    config.primaryKeys.flatMap((pk) => pk.columns.map((c) => c.name)),
  );
  const foreignKeyColumns = new Set(
    config.foreignKeys.flatMap((fk) => fk.reference().columns.map((c) => c.name)),
  );
  const uniqueColumns = new Set(
    config.uniqueConstraints.filter((u) => u.columns.length === 1).map((u) => u.columns[0]!.name),
  );

  const attributes = config.columns.map((column) => {
    const keys = [
      column.primary || primaryKeyColumns.has(column.name) ? 'PK' : undefined,
      foreignKeyColumns.has(column.name) ? 'FK' : undefined,
      column.isUnique || uniqueColumns.has(column.name) ? 'UK' : undefined,
    ].filter(Boolean);
    const defaultValue = renderDefault(column);
    const notes = [
      column.notNull ? undefined : 'nullable',
      defaultValue === undefined ? undefined : `default ${defaultValue}`,
    ].filter(Boolean);

    const type = column.getSQLType().replaceAll(' ', '_');
    const keyPart = keys.length > 0 ? ` ${keys.join(',')}` : '';
    const notePart = notes.length > 0 ? ` "${notes.join(', ')}"` : '';
    return `    ${type} ${column.name}${keyPart}${notePart}`;
  });

  return [`  ${config.name} {`, ...attributes, '  }'];
}

function renderRelationships(table: PgTable): string[] {
  const config = getTableConfig(table);

  return config.foreignKeys.map((fk) => {
    const { columns, foreignTable } = fk.reference();
    const parent = getTableConfig(foreignTable).name;
    // A nullable foreign key means the child row may exist without a parent.
    const parentSide = columns.every((c) => c.notNull) ? '||' : '|o';
    const label = `${columns.map((c) => c.name).join(', ')} (on delete ${fk.onDelete ?? 'no action'})`;
    return `  ${parent} ${parentSide}--o{ ${config.name} : "${label}"`;
  });
}

/** Renders every table exported by a Drizzle schema module as a Markdown page with a Mermaid ER diagram. */
export function renderErd(schemaModule: Record<string, unknown>): string {
  const tables = Object.values(schemaModule)
    .filter((value): value is PgTable => is(value, PgTable))
    .toSorted((a, b) => getTableConfig(a).name.localeCompare(getTableConfig(b).name));

  return [
    '# Database ERD',
    '',
    '<!-- Generated from src/db/schema.ts by `pnpm --filter @books/database run db:erd`. Do not edit by hand. -->',
    '',
    'Tables of the `books` PostgreSQL schema. `PK` primary key, `FK` foreign key, `UK` unique.',
    '',
    '```mermaid',
    'erDiagram',
    ...tables.flatMap((table) => renderRelationships(table)),
    ...tables.flatMap((table) => renderTable(table)),
    '```',
    '',
  ].join('\n');
}
