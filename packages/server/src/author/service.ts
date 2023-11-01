import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Author, authorSchema } from '~books/types'

import { AuthorEntity } from './entity'

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(AuthorEntity)
    private readonly authorsRepository: Repository<AuthorEntity>,
  ) {}

  async getAll(): Promise<Author[]> {
    const authors = await this.authorsRepository.find()

    if (!authors) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }

    const results = authors.map((author) => authorSchema.parse(author))

    return results
  }

  async get(id: number): Promise<Author> {
    const author = await this.authorsRepository.findOne({ where: { id } })

    if (!author) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }

    const result = authorSchema.parse(author)

    return result
  }
}
