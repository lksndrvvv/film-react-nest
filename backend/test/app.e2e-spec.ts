import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';

import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

import request = require('supertest');

import { AppModule } from '../src/app.module';

describe('Film API (e2e)', () => {
  let app: INestApplication;

  const filmId = '0e33c7f6-27a7-4aa0-8e61-65d7e5effecf';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/afisha');

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      const connection = app.get<Connection>('MONGO_CONNECTION');

      await connection.close();
      await app.close();
    }
  });

  it('GET /api/afisha/films returns films', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/afisha/films')
      .expect(200);

    expect(response.body.total).toBeGreaterThan(0);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items[0]).toHaveProperty('id');
  });

  it('GET schedule returns sessions', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/afisha/films/${filmId}/schedule`)
      .expect(200);

    expect(response.body.total).toBeGreaterThan(0);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items[0]).toHaveProperty('taken');
  });

  it('GET unknown film returns 404', async () => {
    await request(app.getHttpServer())
      .get('/api/afisha/films/unknown-film/schedule')
      .expect(404);
  });

  it('POST empty order returns 400', async () => {
    await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send({
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [],
      })
      .expect(400);
  });

  it('POST invalid seat returns 400', async () => {
    await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send({
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [
          {
            film: filmId,
            session: 'f2e429b0-685d-41f8-a8cd-1d8cb63b99ce',
            row: 100,
            seat: 100,
          },
        ],
      })
      .expect(400);
  });
});
