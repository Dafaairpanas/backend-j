import { Elysia, t } from 'elysia';
import { jwtPlugin } from '../middleware/auth';
import * as quizController from '../controllers/quizController';
import { errorResponse } from '../utils/response';
import type { JWTPayload } from '../models/types';

const quizRoutes = new Elysia({ prefix: '/api/quiz' })
  .use(jwtPlugin)
  
  // Start new quiz
  .post('/start', async ({ jwt, headers, body, set }) => {
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
    
    const result = await quizController.startQuiz(
      payload.userId,
      body.type as any,
      body.level as any,
      body.question_count
    );
    set.status = result.status;
    return result.error || result.data;
  }, {
    body: t.Object({
      type: t.String(),
      level: t.Optional(t.String()),
      question_count: t.Optional(t.Number()),
    }),
  })
  
  // Submit quiz answers
  .post('/submit', async ({ body, set }) => {
    const result = await quizController.submitQuiz(
      body.quiz_id,
      body.answers
    );
    set.status = result.status;
    return result.error || result.data;
  }, {
    body: t.Object({
      quiz_id: t.String(),
      answers: t.Array(
        t.Object({
          question_id: t.String(),
          answer: t.String(),
        })
      ),
    }),
  })
  
  // Get quiz history
  .get('/history', async ({ jwt, headers, query, set }) => {
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
    
    const result = await quizController.getQuizHistory(
      payload.userId,
      query.page,
      query.limit
    );
    set.status = result.status;
    return result.error || result.data;
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })
  
  // Get quiz statistics
  .get('/stats', async ({ jwt, headers, set }) => {
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
    
    const result = await quizController.getQuizStats(payload.userId);
    set.status = result.status;
    return result.error || result.data;
  })
  
  // Get specific quiz result
  .get('/:id', async ({ params, set }) => {
    const result = await quizController.getQuizResult(params.id);
    set.status = result.status;
    return result.error || result.data;
  });

export default quizRoutes;
