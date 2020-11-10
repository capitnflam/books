import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { User, UsersService } from '../users/users.service'

export type Token = {
  access_token: string
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findOne(username)
    if (user && user.password === pass) {
      const { password: _password, ...result } = user
      return result
    }
    return null
  }

  async login(user: User): Promise<Token> {
    const payload = { username: user.username, sub: user.userId }
    return { access_token: this.jwtService.sign(payload) }
  }
}
