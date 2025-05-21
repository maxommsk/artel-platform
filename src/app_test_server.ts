import express from 'express';
import { POST as registerHandler } from './app/api/auth/register/route';
import { NextRequest } from 'next/server';

const app = express();
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
  const body = req.body;
  const request = new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });

  const response = await registerHandler(request);
  const json = await response.json();
  res.status(response.status).json(json);
});

export default app;
