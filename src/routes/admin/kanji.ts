import { Elysia, t } from 'elysia';
import { adminMiddleware } from '../../middleware/admin';
import * as kanjiController from '../../controllers/kanjiController';
import { kanjiCreateSchema, kanjiUpdateSchema } from '../../utils/validation';

const adminKanjiRoutes = new Elysia({ prefix: '/kanji' })
  .use(adminMiddleware)
  
  // Create kanji
  .post('/', async ({ body, set }) => {
    const result = await kanjiController.createKanji(body as any);
    set.status = result.status;
    return result.error || result.data;
  }, { body: kanjiCreateSchema })
  
  // Bulk create kanji
  .post('/bulk', async ({ body, set }) => {
    const result = await kanjiController.bulkCreateKanji(body.kanji as any);
    set.status = result.status;
    return result.error || result.data;
  }, {
    body: t.Object({
      kanji: t.Array(kanjiCreateSchema),
    }),
  })
  
  // Update kanji
  .put('/:id', async ({ params, body, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await kanjiController.updateKanji(id, body as any);
    set.status = result.status;
    return result.error || result.data;
  }, { body: kanjiUpdateSchema })
  
  // Delete kanji
  .delete('/:id', async ({ params, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await kanjiController.deleteKanji(id);
    set.status = result.status;
    return result.error || result.data;
  });

export default adminKanjiRoutes;
