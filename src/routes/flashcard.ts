import { Elysia, t } from 'elysia';
import { jwtPlugin } from '../middleware/auth';
import * as flashcardController from '../controllers/flashcardController';
import { supabase } from '../config/supabase';
import { errorResponse } from '../utils/response';
import type { JWTPayload } from '../models/types';

const flashcardRoutes = new Elysia({ prefix: '/api/flashcard' })
  .use(jwtPlugin)
  
  // Get next flashcard to review
  .get('/next', async ({ jwt, headers, query, set }) => {
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
    
    const result = await flashcardController.getNextFlashcard(
      payload.userId,
      query.type
    );
    set.status = result.status;
    return result.error || result.data;
  }, {
    query: t.Object({
      type: t.Optional(t.String()),
    }),
  })
  
  // Get all due flashcards
  .get('/due', async ({ jwt, headers, query, set }) => {
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
    
    const result = await flashcardController.getDueFlashcards(
      payload.userId,
      query.type,
      query.limit ? parseInt(query.limit, 10) : undefined
    );
    set.status = result.status;
    return result.error || result.data;
  }, {
    query: t.Object({
      type: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })
  
  // Submit review result
  .post('/review', async ({ jwt, headers, body, set }) => {
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
    
    const result = await flashcardController.submitReview(
      payload.userId,
      body.content_type,
      body.content_id,
      body.result as 'again' | 'hard' | 'good' | 'easy'
    );
    set.status = result.status;
    return result.error || result.data;
  }, {
    body: t.Object({
      content_type: t.String(),
      content_id: t.Number(),
      result: t.String(),
    }),
  })
  
  // Get SRS statistics
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
    
    const result = await flashcardController.getSRSStats(payload.userId);
    set.status = result.status;
    return result.error || result.data;
  })
  
  // Add content to flashcards
  .post('/add', async ({ jwt, headers, body, set }) => {
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
    
    const result = await flashcardController.addToFlashcards(
      payload.userId,
      body.content_type,
      body.content_ids
    );
    set.status = result.status;
    return result.error || result.data;
  }, {
    body: t.Object({
      content_type: t.String(),
      content_ids: t.Array(t.Number()),
    }),
  })
  
  // Get user's flashcard decks
  .get('/decks', async ({ jwt, headers, set }) => {
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
    
    const result = await flashcardController.getUserDecks(payload.userId);
    set.status = result.status;
    return result.error || result.data;
  })
  
  // Create new deck
  .post('/decks', async ({ jwt, headers, body, set }) => {
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
    
    const result = await flashcardController.createDeck(
      payload.userId,
      body.name,
      body.description,
      body.content_type,
      body.level
    );
    set.status = result.status;
    return result.error || result.data;
  }, {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
      content_type: t.Optional(t.String()),
      level: t.Optional(t.String()),
    }),
  });

export default flashcardRoutes;
