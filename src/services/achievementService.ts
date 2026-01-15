import { supabase } from '../config/supabase';

/**
 * Achievement Service - Handles user achievements and rewards
 */

interface AchievementCheck {
  userId: string;
  type: string;
  value: number;
}

/**
 * Check and unlock achievements based on user activity
 */
export async function checkAchievements(checks: AchievementCheck[]) {
  const unlockedAchievements: any[] = [];

  for (const check of checks) {
    const unlocked = await checkAndUnlock(check);
    if (unlocked.length > 0) {
      unlockedAchievements.push(...unlocked);
    }
  }

  return unlockedAchievements;
}

/**
 * Check specific achievement criteria
 */
async function checkAndUnlock({ userId, type, value }: AchievementCheck) {
  // Get achievements that match the criteria
  const { data: achievements, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('requirement_type', type)
    .lte('requirement_value', value);

  if (error || !achievements) return [];

  const unlocked: any[] = [];

  for (const achievement of achievements) {
    // Check if already unlocked
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievement.id)
      .single();

    if (!existing) {
      // Unlock achievement
      const { data: userAchievement, error: unlockError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
        })
        .select(`
          *,
          achievement:achievements(*)
        `)
        .single();

      if (!unlockError && userAchievement) {
        unlocked.push(userAchievement);

        // Award XP
        await awardXP(userId, achievement.xp_reward);
      }
    }
  }

  return unlocked;
}

/**
 * Award XP to user
 */
export async function awardXP(userId: string, amount: number) {
  const { error } = await supabase.rpc('increment_user_xp', {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) {
    // Fallback: manual update if RPC doesn't exist
    const { data: user } = await supabase
      .from('users')
      .select('total_xp')
      .eq('id', userId)
      .single();

    if (user) {
      await supabase
        .from('users')
        .update({ total_xp: (user.total_xp || 0) + amount })
        .eq('id', userId);
    }
  }
}

/**
 * Get user's achievements
 */
export async function getUserAchievements(userId: string) {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) throw error;

  return data || [];
}

/**
 * Get all achievements with user progress
 */
export async function getAllAchievements(userId?: string) {
  const { data: achievements, error } = await supabase
    .from('achievements')
    .select('*')
    .order('category', { ascending: true })
    .order('requirement_value', { ascending: true });

  if (error) throw error;

  if (!userId) {
    return achievements?.map((a) => ({ ...a, unlocked: false })) || [];
  }

  // Get user's unlocked achievements
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const unlockedIds = new Set(userAchievements?.map((ua) => ua.achievement_id) || []);

  return (
    achievements?.map((a) => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
    })) || []
  );
}

/**
 * Update user streak
 */
export async function updateStreak(userId: string) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('streak_days, last_activity_at')
    .eq('id', userId)
    .single();

  if (userError || !user) return;

  const now = new Date();
  const lastActivity = user.last_activity_at
    ? new Date(user.last_activity_at)
    : null;

  let newStreak = user.streak_days || 0;

  if (!lastActivity) {
    // First activity
    newStreak = 1;
  } else {
    const daysDiff = Math.floor(
      (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Same day, no change
    } else if (daysDiff === 1) {
      // Consecutive day
      newStreak += 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  }

  await supabase
    .from('users')
    .update({
      streak_days: newStreak,
      last_activity_at: now.toISOString(),
    })
    .eq('id', userId);

  // Check streak achievements
  await checkAchievements([
    { userId, type: 'streak', value: newStreak },
  ]);

  return newStreak;
}
