import { Elysia, t } from 'elysia';
import { adminMiddleware } from '../../middleware/admin';
import * as roadmapController from '../../controllers/roadmapController';

const adminCurriculumRoutes = new Elysia({ prefix: '/curriculum' })
  .use(adminMiddleware)
  
  // Create roadmap stage
  .post('/stages', async ({ body, set }) => {
    const result = await roadmapController.createStage(body as any);
    set.status = result.status;
    return result.error || result.data;
  }, {
    body: t.Object({
      level: t.String(),
      stage_number: t.Number(),
      title: t.String(),
      description: t.String(),
      objectives: t.Array(t.String()),
      content_requirements: t.Array(
        t.Object({
          type: t.String(),
          count: t.Number(),
          ids: t.Optional(t.Array(t.Number())),
        })
      ),
      estimated_hours: t.Number(),
      order_index: t.Number(),
    }),
  })
  
  // Update roadmap stage
  .put('/stages/:id', async ({ params, body, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await roadmapController.updateStage(id, body as any);
    set.status = result.status;
    return result.error || result.data;
  }, {
    body: t.Partial(
      t.Object({
        level: t.String(),
        stage_number: t.Number(),
        title: t.String(),
        description: t.String(),
        objectives: t.Array(t.String()),
        content_requirements: t.Array(
          t.Object({
            type: t.String(),
            count: t.Number(),
            ids: t.Optional(t.Array(t.Number())),
          })
        ),
        estimated_hours: t.Number(),
        order_index: t.Number(),
      })
    ),
  })
  
  // Delete roadmap stage
  .delete('/stages/:id', async ({ params, set }) => {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      set.status = 400;
      return { success: false, error: { message: 'Invalid ID' } };
    }
    
    const result = await roadmapController.deleteStage(id);
    set.status = result.status;
    return result.error || result.data;
  });

export default adminCurriculumRoutes;
