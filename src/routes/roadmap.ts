import { Elysia, t } from 'elysia';
import { jwtPlugin } from '../middleware/auth';
import * as roadmapController from '../controllers/roadmapController';
import { errorResponse, successResponse } from '../utils/response';
import type { JWTPayload } from '../models/types';

const roadmapRoutes = new Elysia({ prefix: '/api/roadmap' })
  .use(jwtPlugin)
  
  // Get all roadmaps overview (optional auth)
  .get('/', async ({ jwt, headers, set }) => {
    let userId: string | undefined;
    
    const token = headers.authorization?.replace('Bearer ', '');
    if (token) {
      const payload = await jwt.verify(token) as JWTPayload | false;
      if (payload) {
        userId = payload.userId;
      }
    }
    
    const result = await roadmapController.getAllRoadmaps(userId) as any;
    set.status = result.status;
    return result.error || result.data;
  })
  
  // Get roadmap for specific level (optional auth)
  .get('/:level', async ({ jwt, headers, params, set }) => {
    let userId: string | undefined;
    
    const token = headers.authorization?.replace('Bearer ', '');
    if (token) {
      const payload = await jwt.verify(token) as JWTPayload | false;
      if (payload) {
        userId = payload.userId;
      }
    }
    
    if (userId) {
      const result = await roadmapController.getRoadmapWithProgress(
        params.level,
        userId
      ) as any;
      set.status = result.status;
      return result.error || result.data;
    } else {
      const result = await roadmapController.getRoadmap(params.level) as any;
      set.status = result.status;
      return result.error || result.data;
    }
  })
  
  // Get stage details (optional auth)
  .get('/stage/:id', async ({ jwt, headers, params, set }) => {
    let userId: string | undefined;
    
    const token = headers.authorization?.replace('Bearer ', '');
    if (token) {
      const payload = await jwt.verify(token) as JWTPayload | false;
      if (payload) {
        userId = payload.userId;
      }
    }
    
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return errorResponse('Invalid stage ID', 'INVALID_ID');
    }
    
    const result = await roadmapController.getStageDetails(id, userId) as any;
    set.status = result.status;
    return result.error || result.data;
  })
  
  // Update roadmap progress (protected)
  .post('/stage/:id/progress', async ({ jwt, headers, params, body, set }) => {
    const token = headers.authorization?.replace('Bearer ', '');
    if (!token) {
      set.status = 401;
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }
    
    const payload = await jwt.verify(token) as JWTPayload | false;
    if (!payload) {
      set.status = 401;
      return errorResponse('Invalid token', 'INVALID_TOKEN');
    }
    
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return errorResponse('Invalid stage ID', 'INVALID_ID');
    }
    
    const result = await roadmapController.updateRoadmapProgress(
      payload.userId,
      id,
      body.progress_percentage
    ) as any;
    set.status = result.status;
    return result.error || result.data;
  }, {
    body: t.Object({
      progress_percentage: t.Number(),
    }),
  });

export default roadmapRoutes;
