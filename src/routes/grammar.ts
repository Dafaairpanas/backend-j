import { Elysia, t } from 'elysia';
import * as grammarController from '../controllers/grammarController';

const grammarRoutes = new Elysia({ prefix: '/api/grammar' })
  // Get all grammar with pagination
  .get('/', async ({ query, set }) => {
    const result = await grammarController.getAllGrammar(
      query.level,
      query.page,
      query.limit
    );
    set.status = result.status;
    return result.error || result.data;
  }, {
    query: t.Object({
      level: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })
  
  // Search grammar
  .get('/search', async ({ query, set }) => {
    const result = await grammarController.searchGrammar(
      query.q,
      query.page,
      query.limit
    );
    set.status = result.status;
    return result.error || result.data;
  }, {
    query: t.Object({
      q: t.String(),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })
  
  // Get grammar statistics
  .get('/stats', async ({ set }) => {
    const result = await grammarController.getGrammarStats();
    set.status = result.status;
    return result.data;
  })
  
  // Get grammar by ID
  .get('/:id', async ({ params, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await grammarController.getGrammarById(id);
    set.status = result.status;
    return result.error || result.data;
  });

export default grammarRoutes;
