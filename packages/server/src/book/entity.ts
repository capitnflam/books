import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { AuthorEntity } from '../author'

@Entity()
export class BookEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  title: string
  @Column({ nullable: true })
  coverURL!: string
  @Column({ unique: true, nullable: true })
  isbn!: string
  @Column({ nullable: true, type: 'text' })
  synopsis!: string
  @CreateDateColumn()
  createdAt: Date
  @UpdateDateColumn()
  updatedAt: Date
  @DeleteDateColumn()
  deletedAt: Date

  @ManyToMany(() => AuthorEntity)
  @JoinTable()
  authors: AuthorEntity[]

  // collections BooksInCollections[]
}
