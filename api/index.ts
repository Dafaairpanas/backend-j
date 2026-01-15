import { app } from '../src/app';

// Vercel Serverless Function entry point
export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
export const PATCH = app.handle;
export const OPTIONS = app.handle;
export const HEAD = app.handle;

// Default export is also supported sometimes but explicit methods are better for Next.js/Vercel
export default app.handle;
