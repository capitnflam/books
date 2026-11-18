import { eq } from 'drizzle-orm';

import { db } from '../db/index.ts';
import { ADMIN_ROLE_NAME, BUILT_IN_ROLES } from '../db/roles.ts';
import {
  authors,
  bookContributors,
  books,
  bookSeries,
  bookSubjects,
  editionContributors,
  editions,
  publishers,
  rolePermissions,
  roles,
  series,
  subjects,
  userRoles,
  users,
} from '../db/schema.ts';

/**
 * Creates the built-in roles, or adds the permissions they are missing. Descriptions and
 * permissions admins added are kept; the default role is set only when no role is the default.
 */
async function seedRoles() {
  return db.transaction(async (tx) => {
    const hasDefault = await tx.query.roles.findFirst({ where: eq(roles.isDefault, true) });
    const roleIds = new Map<string, string>();

    for (const role of BUILT_IN_ROLES) {
      const isDefault = !hasDefault && role.isDefault;
      const [row] = await tx
        .insert(roles)
        .values({ name: role.name, description: role.description, isDefault })
        .onConflictDoUpdate({
          target: roles.name,
          set: isDefault ? { isDefault } : { name: role.name },
        })
        .returning();

      await tx
        .insert(rolePermissions)
        .values(role.permissions.map((permission) => ({ roleId: row!.id, permission })))
        .onConflictDoNothing();

      roleIds.set(role.name, row!.id);
    }

    return roleIds;
  });
}

/** Gives the default role to every user who has no role, e.g. users created before it existed. */
async function backfillDefaultRole() {
  const defaultRole = await db.query.roles.findFirst({ where: eq(roles.isDefault, true) });

  if (!defaultRole) {
    return;
  }

  const usersWithoutRole = await db.query.users.findMany({ with: { role: true } });
  const values = usersWithoutRole
    .filter((user) => !user.role)
    .map((user) => ({ userId: user.id, roleId: defaultRole.id }));

  if (values.length > 0) {
    await db.insert(userRoles).values(values).onConflictDoNothing();
    console.log(
      `Assigned the ${defaultRole.name} role to ${values.length} user(s) without a role.`,
    );
  }
}

/**
 * Nobody can grant the first admin from the app, so the seed does it: set
 * ADMIN_AUTHENTICATION_ID to a Clerk user ID (`user_…`) to make that user an admin.
 */
async function seedAdminUser(roleId: string) {
  const authenticationId = process.env.ADMIN_AUTHENTICATION_ID;

  if (!authenticationId) {
    console.log('ADMIN_AUTHENTICATION_ID is not set; no admin user assigned.');
    return;
  }

  const [adminUser] = await db
    .insert(users)
    .values({ authenticationId })
    .onConflictDoUpdate({ target: users.authenticationId, set: { authenticationId } })
    .returning();

  // A user has one role: admin replaces whichever they had.
  await db
    .insert(userRoles)
    .values({ userId: adminUser!.id, roleId })
    .onConflictDoUpdate({ target: userRoles.userId, set: { roleId, grantedBy: null } });
  console.log(`Assigned the ${ADMIN_ROLE_NAME} role to ${authenticationId}.`);
}

/** A fixed UUID for sample rows, so running the seed again finds them instead of duplicating them. */
function sampleId(n: number) {
  return `00000000-0000-4000-8000-${n.toString().padStart(12, '0')}`;
}

/** A few books with their authors, series, subjects and editions, for catalogue screens. */
async function seedCatalog() {
  const author = {
    borges: sampleId(101),
    tolkien: sampleId(102),
    pratchett: sampleId(103),
    leGuin: sampleId(104),
    hurley: sampleId(105),
  };
  const book = {
    ficciones: sampleId(201),
    hobbit: sampleId(202),
    fellowship: sampleId(203),
    guards: sampleId(204),
    wizard: sampleId(205),
  };
  const serie = {
    lordOfTheRings: sampleId(301),
    discworld: sampleId(302),
    cityWatch: sampleId(303),
    earthsea: sampleId(304),
  };
  const publisher = {
    grove: sampleId(401),
    harperCollins: sampleId(402),
    mariner: sampleId(403),
    corgi: sampleId(404),
    penguin: sampleId(405),
  };
  const subject = {
    fantasy: sampleId(501),
    shortStories: sampleId(502),
    humour: sampleId(503),
    philosophy: sampleId(504),
  };
  const edition = {
    ficcionesGrove: sampleId(601),
    ficcionesPenguin: sampleId(602),
    hobbitHarperCollins: sampleId(603),
    fellowshipMariner: sampleId(604),
    guardsCorgi: sampleId(605),
    wizardPenguin: sampleId(606),
  };

  await db.transaction(async (tx) => {
    await tx
      .insert(authors)
      .values([
        {
          id: author.borges,
          name: 'Jorge Luis Borges',
          sortName: 'Borges, Jorge Luis',
          birthYear: 1899,
          deathYear: 1986,
        },
        {
          id: author.tolkien,
          name: 'J. R. R. Tolkien',
          sortName: 'Tolkien, J. R. R.',
          birthYear: 1892,
          deathYear: 1973,
        },
        {
          id: author.pratchett,
          name: 'Terry Pratchett',
          sortName: 'Pratchett, Terry',
          birthYear: 1948,
          deathYear: 2015,
        },
        {
          id: author.leGuin,
          name: 'Ursula K. Le Guin',
          sortName: 'Le Guin, Ursula K.',
          birthYear: 1929,
          deathYear: 2018,
        },
        { id: author.hurley, name: 'Andrew Hurley', sortName: 'Hurley, Andrew', birthYear: 1944 },
      ])
      .onConflictDoNothing();

    await tx
      .insert(series)
      .values([
        {
          id: serie.lordOfTheRings,
          name: 'The Lord of the Rings',
          sortName: 'Lord of the Rings, The',
        },
        { id: serie.discworld, name: 'Discworld', sortName: 'Discworld' },
        { id: serie.cityWatch, name: 'City Watch', sortName: 'City Watch' },
        { id: serie.earthsea, name: 'Earthsea Cycle', sortName: 'Earthsea Cycle' },
      ])
      .onConflictDoNothing();

    await tx
      .insert(publishers)
      .values([
        { id: publisher.grove, name: 'Grove Press' },
        { id: publisher.harperCollins, name: 'HarperCollins' },
        { id: publisher.mariner, name: 'Mariner Books' },
        { id: publisher.corgi, name: 'Corgi' },
        { id: publisher.penguin, name: 'Penguin Books' },
      ])
      .onConflictDoNothing();

    await tx
      .insert(subjects)
      .values([
        { id: subject.fantasy, name: 'Fantasy' },
        { id: subject.shortStories, name: 'Short stories' },
        { id: subject.humour, name: 'Humour' },
        { id: subject.philosophy, name: 'Philosophy' },
      ])
      .onConflictDoNothing();

    await tx
      .insert(books)
      .values([
        {
          id: book.ficciones,
          title: 'Ficciones',
          sortTitle: 'Ficciones',
          originalLanguage: 'es',
          firstPublishedYear: 1944,
          description:
            'Short stories of labyrinths, mirrors, infinite libraries and invented worlds.',
        },
        {
          id: book.hobbit,
          title: 'The Hobbit',
          subtitle: 'or There and Back Again',
          sortTitle: 'Hobbit, The',
          originalLanguage: 'en',
          firstPublishedYear: 1937,
        },
        {
          id: book.fellowship,
          title: 'The Fellowship of the Ring',
          sortTitle: 'Fellowship of the Ring, The',
          originalLanguage: 'en',
          firstPublishedYear: 1954,
        },
        {
          id: book.guards,
          title: 'Guards! Guards!',
          sortTitle: 'Guards! Guards!',
          originalLanguage: 'en',
          firstPublishedYear: 1989,
        },
        {
          id: book.wizard,
          title: 'A Wizard of Earthsea',
          sortTitle: 'Wizard of Earthsea, A',
          originalLanguage: 'en',
          firstPublishedYear: 1968,
        },
      ])
      .onConflictDoNothing();

    await tx
      .insert(bookContributors)
      .values([
        { bookId: book.ficciones, authorId: author.borges },
        { bookId: book.hobbit, authorId: author.tolkien },
        { bookId: book.fellowship, authorId: author.tolkien },
        { bookId: book.guards, authorId: author.pratchett },
        { bookId: book.wizard, authorId: author.leGuin },
      ])
      .onConflictDoNothing();

    await tx
      .insert(bookSeries)
      .values([
        { bookId: book.fellowship, seriesId: serie.lordOfTheRings, position: 1 },
        { bookId: book.guards, seriesId: serie.discworld, position: 8 },
        { bookId: book.guards, seriesId: serie.cityWatch, position: 1 },
        { bookId: book.wizard, seriesId: serie.earthsea, position: 1 },
      ])
      .onConflictDoNothing();

    await tx
      .insert(bookSubjects)
      .values([
        { bookId: book.ficciones, subjectId: subject.shortStories },
        { bookId: book.ficciones, subjectId: subject.philosophy },
        { bookId: book.hobbit, subjectId: subject.fantasy },
        { bookId: book.fellowship, subjectId: subject.fantasy },
        { bookId: book.guards, subjectId: subject.fantasy },
        { bookId: book.guards, subjectId: subject.humour },
        { bookId: book.wizard, subjectId: subject.fantasy },
      ])
      .onConflictDoNothing();

    await tx
      .insert(editions)
      .values([
        {
          id: edition.ficcionesGrove,
          bookId: book.ficciones,
          publisherId: publisher.grove,
          publishedYear: 1962,
          isbn13: '9780802130303',
          isbn10: '0802130305',
          language: 'en',
          format: 'paperback',
          pageCount: 174,
        },
        {
          id: edition.ficcionesPenguin,
          bookId: book.ficciones,
          title: 'Fictions',
          publisherId: publisher.penguin,
          publishedYear: 2000,
          language: 'en',
          format: 'paperback',
        },
        {
          id: edition.hobbitHarperCollins,
          bookId: book.hobbit,
          publisherId: publisher.harperCollins,
          publishedYear: 1999,
          isbn13: '9780261102217',
          isbn10: '0261102214',
          language: 'en',
          format: 'paperback',
        },
        {
          id: edition.fellowshipMariner,
          bookId: book.fellowship,
          publisherId: publisher.mariner,
          publishedYear: 2012,
          isbn13: '9780547928210',
          language: 'en',
          format: 'paperback',
        },
        {
          id: edition.guardsCorgi,
          bookId: book.guards,
          publisherId: publisher.corgi,
          isbn13: '9780552166607',
          language: 'en',
          format: 'mass_market_paperback',
        },
        {
          id: edition.wizardPenguin,
          bookId: book.wizard,
          publisherId: publisher.penguin,
          editionStatement: 'Illustrated edition',
          language: 'en',
          format: 'hardcover',
        },
      ])
      .onConflictDoNothing();

    await tx
      .insert(editionContributors)
      .values([
        { editionId: edition.ficcionesPenguin, authorId: author.hurley, role: 'translator' },
      ])
      .onConflictDoNothing();
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set: export it or add it to packages/database/.env.local.',
    );
  }

  console.log('Seeding database...');

  const roleIds = await seedRoles();
  await seedAdminUser(roleIds.get(ADMIN_ROLE_NAME)!);

  // Sample users with fake Clerk IDs: they can't sign in, but they give admin screens data.
  await db
    .insert(users)
    .values([
      { authenticationId: 'seed_user_1', displayName: 'Ada Lovelace' },
      { authenticationId: 'seed_user_2', displayName: 'Jorge Luis Borges' },
      { authenticationId: 'seed_user_3', displayName: 'Mary Shelley' },
    ])
    .onConflictDoNothing();

  await backfillDefaultRole();
  await seedCatalog();
}

await main();
