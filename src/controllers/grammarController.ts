import { supabase } from '../config/supabase';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import type { Grammar } from '../models/types';

/**
 * Get all grammar with pagination and filters
 */
export async function getAllGrammar(
  level?: string,
  page?: string | number,
  limit?: string | number
) {
  const { page: parsedPage, limit: parsedLimit, offset } = parsePagination(page, limit);

  let query = supabase
    .from('grammar')
    .select('*', { count: 'exact' })
    .order('id', { ascending: true });

  if (level) {
    query = query.eq('level', level);
  }

  const { data, error, count } = await query.range(offset, offset + parsedLimit - 1);

  if (error) {
    return { error: errorResponse('Failed to fetch grammar', 'FETCH_ERROR'), status: 500 };
  }

  return {
    data: paginatedResponse(data || [], parsedPage, parsedLimit, count || 0),
    status: 200,
  };
}

/**
 * Get grammar by ID
 */
export async function getGrammarById(id: number) {
  const { data, error } = await supabase
    .from('grammar')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return { error: errorResponse('Grammar not found', 'NOT_FOUND'), status: 404 };
  }

  // Get related grammar if exists
  if (data.related_grammar && data.related_grammar.length > 0) {
    const { data: related } = await supabase
      .from('grammar')
      .select('id, pattern, meaning, level')
      .in('id', data.related_grammar);

    return {
      data: successResponse({
        ...data,
        related: related || [],
      }),
      status: 200,
    };
  }

  return { data: successResponse(data), status: 200 };
}

/**
 * Search grammar
 */
export async function searchGrammar(
  query: string,
  page?: string | number,
  limit?: string | number
) {
  const { page: parsedPage, limit: parsedLimit, offset } = parsePagination(page, limit);

  const { data, error, count } = await supabase
    .from('grammar')
    .select('*', { count: 'exact' })
    .or(`pattern.ilike.%${query}%,meaning.ilike.%${query}%,explanation.ilike.%${query}%`)
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
 * Get grammar stats per level
 */
export async function getGrammarStats() {
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const stats: Record<string, number> = {};

  for (const level of levels) {
    const { count } = await supabase
      .from('grammar')
      .select('id', { count: 'exact' })
      .eq('level', level);

    stats[level] = count || 0;
  }

  return { data: successResponse(stats), status: 200 };
}

// ==================== Admin Functions ====================

/**
 * Create grammar (Admin)
 */
export async function createGrammar(
  grammar: Omit<Grammar, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('grammar')
    .insert(grammar)
    .select()
    .single();

  if (error) {
    return { error: errorResponse('Failed to create grammar', 'CREATE_ERROR'), status: 500 };
  }

  return { data: successResponse(data, 'Grammar created'), status: 201 };
}

/**
 * Update grammar (Admin)
 */
export async function updateGrammar(
  id: number,
  updates: Partial<Omit<Grammar, 'id' | 'created_at' | 'updated_at'>>
) {
  const { data, error } = await supabase
    .from('grammar')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: errorResponse('Failed to update grammar', 'UPDATE_ERROR'), status: 500 };
  }

  if (!data) {
    return { error: errorResponse('Grammar not found', 'NOT_FOUND'), status: 404 };
  }

  return { data: successResponse(data, 'Grammar updated'), status: 200 };
}

/**
 * Delete grammar (Admin)
 */
export async function deleteGrammar(id: number) {
  const { error } = await supabase
    .from('grammar')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: errorResponse('Failed to delete grammar', 'DELETE_ERROR'), status: 500 };
  }

  return { data: successResponse(null, 'Grammar deleted'), status: 200 };
}
