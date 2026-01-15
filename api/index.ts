import { app } from '../src/app';

// Vercel Serverless Function (Node.js runtime)
export default function handler(request: Request, response: any) {
  // Elysia handle method adapts correctly to standard Request objects
  return app.handle(request);
}
