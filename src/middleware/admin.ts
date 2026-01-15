import { Elysia } from 'elysia';
import { authMiddleware } from './auth';
import { errorResponse } from '../utils/response';

/**
 * Admin middleware - requires user to be authenticated with admin role
 */
export const adminMiddleware = new Elysia({ name: 'admin' })
  .use(authMiddleware)
  .onBeforeHandle((context: any) => {
    const { user, set } = context;
    if (!user) {
      set.status = 401;
      return errorResponse('Authentication required', 'UNAUTHORIZED');
    }

    if (user.role !== 'admin') {
      set.status = 403;
      return errorResponse('Admin access required', 'FORBIDDEN');
    }
  });
