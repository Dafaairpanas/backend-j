import { Elysia, t } from 'elysia';
import { jwtPlugin } from '../middleware/auth';
import * as progressController from '../controllers/progressController';
import { errorResponse } from '../utils/response';
import type { JWTPayload } from '../models/types';

const progressRoutes = new Elysia({ prefix: '/api/progress' })
  .use(jwtPlugin)
  
  // Get overall user progress
  .get('/', async ({ jwt, headers, set }) => {
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
    
    const result = await progressController.getUserProgress(payload.userId) as any;
    set.status = result.status;
    return result.error || result.data;
  })
  
  // Get daily progress
  .get('/daily', async ({ jwt, headers, set }) => {
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
    
    const result = await progressController.getDailyProgress(payload.userId) as any;
    set.status = result.status;
    return result.error || result.data;
  })
  
  // Get weekly progress
  .get('/weekly', async ({ jwt, headers, set }) => {
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
    
    const result = await progressController.getWeeklyProgress(payload.userId) as any;
    set.status = result.status;
    return result.error || result.data;
  })
  
  // Update progress
  .post('/update', async ({ jwt, headers, body, set }) => {
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
    
    const result = await progressController.updateProgress(
      payload.userId,
      body.content_type,
      body.content_id,
      {
        mastery_delta: body.mastery_delta,
        correct: body.correct,
      }
    ) as any;
    set.status = result.status;
    return result.error || result.data;
  }, {
    body: t.Object({
      content_type: t.String(),
      content_id: t.Number(),
      mastery_delta: t.Optional(t.Number()),
      correct: t.Optional(t.Boolean()),
    }),
  })
  
  // Get progress for specific content
  .get('/:contentType/:contentId', async ({ jwt, headers, params, set }) => {
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
    
    const contentId = parseInt(params.contentId, 10);
    if (isNaN(contentId)) {
      set.status = 400;
      return errorResponse('Invalid content ID', 'INVALID_ID');
    }
    
    const result = await progressController.getContentProgress(
      payload.userId,
      params.contentType,
      contentId
    ) as any;
    set.status = result.status;
    return result.error || result.data;
  });

export default progressRoutes;
