import { PrismaClient } from '@prisma/client'

import { AuthorMinimal, BookMinimal, CollectionMinimal } from '~books/types'

const authors: AuthorMinimal[] = [
  { name: 'Isaac Asimov', uri: '/author/1' },
  { name: 'Frank Herbert', uri: '/author/2' },
  { name: 'Brian Herbert', uri: '/author/3' },
]

const books: Array<
  BookMinimal & { synopsis: string; authors: AuthorMinimal[] }
> = [
  {
    uri: '/book/1',
    title: 'Foundation',
    isbn: '0-553-29335-4',
    synopsis: 'first entry',
    coverURL:
      'https://en.wikipedia.org/wiki/File:Foundation_gnome.jpg#/media/File:Foundation_gnome.jpg',
    authors: [authors[0]],
  },
  {
    uri: '/book/2',
    title: 'Foundation and Empire',
    isbn: '0-553-29337-0',
    synopsis: 'second entry',
    coverURL:
      'https://en.wikipedia.org/wiki/File:Foundation_and_empire.jpg#/media/File:Foundation_and_empire.jpg',
    authors: [authors[0]],
  },
  {
    uri: '/book/3',
    title: 'Second Foundation',
    isbn: '0-553-29336-2',
    synopsis: 'third entry',
    coverURL:
      'https://en.wikipedia.org/wiki/File:Second_foundation.jpg#/media/File:Second_foundation.jpg',
    authors: [authors[0]],
  },
  {
    uri: '/book/4',
    title: 'Dune',
    isbn: '978-0441172719',
    synopsis: 'setup',
    authors: [authors[1]],
  },
  {
    uri: '/book/5',
    title: 'Prelude to Dune',
    isbn: '978-0593354964',
    synopsis: 'setup',
    authors: [authors[1], authors[2]],
  },
]

const collections: CollectionMinimal[] = [
  {
    uri: '/collection/1',
    name: 'Foundation',
    books: [books[0], books[1], books[2]],
  },
  { uri: '/collection/2', name: 'Dune', books: [books[3], books[4]] },
]

const prisma = new PrismaClient()
async function main() {
  for (const iterator of authors) {
    const tmp = await prisma.author.create({ data: { name: iterator.name } })
    iterator.uri = `/author/${tmp.id}`
  }

  for (const iterator of books) {
    const tmp = await prisma.book.create({
      data: {
        isbn: iterator.isbn,
        title: iterator.title,
        coverURL: iterator.coverURL,
        synopsis: iterator.synopsis,
        authors: {
          connect: iterator.authors.map((author) => {
            return {
              id: Number.parseInt(author.uri.slice('/author/'.length)),
            }
          }),
        },
      },
    })
    iterator.uri = `/book/${tmp.id}`
  }

  for (const iterator of collections) {
    const tmp = await prisma.collection.create({
      data: {
        name: iterator.name,
        books: {
          createMany: {
            data: iterator.books.map((book, index) => {
              return {
                bookId: Number.parseInt(book.uri.slice('/book/'.length)),
                index,
              }
            }),
          },
        },
      },
    })
    iterator.uri = `/collection/${tmp.id}`
  }
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
