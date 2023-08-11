/*
  Warnings:

  - A unique constraint covering the columns `[collectionId,index]` on the table `BooksInCollections` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BooksInCollections_collectionId_index_key" ON "BooksInCollections"("collectionId", "index");
