import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import SecurityUtil from '../src/utils/security.util';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST api/user', async () => {
    const createUserDTO = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'eugeniaikwuegbu+12@gmail.com',
    };

    const response = await request(app.getHttpServer())
      .post(`/api/user`)
      .send(createUserDTO)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'User created');
    expect(response.body.response).toHaveProperty('user');
  });

  it('/GET api/user/:userId', async () => {
    const userId = '1';

    const response = await request(app.getHttpServer())
      .get(`/api/user/${userId}`)
      .expect(200);

    expect(response.body).toHaveProperty(
      'message',
      'User fetched successfully',
    );
    expect(response.body.response).toHaveProperty('id', Number(userId));
  });

  it('/GET api/user/:userId/avatar', async () => {
    const userId = '1';

    const response = await request(app.getHttpServer())
      .get(`/api/user/${userId}/avatar`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'User avatar fetched');
    expect(response.body).toHaveProperty('response');
    expect(SecurityUtil.isBase64(response.body.response)).toBe(true);
  });

  it('/DELETE api/user/:userId/avatar', async () => {
    const userId = '1';

    const response = await request(app.getHttpServer())
      .delete(`/api/user/${userId}/avatar`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'User avatar deleted');
    expect(response.body).toHaveProperty('response');
  });
});
