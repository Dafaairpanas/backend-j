import { Elysia, t } from 'elysia';
import { jwtPlugin } from '../../middleware/auth';
import { supabase } from '../../config/supabase';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response';
import { parsePagination } from '../../utils/pagination';
import type { JWTPayload } from '../../models/types';

// Helper to verify admin
async function verifyAdmin(jwt: any, headers: Record<string, string | undefined>) {
  const token = headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  const payload = await jwt.verify(token) as JWTPayload | false;
  if (!payload) return null;
  
  const { data: user } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', payload.userId)
    .single();
  
  if (!user || user.role !== 'admin') return null;
  
  return user;
}

const adminUsersRoutes = new Elysia({ prefix: '/users' })
  .use(jwtPlugin)
  
  // Get all users
  .get('/', async ({ jwt, headers, query, set }) => {
    const admin = await verifyAdmin(jwt, headers);
    if (!admin) {
      set.status = 403;
      return errorResponse('Admin access required', 'FORBIDDEN');
    }
    
    const { page, limit, offset } = parsePagination(query.page, query.limit);
    
    const { data, error, count } = await supabase
      .from('users')
      .select('id, email, username, full_name, avatar_url, role, current_level, streak_days, total_xp, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      set.status = 500;
      return errorResponse('Failed to fetch users', 'FETCH_ERROR');
    }
    
    return paginatedResponse(data || [], page, limit, count || 0);
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })
  
  // Get user by ID
  .get('/:id', async ({ jwt, headers, params, set }) => {
    const admin = await verifyAdmin(jwt, headers);
    if (!admin) {
      set.status = 403;
      return errorResponse('Admin access required', 'FORBIDDEN');
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, full_name, avatar_url, role, current_level, streak_days, total_xp, last_activity_at, created_at, updated_at')
      .eq('id', params.id)
      .single();
    
    if (error || !data) {
      set.status = 404;
      return errorResponse('User not found', 'NOT_FOUND');
    }
    
    // Get user's progress summary
    const { data: progress } = await supabase
      .from('user_progress')
      .select('content_type, mastery_level')
      .eq('user_id', params.id);
    
    // Get user's quiz stats
    const { count: quizCount } = await supabase
      .from('quizzes')
      .select('id', { count: 'exact' })
      .eq('user_id', params.id);
    
    return successResponse({
      ...data,
      stats: {
        items_learned: progress?.length || 0,
        quizzes_completed: quizCount || 0,
      },
    });
  })
  
  // Update user role
  .put('/:id/role', async ({ jwt, headers, params, body, set }) => {
    const admin = await verifyAdmin(jwt, headers);
    if (!admin) {
      set.status = 403;
      return errorResponse('Admin access required', 'FORBIDDEN');
    }
    
    const { data, error } = await supabase
      .from('users')
      .update({
        role: body.role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select('id, email, username, role')
      .single();
    
    if (error) {
      set.status = 500;
      return errorResponse('Failed to update user role', 'UPDATE_ERROR');
    }
    
    if (!data) {
      set.status = 404;
      return errorResponse('User not found', 'NOT_FOUND');
    }
    
    return successResponse(data, 'User role updated');
  }, {
    body: t.Object({
      role: t.Union([t.Literal('user'), t.Literal('admin')]),
    }),
  })
  
  // Delete user
  .delete('/:id', async ({ jwt, headers, params, set }) => {
    const admin = await verifyAdmin(jwt, headers);
    if (!admin) {
      set.status = 403;
      return errorResponse('Admin access required', 'FORBIDDEN');
    }
    
    // Prevent self-deletion
    if (params.id === admin.id) {
      set.status = 400;
      return errorResponse('Cannot delete your own account', 'SELF_DELETE');
    }
    
    // Delete user's progress first
    await supabase.from('user_progress').delete().eq('user_id', params.id);
    await supabase.from('flashcard_reviews').delete().eq('user_id', params.id);
    await supabase.from('quizzes').delete().eq('user_id', params.id);
    await supabase.from('user_roadmap_progress').delete().eq('user_id', params.id);
    await supabase.from('user_achievements').delete().eq('user_id', params.id);
    
    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', params.id);
    
    if (error) {
      set.status = 500;
      return errorResponse('Failed to delete user', 'DELETE_ERROR');
    }
    
    return successResponse(null, 'User deleted');
  })
  
  // Get admin analytics
  .get('/analytics/overview', async ({ jwt, headers, set }) => {
    const admin = await verifyAdmin(jwt, headers);
    if (!admin) {
      set.status = 403;
      return errorResponse('Admin access required', 'FORBIDDEN');
    }
    
    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' });
    
    // Active users (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: activeUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .gte('last_activity_at', weekAgo.toISOString());
    
    // Total content
    const [hiraganaCount, katakanaCount, kanjiCount, vocabCount, grammarCount] = await Promise.all([
      supabase.from('hiragana').select('id', { count: 'exact' }),
      supabase.from('katakana').select('id', { count: 'exact' }),
      supabase.from('kanji').select('id', { count: 'exact' }),
      supabase.from('vocabulary').select('id', { count: 'exact' }),
      supabase.from('grammar').select('id', { count: 'exact' }),
    ]);
    
    // Total quizzes
    const { count: totalQuizzes } = await supabase
      .from('quizzes')
      .select('id', { count: 'exact' });
    
    return successResponse({
      users: {
        total: totalUsers || 0,
        active_week: activeUsers || 0,
      },
      content: {
        hiragana: hiraganaCount.count || 0,
        katakana: katakanaCount.count || 0,
        kanji: kanjiCount.count || 0,
        vocabulary: vocabCount.count || 0,
        grammar: grammarCount.count || 0,
      },
      quizzes: {
        total: totalQuizzes || 0,
      },
    });
  });

export default adminUsersRoutes;
