import { cors } from '@elysiajs/cors';

/**
 * CORS configuration for the API
 */
export const corsConfig = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Range', 'X-Content-Range', 'X-Total-Count'],
});
