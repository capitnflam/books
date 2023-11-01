import { MigrationInterface, QueryRunner } from 'typeorm'

export class Initial1698811949346 implements MigrationInterface {
  name = 'Initial1698811949346'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "author_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_b150f6a93966648bfee48fcab2b" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "book_entity" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "coverURL" character varying, "isbn" character varying, "synopsis" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_71e83ac5f0a03ed159b7dd3fbad" UNIQUE ("isbn"), CONSTRAINT "PK_3ea5638ccafa8799838e68fad46" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "collection_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_5d44e140c4fcb3d961f9e83405f" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "book_entity_authors_author_entity" ("bookEntityId" integer NOT NULL, "authorEntityId" integer NOT NULL, CONSTRAINT "PK_0b22483af96b741c122d9f0ae89" PRIMARY KEY ("bookEntityId", "authorEntityId"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_3bb30e7c32191521202457dcae" ON "book_entity_authors_author_entity" ("bookEntityId") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_55d59c177f6423a819bb9d7253" ON "book_entity_authors_author_entity" ("authorEntityId") `,
    )
    await queryRunner.query(
      `CREATE TABLE "collection_entity_books_book_entity" ("collectionEntityId" integer NOT NULL, "bookEntityId" integer NOT NULL, CONSTRAINT "PK_1dea2a32f40d9e08be1ceb4f0ef" PRIMARY KEY ("collectionEntityId", "bookEntityId"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_dad875686e89d367161fa53f07" ON "collection_entity_books_book_entity" ("collectionEntityId") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_ffb180b5d7dd94893ff008f411" ON "collection_entity_books_book_entity" ("bookEntityId") `,
    )
    await queryRunner.query(
      `ALTER TABLE "book_entity_authors_author_entity" ADD CONSTRAINT "FK_3bb30e7c32191521202457dcae1" FOREIGN KEY ("bookEntityId") REFERENCES "book_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "book_entity_authors_author_entity" ADD CONSTRAINT "FK_55d59c177f6423a819bb9d72535" FOREIGN KEY ("authorEntityId") REFERENCES "author_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "collection_entity_books_book_entity" ADD CONSTRAINT "FK_dad875686e89d367161fa53f070" FOREIGN KEY ("collectionEntityId") REFERENCES "collection_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "collection_entity_books_book_entity" ADD CONSTRAINT "FK_ffb180b5d7dd94893ff008f4118" FOREIGN KEY ("bookEntityId") REFERENCES "book_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "collection_entity_books_book_entity" DROP CONSTRAINT "FK_ffb180b5d7dd94893ff008f4118"`,
    )
    await queryRunner.query(
      `ALTER TABLE "collection_entity_books_book_entity" DROP CONSTRAINT "FK_dad875686e89d367161fa53f070"`,
    )
    await queryRunner.query(
      `ALTER TABLE "book_entity_authors_author_entity" DROP CONSTRAINT "FK_55d59c177f6423a819bb9d72535"`,
    )
    await queryRunner.query(
      `ALTER TABLE "book_entity_authors_author_entity" DROP CONSTRAINT "FK_3bb30e7c32191521202457dcae1"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ffb180b5d7dd94893ff008f411"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dad875686e89d367161fa53f07"`,
    )
    await queryRunner.query(`DROP TABLE "collection_entity_books_book_entity"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55d59c177f6423a819bb9d7253"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3bb30e7c32191521202457dcae"`,
    )
    await queryRunner.query(`DROP TABLE "book_entity_authors_author_entity"`)
    await queryRunner.query(`DROP TABLE "collection_entity"`)
    await queryRunner.query(`DROP TABLE "book_entity"`)
    await queryRunner.query(`DROP TABLE "author_entity"`)
  }
}
