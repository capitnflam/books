/*
  Warnings:

  - You are about to drop the column `createdAt` on the `BooksInCollections` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `BooksInCollections` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `BooksInCollections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BooksInCollections" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt";
