import { app } from '../src/app';

export const config = {
  runtime: 'edge', // Pakai Edge Runtime (lebih cepat & support standard Web API mirip Bun)
};

export default async function handler(request: Request) {
  return app.fetch(request);
}
