import { supabase } from '../config/supabase';
import { successResponse, errorResponse } from '../utils/response';
import { checkAchievements, updateStreak } from '../services/achievementService';

/**
 * Get overall user progress
 */
export async function getUserProgress(userId: string) {
  try {
    // Get user data
    const { data: user } = await supabase
      .from('users')
      .select('current_level, streak_days, total_xp')
      .eq('id', userId)
      .single();

    // Get progress per content type
    const contentTypes = ['hiragana', 'katakana', 'kanji', 'vocabulary', 'grammar'];
    const progressByType: Record<string, any> = {};

    for (const type of contentTypes) {
      const { data: progress, count } = await supabase
        .from('user_progress')
        .select('mastery_level', { count: 'exact' })
        .eq('user_id', userId)
        .eq('content_type', type);

      // Get total content count
      const { count: totalCount } = await supabase
        .from(type)
        .select('id', { count: 'exact' });

      const learned = count || 0;
      const total = totalCount || 0;
      const avgMastery = progress?.length
        ? Math.round(
            progress.reduce((sum, p) => sum + p.mastery_level, 0) / progress.length
          )
        : 0;

      progressByType[type] = {
        learned,
        total,
        percentage: total > 0 ? Math.round((learned / total) * 100) : 0,
        average_mastery: avgMastery,
      };
    }

    // Get JLPT level progress
    const jlptProgress = await getJLPTProgress(userId);

    return {
      data: successResponse({
        user: {
          current_level: user?.current_level || 'N5',
          streak_days: user?.streak_days || 0,
          total_xp: user?.total_xp || 0,
        },
        content_progress: progressByType,
        jlpt_progress: jlptProgress,
      }),
      status: 200,
    };
  } catch (error) {
    console.error('Get user progress error:', error);
    return { error: errorResponse('Failed to get progress', 'FETCH_ERROR'), status: 500 };
  }
}

/**
 * Get progress for specific content type and ID
 */
export async function getContentProgress(
  userId: string,
  contentType: string,
  contentId: number
) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return { error: errorResponse('Failed to get progress', 'FETCH_ERROR'), status: 500 };
  }

  return {
    data: successResponse(
      data || {
        mastery_level: 0,
        review_count: 0,
        correct_count: 0,
        learned: false,
      }
    ),
    status: 200,
  };
}

/**
 * Update progress for a content item
 */
export async function updateProgress(
  userId: string,
  contentType: string,
  contentId: number,
  options: {
    mastery_delta?: number;
    correct?: boolean;
  }
) {
  try {
    // Get existing progress
    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single();

    let newMastery = existing?.mastery_level || 0;
    let reviewCount = existing?.review_count || 0;
    let correctCount = existing?.correct_count || 0;

    // Update values
    reviewCount += 1;
    if (options.correct) {
      correctCount += 1;
      newMastery = Math.min(100, newMastery + (options.mastery_delta || 10));
    } else if (options.correct === false) {
      newMastery = Math.max(0, newMastery - (options.mastery_delta || 5));
    }

    if (existing) {
      // Update existing progress
      const { data, error } = await supabase
        .from('user_progress')
        .update({
          mastery_level: newMastery,
          review_count: reviewCount,
          correct_count: correctCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      // Check achievements
      await checkMasteryAchievements(userId);

      return { data: successResponse(data), status: 200 };
    } else {
      // Create new progress
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          content_type: contentType,
          content_id: contentId,
          mastery_level: newMastery,
          review_count: 1,
          correct_count: options.correct ? 1 : 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Update streak
      await updateStreak(userId);

      return { data: successResponse(data), status: 201 };
    }
  } catch (error) {
    console.error('Update progress error:', error);
    return { error: errorResponse('Failed to update progress', 'UPDATE_ERROR'), status: 500 };
  }
}

/**
 * Get daily progress summary
 */
export async function getDailyProgress(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayProgress } = await supabase
    .from('user_progress')
    .select('content_type, mastery_level')
    .eq('user_id', userId)
    .gte('updated_at', today.toISOString());

  // Count by type
  const summary = (todayProgress || []).reduce((acc, p) => {
    acc[p.content_type] = (acc[p.content_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    data: successResponse({
      date: today.toISOString().split('T')[0],
      items_studied: todayProgress?.length || 0,
      by_type: summary,
    }),
    status: 200,
  };
}

/**
 * Get weekly progress summary
 */
export async function getWeeklyProgress(userId: string) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: weeklyProgress } = await supabase
    .from('user_progress')
    .select('content_type, mastery_level, updated_at')
    .eq('user_id', userId)
    .gte('updated_at', weekAgo.toISOString());

  // Group by day
  const byDay = (weeklyProgress || []).reduce((acc, p) => {
    const day = p.updated_at.split('T')[0];
    if (!acc[day]) {
      acc[day] = { items: 0, types: {} };
    }
    acc[day].items += 1;
    acc[day].types[p.content_type] = (acc[day].types[p.content_type] || 0) + 1;
    return acc;
  }, {} as Record<string, { items: number; types: Record<string, number> }>);

  return {
    data: successResponse({
      start_date: weekAgo.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      total_items: weeklyProgress?.length || 0,
      by_day: byDay,
    }),
    status: 200,
  };
}

// ==================== Helpers ====================

/**
 * Get JLPT level progress
 */
async function getJLPTProgress(userId: string) {
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const progress: Record<string, any> = {};

  for (const level of levels) {
    // Get kanji progress for level
    const { count: kanjiLearned } = await supabase
      .from('user_progress')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('content_type', 'kanji')
      .gte('mastery_level', 60); // Consider "learned" if mastery >= 60%

    const { count: kanjiTotal } = await supabase
      .from('kanji')
      .select('id', { count: 'exact' })
      .eq('level', level);

    // Get vocabulary progress
    const { count: vocabLearned } = await supabase
      .from('user_progress')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('content_type', 'vocabulary')
      .gte('mastery_level', 60);

    const { count: vocabTotal } = await supabase
      .from('vocabulary')
      .select('id', { count: 'exact' })
      .eq('level', level);

    // Get grammar progress
    const { count: grammarLearned } = await supabase
      .from('user_progress')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('content_type', 'grammar')
      .gte('mastery_level', 60);

    const { count: grammarTotal } = await supabase
      .from('grammar')
      .select('id', { count: 'exact' })
      .eq('level', level);

    const totalLearned = (kanjiLearned || 0) + (vocabLearned || 0) + (grammarLearned || 0);
    const totalItems = (kanjiTotal || 0) + (vocabTotal || 0) + (grammarTotal || 0);

    progress[level] = {
      kanji: { learned: kanjiLearned || 0, total: kanjiTotal || 0 },
      vocabulary: { learned: vocabLearned || 0, total: vocabTotal || 0 },
      grammar: { learned: grammarLearned || 0, total: grammarTotal || 0 },
      total: { learned: totalLearned, total: totalItems },
      percentage: totalItems > 0 ? Math.round((totalLearned / totalItems) * 100) : 0,
    };
  }

  return progress;
}

/**
 * Check and award mastery achievements
 */
async function checkMasteryAchievements(userId: string) {
  const { count: masteredCount } = await supabase
    .from('user_progress')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .gte('mastery_level', 100);

  await checkAchievements([
    { userId, type: 'mastery', value: masteredCount || 0 },
  ]);
}
