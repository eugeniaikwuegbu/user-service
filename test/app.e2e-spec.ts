// app.e2e-spec.ts
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 10000);

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  }, 10000);

  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.OK);

    const parsedResponse = JSON.parse(response.text);

    expect(parsedResponse.response).toBe('User Service is up and running');
  });
});
