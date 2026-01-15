import { Elysia, t } from 'elysia';
import * as hiraganaController from '../controllers/hiraganaController';
import { hiraganaQuery, idParam } from '../utils/validation';

const hiraganaRoutes = new Elysia({ prefix: '/api/hiragana' })
  // Get all hiragana
  .get('/', async ({ query, set }) => {
    const result = await hiraganaController.getAllHiragana(query.type);
    set.status = result.status;
    return result.error || result.data;
  }, { query: hiraganaQuery })
  
  // Get hiragana grouped by type
  .get('/grouped', async ({ set }) => {
    const result = await hiraganaController.getHiraganaGrouped();
    set.status = result.status;
    return result.error || result.data;
  })
  
  // Get hiragana by ID
  .get('/:id', async ({ params, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await hiraganaController.getHiraganaById(id);
    set.status = result.status;
    return result.error || result.data;
  });

export default hiraganaRoutes;
