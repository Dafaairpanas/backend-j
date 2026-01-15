import { Elysia } from 'elysia';
import { jwtPlugin } from '../middleware/auth';
import * as authController from '../controllers/authController';
import { loginSchema, registerSchema } from '../utils/validation';

const authRoutes = new Elysia({ prefix: '/api/auth' })
  .use(jwtPlugin)
  
  // Register
  .post(
    '/register',
    (context) => authController.register(context as any),
    { body: registerSchema }
  )
  
  // Login
  .post(
    '/login',
    (context) => authController.login(context as any),
    { body: loginSchema }
  )
  
  // Get current user (protected)
  .get('/me', async (context) => {
    const { headers, jwt, set } = context;
    const token = headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      set.status = 401;
      return { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } };
    }

    const payload = await jwt.verify(token) as any;
    if (!payload) {
      set.status = 401;
      return { success: false, error: { message: 'Invalid token', code: 'INVALID_TOKEN' } };
    }

    const userPayload = { id: payload.sub, ...payload };
    return authController.getProfile({ ...context, user: userPayload });
  })
  
  // Logout
  .post('/logout', () => ({
    success: true,
    message: 'Logged out successfully',
  }));

export default authRoutes;
