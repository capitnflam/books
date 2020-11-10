import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import * as request from 'supertest'

import { AppModule } from '../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/ (GET) unauthorized', () => {
    return request(app.getHttpServer()).get('/').expect(401)
  })

  it('/ (GET) logged in', async () => {
    const token = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'john', password: 'changeme' })
      .expect(201)
      .then(({ body }) => body.access_token)
    expect(token).not.toBeNull()
    expect(token).not.toBeUndefined()

    return request(app.getHttpServer())
      .get('/')
      .set('Authorization', `Bearer ${token}`)
      .expect(200, 'Hello World!')
  })
})
