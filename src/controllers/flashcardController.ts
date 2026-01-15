import { supabase } from '../config/supabase';
import { successResponse, errorResponse } from '../utils/response';
import * as srsService from '../services/srsService';

/**
 * Get next flashcard to review
 */
export async function getNextFlashcard(userId: string, contentType?: string) {
  try {
    const card = await srsService.getNextCard(userId, contentType);

    if (!card) {
      return {
        data: successResponse(null, 'No cards due for review'),
        status: 200,
      };
    }

    // Get the actual content
    const content = await getContentById(card.content_type, card.content_id);

    return {
      data: successResponse({
        review: card,
        content,
      }),
      status: 200,
    };
  } catch (error) {
    console.error('Get next flashcard error:', error);
    return { error: errorResponse('Failed to get flashcard', 'FETCH_ERROR'), status: 500 };
  }
}

/**
 * Get all due flashcards
 */
export async function getDueFlashcards(
  userId: string,
  contentType?: string,
  limit: number = 20
) {
  try {
    const cards = await srsService.getDueCards(userId, contentType, limit);

    // Get content for each card
    const cardsWithContent = await Promise.all(
      cards.map(async (card) => {
        const content = await getContentById(card.content_type, card.content_id);
        return {
          review: card,
          content,
        };
      })
    );

    return { data: successResponse(cardsWithContent), status: 200 };
  } catch (error) {
    console.error('Get due flashcards error:', error);
    return { error: errorResponse('Failed to get due flashcards', 'FETCH_ERROR'), status: 500 };
  }
}

/**
 * Submit flashcard review result
 */
export async function submitReview(
  userId: string,
  contentType: string,
  contentId: number,
  result: 'again' | 'hard' | 'good' | 'easy'
) {
  try {
    const updatedCard = await srsService.recordReview(
      userId,
      contentType,
      contentId,
      result
    );

    // Update user's streak
    const { updateStreak } = await import('../services/achievementService');
    await updateStreak(userId);

    return {
      data: successResponse(updatedCard, 'Review submitted'),
      status: 200,
    };
  } catch (error) {
    console.error('Submit review error:', error);
    return { error: errorResponse('Failed to submit review', 'SUBMIT_ERROR'), status: 500 };
  }
}

/**
 * Get SRS statistics
 */
export async function getSRSStats(userId: string) {
  try {
    const stats = await srsService.getSRSStats(userId);
    return { data: successResponse(stats), status: 200 };
  } catch (error) {
    console.error('Get SRS stats error:', error);
    return { error: errorResponse('Failed to get stats', 'FETCH_ERROR'), status: 500 };
  }
}

/**
 * Add content to flashcards
 */
export async function addToFlashcards(
  userId: string,
  contentType: string,
  contentIds: number[]
) {
  try {
    const cards = await srsService.addToFlashcards(userId, contentType, contentIds);
    return {
      data: successResponse(cards, `${cards?.length || 0} cards added`),
      status: 201,
    };
  } catch (error) {
    console.error('Add to flashcards error:', error);
    return { error: errorResponse('Failed to add flashcards', 'CREATE_ERROR'), status: 500 };
  }
}

/**
 * Get user's flashcard decks
 */
export async function getUserDecks(userId: string) {
  const { data, error } = await supabase
    .from('flashcard_decks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: errorResponse('Failed to get decks', 'FETCH_ERROR'), status: 500 };
  }

  return { data: successResponse(data || []), status: 200 };
}

/**
 * Create flashcard deck
 */
export async function createDeck(
  userId: string,
  name: string,
  description?: string,
  contentType?: string,
  level?: string
) {
  const { data, error } = await supabase
    .from('flashcard_decks')
    .insert({
      user_id: userId,
      name,
      description,
      content_type: contentType,
      level,
      card_count: 0,
    })
    .select()
    .single();

  if (error) {
    return { error: errorResponse('Failed to create deck', 'CREATE_ERROR'), status: 500 };
  }

  return { data: successResponse(data, 'Deck created'), status: 201 };
}

// ==================== Helper ====================

/**
 * Get content by type and ID
 */
async function getContentById(contentType: string, contentId: number) {
  const tableMap: Record<string, string> = {
    hiragana: 'hiragana',
    katakana: 'katakana',
    kanji: 'kanji',
    vocabulary: 'vocabulary',
    grammar: 'grammar',
  };

  const tableName = tableMap[contentType];
  if (!tableName) return null;

  const { data } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', contentId)
    .single();

  return data;
}
