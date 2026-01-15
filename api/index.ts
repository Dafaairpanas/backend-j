import { app } from '../src/app';

// Vercel Serverless Function (Standard Node.js)
export default function handler(request: Request, response: any) {
  return app.handle(request);
}
