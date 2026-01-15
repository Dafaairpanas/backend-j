import { Elysia, t } from 'elysia';
import * as kanjiController from '../controllers/kanjiController';

const kanjiRoutes = new Elysia({ prefix: '/api/kanji' })
  // Get all kanji with pagination
  .get('/', async ({ query, set }) => {
    const result = await kanjiController.getAllKanji(
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
  
  // Search kanji
  .get('/search', async ({ query, set }) => {
    const result = await kanjiController.searchKanji(
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
  
  // Get kanji statistics
  .get('/stats', async ({ set }) => {
    const result = await kanjiController.getKanjiStats();
    set.status = result.status;
    return result.data;
  })
  
  // Get kanji by ID
  .get('/:id', async ({ params, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await kanjiController.getKanjiById(id);
    set.status = result.status;
    return result.error || result.data;
  });

export default kanjiRoutes;
