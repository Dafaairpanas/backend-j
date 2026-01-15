import { supabase } from '../config/supabase';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { parsePagination, getPaginationMeta } from '../utils/pagination';
import type { Kanji } from '../models/types';

/**
 * Get all kanji with pagination and filters
 */
export async function getAllKanji(
  level?: string,
  page?: string | number,
  limit?: string | number
) {
  const { page: parsedPage, limit: parsedLimit, offset } = parsePagination(page, limit);

  let query = supabase
    .from('kanji')
    .select('*', { count: 'exact' })
    .order('jlpt_order', { ascending: true });

  if (level) {
    query = query.eq('level', level);
  }

  const { data, error, count } = await query.range(offset, offset + parsedLimit - 1);

  if (error) {
    return { error: errorResponse('Failed to fetch kanji', 'FETCH_ERROR'), status: 500 };
  }

  return {
    data: paginatedResponse(data || [], parsedPage, parsedLimit, count || 0),
    status: 200,
  };
}

/**
 * Get kanji by ID
 */
export async function getKanjiById(id: number) {
  const { data, error } = await supabase
    .from('kanji')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return { error: errorResponse('Kanji not found', 'NOT_FOUND'), status: 404 };
  }

  return { data: successResponse(data), status: 200 };
}

/**
 * Search kanji by character or meaning
 */
export async function searchKanji(
  query: string,
  page?: string | number,
  limit?: string | number
) {
  const { page: parsedPage, limit: parsedLimit, offset } = parsePagination(page, limit);

  const { data, error, count } = await supabase
    .from('kanji')
    .select('*', { count: 'exact' })
    .or(`character.ilike.%${query}%,meaning.ilike.%${query}%,kunyomi.ilike.%${query}%,onyomi.ilike.%${query}%`)
    .order('jlpt_order', { ascending: true })
    .range(offset, offset + parsedLimit - 1);

  if (error) {
    return { error: errorResponse('Search failed', 'SEARCH_ERROR'), status: 500 };
  }

  return {
    data: paginatedResponse(data || [], parsedPage, parsedLimit, count || 0),
    status: 200,
  };
}

/**
 * Get kanji statistics per level
 */
export async function getKanjiStats() {
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const stats: Record<string, number> = {};

  for (const level of levels) {
    const { count } = await supabase
      .from('kanji')
      .select('id', { count: 'exact' })
      .eq('level', level);

    stats[level] = count || 0;
  }

  return { data: successResponse(stats), status: 200 };
}

// ==================== Admin Functions ====================

/**
 * Create kanji (Admin)
 */
export async function createKanji(kanji: Omit<Kanji, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('kanji')
    .insert(kanji)
    .select()
    .single();

  if (error) {
    return { error: errorResponse('Failed to create kanji', 'CREATE_ERROR'), status: 500 };
  }

  return { data: successResponse(data, 'Kanji created'), status: 201 };
}

/**
 * Update kanji (Admin)
 */
export async function updateKanji(
  id: number,
  updates: Partial<Omit<Kanji, 'id' | 'created_at' | 'updated_at'>>
) {
  const { data, error } = await supabase
    .from('kanji')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: errorResponse('Failed to update kanji', 'UPDATE_ERROR'), status: 500 };
  }

  if (!data) {
    return { error: errorResponse('Kanji not found', 'NOT_FOUND'), status: 404 };
  }

  return { data: successResponse(data, 'Kanji updated'), status: 200 };
}

/**
 * Delete kanji (Admin)
 */
export async function deleteKanji(id: number) {
  const { error } = await supabase
    .from('kanji')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: errorResponse('Failed to delete kanji', 'DELETE_ERROR'), status: 500 };
  }

  return { data: successResponse(null, 'Kanji deleted'), status: 200 };
}

/**
 * Bulk create kanji (Admin)
 */
export async function bulkCreateKanji(kanjiList: Omit<Kanji, 'id' | 'created_at' | 'updated_at'>[]) {
  const { data, error } = await supabase
    .from('kanji')
    .insert(kanjiList)
    .select();

  if (error) {
    return { error: errorResponse('Failed to create kanji', 'CREATE_ERROR'), status: 500 };
  }

  return { data: successResponse(data, `${data?.length || 0} kanji created`), status: 201 };
}
