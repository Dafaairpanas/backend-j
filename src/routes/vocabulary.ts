import { Elysia, t } from 'elysia';
import * as vocabularyController from '../controllers/vocabularyController';
import { vocabularyQuery, searchQuery } from '../utils/validation';

const vocabularyRoutes = new Elysia({ prefix: '/api/vocabulary' })
  // Get all vocabulary with pagination
  .get('/', async ({ query, set }) => {
    const result = await vocabularyController.getAllVocabulary(
      query.level,
      query.category,
      query.page,
      query.limit
    );
    set.status = result.status;
    return result.error || result.data;
  }, { query: vocabularyQuery })
  
  // Search vocabulary
  .get('/search', async ({ query, set }) => {
    const result = await vocabularyController.searchVocabulary(
      query.q,
      query.page,
      query.limit
    );
    set.status = result.status;
    return result.error || result.data;
  }, { query: searchQuery })
  
  // Get vocabulary categories
  .get('/categories', async ({ set }) => {
    const result = await vocabularyController.getVocabularyCategories();
    set.status = result.status;
    return result.error || result.data;
  })
  
  // Get vocabulary by ID
  .get('/:id', async ({ params, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await vocabularyController.getVocabularyById(id);
    set.status = result.status;
    return result.error || result.data;
  });

export default vocabularyRoutes;
