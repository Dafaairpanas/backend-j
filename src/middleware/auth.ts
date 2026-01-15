import { Elysia, Context } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { supabase } from '../config/supabase';
import { errorResponse } from '../utils/response';
import type { JWTPayload } from '../models/types';

/**
 * JWT Plugin configuration
 */
export const jwtPlugin = jwt({
  name: 'jwt',
  secret: process.env.JWT_SECRET || 'your-super-secret-key-minimum-32-chars',
  exp: process.env.JWT_EXPIRES_IN || '7d',
});

/**
 * Auth middleware - verifies JWT token and attaches user to context
 */
export const authMiddleware = new Elysia({ name: 'auth' })
  .use(jwtPlugin)
  .derive(async (context: Context & { jwt: any }) => {
    const { headers, jwt, set } = context;
    const authorization = headers['authorization'];

    if (!authorization) {
      set.status = 401;
      return {
        user: null,
        userId: null,
        authError: errorResponse('Authorization header required', 'UNAUTHORIZED'),
      };
    }

    const token = authorization.replace('Bearer ', '');

    if (!token) {
      set.status = 401;
      return {
        user: null,
        userId: null,
        authError: errorResponse('Token required', 'UNAUTHORIZED'),
      };
    }

    try {
      const payload = await jwt.verify(token) as JWTPayload | false;

      if (!payload) {
        set.status = 401;
        return {
          user: null,
          userId: null,
          authError: errorResponse('Invalid or expired token', 'INVALID_TOKEN'),
        };
      }

      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, username, full_name, avatar_url, role, current_level, streak_days, total_xp')
        .eq('id', payload.userId)
        .single();

      if (error || !user) {
        set.status = 401;
        return {
          user: null,
          userId: null,
          authError: errorResponse('User not found', 'USER_NOT_FOUND'),
        };
      }

      return {
        user,
        userId: user.id as string,
        authError: null,
      };
    } catch (err) {
      set.status = 401;
      return {
        user: null,
        userId: null,
        authError: errorResponse('Token verification failed', 'TOKEN_ERROR'),
      };
    }
  })
  .onBeforeHandle(({ authError, set }: { authError: any, set: Context['set'] }) => {
    if (authError) {
      set.status = 401;
      return authError;
    }
  });

/**
 * Optional auth middleware
 */
export const optionalAuthMiddleware = new Elysia({ name: 'optional-auth' })
  .use(jwtPlugin)
  .derive(async (context: Context & { jwt: any }) => {
    const { headers, jwt } = context;
    const authorization = headers['authorization'];

    if (!authorization) {
      return { user: null, userId: null };
    }

    const token = authorization.replace('Bearer ', '');

    if (!token) {
      return { user: null, userId: null };
    }

    try {
      const payload = await jwt.verify(token) as JWTPayload | false;

      if (!payload) {
        return { user: null, userId: null };
      }

      const { data: user } = await supabase
        .from('users')
        .select('id, email, username, full_name, avatar_url, role, current_level, streak_days, total_xp')
        .eq('id', payload.userId)
        .single();

      return {
        user: user || null,
        userId: user?.id || null,
      };
    } catch {
      return { user: null, userId: null };
    }
  });
