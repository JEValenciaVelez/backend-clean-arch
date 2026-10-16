import { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { createContainer, IContainer } from '@/presentation/container/container';
import { API_PREFIX, createServer } from '@/presentation/http/server';

describe('POST /api/v1/admin/auth/login', () => {
  let app: Express;
  let container: IContainer;

  beforeAll(async () => {
    container = await createContainer();
    app = createServer(container);
  });

  it('logs in a seeded user and returns a token', async () => {
    const response = await request(app)
      .post(`${API_PREFIX}/admin/auth/login`)
      .send({ cellphone: '3000000000', password: 'password', country: 'CO' });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeTypeOf('string');
    expect(response.body.data.user.email).toBe('dev@example.com');
  });

  it('rejects invalid credentials with 401', async () => {
    const response = await request(app)
      .post(`${API_PREFIX}/admin/auth/login`)
      .send({ cellphone: '3000000000', password: 'nope', country: 'CO' });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('invalid.credentials');
  });

  it('rejects an invalid body with 400', async () => {
    const response = await request(app)
      .post(`${API_PREFIX}/admin/auth/login`)
      .send({ cellphone: '1' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBeDefined();
  });
});
