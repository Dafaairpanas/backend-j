import { Elysia, t } from 'elysia';
import { adminMiddleware } from '../../middleware/admin';
import * as vocabularyController from '../../controllers/vocabularyController';
import { vocabularyCreateSchema, vocabularyUpdateSchema } from '../../utils/validation';

const adminVocabularyRoutes = new Elysia({ prefix: '/vocabulary' })
  .use(adminMiddleware)
  
  // Create vocabulary
  .post('/', async ({ body, set }) => {
    const result = await vocabularyController.createVocabulary(body);
    set.status = result.status;
    return result.error || result.data;
  }, { body: vocabularyCreateSchema })
  
  // Bulk create vocabulary
  .post('/bulk', async ({ body, set }) => {
    const result = await vocabularyController.bulkCreateVocabulary(body.vocabulary);
    set.status = result.status;
    return result.error || result.data;
  }, {
    body: t.Object({
      vocabulary: t.Array(vocabularyCreateSchema),
    }),
  })
  
  // Update vocabulary
  .put('/:id', async ({ params, body, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await vocabularyController.updateVocabulary(id, body);
    set.status = result.status;
    return result.error || result.data;
  }, { body: vocabularyUpdateSchema })
  
  // Delete vocabulary
  .delete('/:id', async ({ params, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await vocabularyController.deleteVocabulary(id);
    set.status = result.status;
    return result.error || result.data;
  });

export default adminVocabularyRoutes;
