import request from 'supertest';
import { createServer } from 'http';
import app from '@/app_test_server'; // убедись что такой файл создан

describe('POST /api/auth/register', () => {
  it('should return 400 if missing fields', async () => {
    const server = createServer(app);
    const response = await request(server)
      .post('/api/auth/register')
      .send({ username: '', email: '', password: '' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

