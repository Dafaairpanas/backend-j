import { supabase } from '../config/supabase';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import type { Hiragana } from '../models/types';

/**
 * Get all hiragana characters
 */
export async function getAllHiragana(type?: string) {
  let query = supabase
    .from('hiragana')
    .select('*')
    .order('order_index', { ascending: true });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    return { error: errorResponse('Failed to fetch hiragana', 'FETCH_ERROR'), status: 500 };
  }

  return { data: successResponse(data || []), status: 200 };
}

/**
 * Get hiragana by ID
 */
export async function getHiraganaById(id: number) {
  const { data, error } = await supabase
    .from('hiragana')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return { error: errorResponse('Hiragana not found', 'NOT_FOUND'), status: 404 };
  }

  return { data: successResponse(data), status: 200 };
}

/**
 * Get hiragana grouped by type
 */
export async function getHiraganaGrouped() {
  const { data, error } = await supabase
    .from('hiragana')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    return { error: errorResponse('Failed to fetch hiragana', 'FETCH_ERROR'), status: 500 };
  }

  // Group by type
  const grouped = (data || []).reduce((acc, char) => {
    const type = char.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(char);
    return acc;
  }, {} as Record<string, Hiragana[]>);

  return {
    data: successResponse({
      basic: grouped.basic || [],
      dakuon: grouped.dakuon || [],
      handakuon: grouped.handakuon || [],
      yoon: grouped.yoon || [],
    }),
    status: 200,
  };
}

// ==================== Admin Functions ====================

/**
 * Create hiragana character (Admin)
 */
export async function createHiragana(hiragana: Omit<Hiragana, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('hiragana')
    .insert(hiragana)
    .select()
    .single();

  if (error) {
    return { error: errorResponse('Failed to create hiragana', 'CREATE_ERROR'), status: 500 };
  }

  return { data: successResponse(data, 'Hiragana created'), status: 201 };
}

/**
 * Update hiragana character (Admin)
 */
export async function updateHiragana(
  id: number,
  updates: Partial<Omit<Hiragana, 'id' | 'created_at' | 'updated_at'>>
) {
  const { data, error } = await supabase
    .from('hiragana')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: errorResponse('Failed to update hiragana', 'UPDATE_ERROR'), status: 500 };
  }

  if (!data) {
    return { error: errorResponse('Hiragana not found', 'NOT_FOUND'), status: 404 };
  }

  return { data: successResponse(data, 'Hiragana updated'), status: 200 };
}

/**
 * Delete hiragana character (Admin)
 */
export async function deleteHiragana(id: number) {
  const { error } = await supabase
    .from('hiragana')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: errorResponse('Failed to delete hiragana', 'DELETE_ERROR'), status: 500 };
  }

  return { data: successResponse(null, 'Hiragana deleted'), status: 200 };
}
