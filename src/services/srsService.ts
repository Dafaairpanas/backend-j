import { supabase } from '../config/supabase';
import { SRS_CONFIG } from '../config/constants';
import type { FlashcardReview } from '../models/types';

/**
 * SM-2 Spaced Repetition Algorithm Implementation
 *
 * This service handles the scheduling of flashcard reviews based on user performance.
 * Uses a modified SM-2 algorithm (SuperMemo 2) for optimal retention.
 */

export interface SRSUpdate {
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_at: string;
}

/**
 * Calculate the next review date based on SM-2 algorithm
 *
 * @param currentCard - Current card state (or null for new cards)
 * @param result - User's answer quality: 'again' | 'hard' | 'good' | 'easy'
 * @returns Updated SRS parameters
 */
export function calculateNextReview(
  currentCard: Partial<FlashcardReview> | null,
  result: 'again' | 'hard' | 'good' | 'easy'
): SRSUpdate {
  // Default values for new cards
  let easeFactor = currentCard?.ease_factor ?? SRS_CONFIG.initialEaseFactor;
  let interval = currentCard?.interval ?? 0;
  let repetitions = currentCard?.repetitions ?? 0;

  // Quality maps to SM-2 quality (0-5 scale)
  const qualityMap = {
    again: 0, // Complete failure
    hard: 2, // Correct with difficulty
    good: 3, // Correct with effort
    easy: 5, // Perfect recall
  };

  const quality = qualityMap[result];

  if (quality < 3) {
    // Failed - reset to beginning
    repetitions = 0;
    interval = 1; // Review again tomorrow

    // Decrease ease factor on failure
    if (result === 'again') {
      easeFactor = Math.max(SRS_CONFIG.minEaseFactor, easeFactor - 0.2);
    }
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = 1; // First success: 1 day
    } else if (repetitions === 1) {
      interval = 6; // Second success: 6 days
    } else {
      // Subsequent successes: multiply by ease factor
      interval = Math.round(interval * easeFactor * SRS_CONFIG.intervalModifier);
    }

    repetitions += 1;

    // Adjust ease factor based on quality
    easeFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Apply easy bonus
    if (result === 'easy') {
      interval = Math.round(interval * SRS_CONFIG.easyBonus);
    }
  }

  // Ensure ease factor stays within bounds
  easeFactor = Math.max(SRS_CONFIG.minEaseFactor, easeFactor);

  // Cap interval at max
  interval = Math.min(interval, SRS_CONFIG.maxInterval);

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    ease_factor: easeFactor,
    interval,
    repetitions,
    next_review_at: nextReview.toISOString(),
  };
}

/**
 * Get cards due for review for a user
 */
export async function getDueCards(
  userId: string,
  contentType?: string,
  limit: number = 20
) {
  let query = supabase
    .from('flashcard_reviews')
    .select('*')
    .eq('user_id', userId)
    .lte('next_review_at', new Date().toISOString())
    .order('next_review_at', { ascending: true })
    .limit(limit);

  if (contentType) {
    query = query.eq('content_type', contentType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get the next card to review (oldest due card)
 */
export async function getNextCard(userId: string, contentType?: string) {
  const cards = await getDueCards(userId, contentType, 1);
  return cards[0] || null;
}

/**
 * Record a review result and update the card
 */
export async function recordReview(
  userId: string,
  contentType: string,
  contentId: number,
  result: 'again' | 'hard' | 'good' | 'easy'
) {
  // Get current card state
  const { data: existingCard } = await supabase
    .from('flashcard_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .single();

  const update = calculateNextReview(existingCard, result);

  if (existingCard) {
    // Update existing card
    const { data, error } = await supabase
      .from('flashcard_reviews')
      .update({
        ...update,
        last_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingCard.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new card
    const { data, error } = await supabase
      .from('flashcard_reviews')
      .insert({
        user_id: userId,
        content_type: contentType,
        content_id: contentId,
        ...update,
        last_reviewed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * Get SRS statistics for a user
 */
export async function getSRSStats(userId: string) {
  const now = new Date().toISOString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString();

  const [dueNow, dueTomorrow, totalCards] = await Promise.all([
    supabase
      .from('flashcard_reviews')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .lte('next_review_at', now),

    supabase
      .from('flashcard_reviews')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gt('next_review_at', now)
      .lte('next_review_at', tomorrowStr),

    supabase
      .from('flashcard_reviews')
      .select('id', { count: 'exact' })
      .eq('user_id', userId),
  ]);

  return {
    due_now: dueNow.count || 0,
    due_tomorrow: dueTomorrow.count || 0,
    total_cards: totalCards.count || 0,
  };
}

/**
 * Add content items to user's flashcard deck
 */
export async function addToFlashcards(
  userId: string,
  contentType: string,
  contentIds: number[]
) {
  const cardsToInsert = contentIds.map((contentId) => ({
    user_id: userId,
    content_type: contentType,
    content_id: contentId,
    ease_factor: SRS_CONFIG.initialEaseFactor,
    interval: SRS_CONFIG.initialInterval,
    repetitions: 0,
    next_review_at: new Date().toISOString(), // Due immediately
  }));

  const { data, error } = await supabase
    .from('flashcard_reviews')
    .upsert(cardsToInsert, {
      onConflict: 'user_id,content_type,content_id',
      ignoreDuplicates: true,
    })
    .select();

  if (error) throw error;
  return data;
}
