import { Elysia } from 'elysia';
import { adminMiddleware } from '../../middleware/admin';
import * as grammarController from '../../controllers/grammarController';
import { grammarCreateSchema, grammarUpdateSchema } from '../../utils/validation';

const adminGrammarRoutes = new Elysia({ prefix: '/grammar' })
  .use(adminMiddleware)
  
  // Create grammar
  .post('/', async ({ body, set }) => {
    const result = await grammarController.createGrammar(body);
    set.status = result.status;
    return result.error || result.data;
  }, { body: grammarCreateSchema })
  
  // Update grammar
  .put('/:id', async ({ params, body, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await grammarController.updateGrammar(id, body);
    set.status = result.status;
    return result.error || result.data;
  }, { body: grammarUpdateSchema })
  
  // Delete grammar
  .delete('/:id', async ({ params, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await grammarController.deleteGrammar(id);
    set.status = result.status;
    return result.error || result.data;
  });

export default adminGrammarRoutes;
