import { Injectable } from '@nestjs/common'
import * as dotenv from 'dotenv'
import yargs, { InferredOptionTypes, Options } from 'yargs'
import { hideBin } from 'yargs/helpers'

dotenv.config()

const initOptions = <T extends Record<string, Options>>(options: T): T =>
  options

export const options = initOptions({
  listen: {
    alias: 'l',
    type: 'string',
    default: '0.0.0.0',
    description: 'the address on which to bind the listener',
  },
  port: {
    alias: 'p',
    type: 'number',
    default: 3000,
    description: 'the port on which to listen',
  },
  'database-url': {
    type: 'string',
    description: 'a PostgreSQL connection URL to the database',
  },
  'log-level': {
    choices: ['error', 'warn', 'info', 'debug'],
    default: 'error',
    description: 'the verbosity level of the logs',
  },
  'allow-origin': {
    type: 'array',
    default: [],
    coerce: (args) => args as string[],
    description: 'add an allowed origin for CORS (can be used multiple times)',
  },
})

export type Config = InferredOptionTypes<typeof options>

@Injectable()
export class ConfigService {
  private readonly config: Config

  constructor() {
    const parser = yargs()
      .strict()
      .config()
      .env('BOOKS_SERVER')
      .help()
      .options(options)
    this.config = parser.parseSync(hideBin(process.argv))
  }

  public get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key]
  }
}
