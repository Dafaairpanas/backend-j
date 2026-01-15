import { Elysia } from 'elysia';
import { adminMiddleware } from '../../middleware/admin';
import * as hiraganaController from '../../controllers/hiraganaController';
import { hiraganaCreateSchema, hiraganaUpdateSchema } from '../../utils/validation';

const adminHiraganaRoutes = new Elysia({ prefix: '/hiragana' })
  .use(adminMiddleware)
  
  // Create hiragana
  .post('/', async ({ body, set }) => {
    const result = await hiraganaController.createHiragana(body);
    set.status = result.status;
    return result.error || result.data;
  }, { body: hiraganaCreateSchema })
  
  // Update hiragana
  .put('/:id', async ({ params, body, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await hiraganaController.updateHiragana(id, body);
    set.status = result.status;
    return result.error || result.data;
  }, { body: hiraganaUpdateSchema })
  
  // Delete hiragana
  .delete('/:id', async ({ params, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await hiraganaController.deleteHiragana(id);
    set.status = result.status;
    return result.error || result.data;
  });

export default adminHiraganaRoutes;
