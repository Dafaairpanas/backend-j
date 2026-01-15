import { Elysia } from 'elysia';
import { adminMiddleware } from '../../middleware/admin';
import * as katakanaController from '../../controllers/katakanaController';
import { katakanaCreateSchema, katakanaUpdateSchema } from '../../utils/validation';

const adminKatakanaRoutes = new Elysia({ prefix: '/katakana' })
  .use(adminMiddleware)
  
  // Create katakana
  .post('/', async ({ body, set }) => {
    const result = await katakanaController.createKatakana(body);
    set.status = result.status;
    return result.error || result.data;
  }, { body: katakanaCreateSchema })
  
  // Update katakana
  .put('/:id', async ({ params, body, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await katakanaController.updateKatakana(id, body);
    set.status = result.status;
    return result.error || result.data;
  }, { body: katakanaUpdateSchema })
  
  // Delete katakana
  .delete('/:id', async ({ params, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await katakanaController.deleteKatakana(id);
    set.status = result.status;
    return result.error || result.data;
  });

export default adminKatakanaRoutes;
