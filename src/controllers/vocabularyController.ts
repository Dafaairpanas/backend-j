import { supabase } from '../config/supabase';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import type { Vocabulary } from '../models/types';

/**
 * Get all vocabulary with pagination and filters
 */
export async function getAllVocabulary(
  level?: string,
  category?: string,
  page?: string | number,
  limit?: string | number
) {
  const { page: parsedPage, limit: parsedLimit, offset } = parsePagination(page, limit);

  let query = supabase
    .from('vocabulary')
    .select('*', { count: 'exact' })
    .order('id', { ascending: true });

  if (level) {
    query = query.eq('level', level);
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error, count } = await query.range(offset, offset + parsedLimit - 1);

  if (error) {
    return { error: errorResponse('Failed to fetch vocabulary', 'FETCH_ERROR'), status: 500 };
  }

  return {
    data: paginatedResponse(data || [], parsedPage, parsedLimit, count || 0),
    status: 200,
  };
}

/**
 * Get vocabulary by ID
 */
export async function getVocabularyById(id: number) {
  const { data, error } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return { error: errorResponse('Vocabulary not found', 'NOT_FOUND'), status: 404 };
  }

  return { data: successResponse(data), status: 200 };
}

/**
 * Search vocabulary
 */
export async function searchVocabulary(
  query: string,
  page?: string | number,
  limit?: string | number
) {
  const { page: parsedPage, limit: parsedLimit, offset } = parsePagination(page, limit);

  const { data, error, count } = await supabase
    .from('vocabulary')
    .select('*', { count: 'exact' })
    .or(`word.ilike.%${query}%,reading.ilike.%${query}%,meaning.ilike.%${query}%`)
    .order('id', { ascending: true })
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
 * Get vocabulary categories
 */
export async function getVocabularyCategories() {
  const { data, error } = await supabase
    .from('vocabulary')
    .select('category')
    .not('category', 'is', null);

  if (error) {
    return { error: errorResponse('Failed to fetch categories', 'FETCH_ERROR'), status: 500 };
  }

  // Get unique categories with count
  const categoryCounts = (data || []).reduce((acc, item) => {
    if (item.category) {
      acc[item.category] = (acc[item.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }));

  return { data: successResponse(categories), status: 200 };
}

// ==================== Admin Functions ====================

/**
 * Create vocabulary (Admin)
 */
export async function createVocabulary(
  vocab: Omit<Vocabulary, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('vocabulary')
    .insert(vocab)
    .select()
    .single();

  if (error) {
    return { error: errorResponse('Failed to create vocabulary', 'CREATE_ERROR'), status: 500 };
  }

  return { data: successResponse(data, 'Vocabulary created'), status: 201 };
}

/**
 * Update vocabulary (Admin)
 */
export async function updateVocabulary(
  id: number,
  updates: Partial<Omit<Vocabulary, 'id' | 'created_at' | 'updated_at'>>
) {
  const { data, error } = await supabase
    .from('vocabulary')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: errorResponse('Failed to update vocabulary', 'UPDATE_ERROR'), status: 500 };
  }

  if (!data) {
    return { error: errorResponse('Vocabulary not found', 'NOT_FOUND'), status: 404 };
  }

  return { data: successResponse(data, 'Vocabulary updated'), status: 200 };
}

/**
 * Delete vocabulary (Admin)
 */
export async function deleteVocabulary(id: number) {
  const { error } = await supabase
    .from('vocabulary')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: errorResponse('Failed to delete vocabulary', 'DELETE_ERROR'), status: 500 };
  }

  return { data: successResponse(null, 'Vocabulary deleted'), status: 200 };
}

/**
 * Bulk create vocabulary (Admin)
 */
export async function bulkCreateVocabulary(
  vocabList: Omit<Vocabulary, 'id' | 'created_at' | 'updated_at'>[]
) {
  const { data, error } = await supabase
    .from('vocabulary')
    .insert(vocabList)
    .select();

  if (error) {
    return { error: errorResponse('Failed to create vocabulary', 'CREATE_ERROR'), status: 500 };
  }

  return { data: successResponse(data, `${data?.length || 0} vocabulary created`), status: 201 };
}
