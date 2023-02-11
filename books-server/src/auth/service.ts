import { Injectable } from '@nestjs/common'

import { User, UsersService } from '../users'

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findOne(username)

    if (user && user.password === pass) {
      const { password, ...result } = user

      return result
    }

    return null
  }
}
