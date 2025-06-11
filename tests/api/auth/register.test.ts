import request from 'supertest';
import { createServer, Server } from 'http';
import app from '@/app_test_server'; // убедись что такой файл создан

let server: Server;

beforeEach(() => {
  server = createServer(app);
});

afterEach((done) => {
  server.close(done);
});

describe('POST /api/auth/register', () => {
  it('should return 400 if missing fields', async () => {
    const response = await request(server)
      .post('/api/auth/register')
      .send({ username: '', email: '', password: '' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

