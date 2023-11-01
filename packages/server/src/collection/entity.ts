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

import { BookEntity } from '../book'

@Entity()
export class CollectionEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  name: string
  @CreateDateColumn()
  createdAt: Date
  @UpdateDateColumn()
  updatedAt: Date
  @DeleteDateColumn()
  deletedAt: Date

  @ManyToMany(() => BookEntity)
  @JoinTable()
  books: BookEntity[]
}
