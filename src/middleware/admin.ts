import { Elysia, Context } from 'elysia';
import { errorResponse } from '../utils/response';

/**
 * Admin middleware - checks if user has admin role
 * Must remain separate from auth middleware to maintain chain integrity
 */
export const adminMiddleware = new Elysia({ name: 'admin' })
  .derive((context: any) => {
    const { user, set } = context;

    if (!user || user.role !== 'admin') {
      set.status = 403;
      return {
        adminError: errorResponse('Admin access required', 'FORBIDDEN'),
      };
    }

    return { adminError: null };
  })
  .onBeforeHandle(({ adminError, set }: { adminError: any, set: Context['set'] }) => {
    if (adminError) {
      set.status = 403;
      return adminError;
    }
  });
