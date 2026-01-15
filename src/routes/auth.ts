import { Elysia } from 'elysia';
import { jwtPlugin } from '../middleware/auth';
import * as authController from '../controllers/authController';
import { loginSchema, registerSchema } from '../utils/validation';

const authRoutes = new Elysia({ prefix: '/api/auth' })
  .use(jwtPlugin)
  
  // Register
  .post(
    '/register',
    async ({ body, jwt, set }) => {
      const result = await authController.register(body, jwt);
      set.status = result.status;
      return result.error || result.data;
    },
    { body: registerSchema }
  )
  
  // Login
  .post(
    '/login',
    async ({ body, jwt, set }) => {
      const result = await authController.login(body, jwt);
      set.status = result.status;
      return result.error || result.data;
    },
    { body: loginSchema }
  )
  
  // Get current user (protected)
  .get('/me', async ({ headers, jwt, set }) => {
    const token = headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      set.status = 401;
      return { success: false, error: { message: 'Unauthorized' } };
    }

    const payload = await jwt.verify(token) as any;
    if (!payload) {
      set.status = 401;
      return { success: false, error: { message: 'Invalid token' } };
    }

    const result = await authController.getCurrentUser(payload.userId);
    set.status = result.status;
    return result.error || result.data;
  })
  
  // Logout (just returns success - client should remove token)
  .post('/logout', () => ({
    success: true,
    message: 'Logged out successfully',
  }));

export default authRoutes;
