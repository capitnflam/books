import { Injectable } from '@nestjs/common'
import { User } from './type'

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    { id: 1, password: 'bar', username: 'foo' },
    { id: 2, password: 'baz', username: 'qux' },
  ]

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username)
  }
}
