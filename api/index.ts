import { app } from '../src/app';

export const config = {
  runtime: 'edge', // Sekarang AMAN karena pakai bcryptjs
};

export default async function handler(request: Request) {
  return app.fetch(request);
}
