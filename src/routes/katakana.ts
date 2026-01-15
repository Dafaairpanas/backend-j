import { Elysia, t } from 'elysia';
import * as katakanaController from '../controllers/katakanaController';
import { katakanaQuery } from '../utils/validation';

const katakanaRoutes = new Elysia({ prefix: '/api/katakana' })
  // Get all katakana
  .get('/', async ({ query, set }) => {
    const result = await katakanaController.getAllKatakana(query.type);
    set.status = result.status;
    return result.error || result.data;
  }, { query: katakanaQuery })
  
  // Get katakana grouped by type
  .get('/grouped', async ({ set }) => {
    const result = await katakanaController.getKatakanaGrouped();
    set.status = result.status;
    return result.error || result.data;
  })
  
  // Get katakana by ID
  .get('/:id', async ({ params, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await katakanaController.getKatakanaById(id);
    set.status = result.status;
    return result.error || result.data;
  });

export default katakanaRoutes;
