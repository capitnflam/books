import { registerAs } from '@nestjs/config'

const { JWT_SECRET } = process.env

export default registerAs('auth', () => ({
  jwtSecret: JWT_SECRET || 'foobar',
}))
