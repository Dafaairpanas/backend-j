import { supabase } from '../config/supabase';
import { successResponse, errorResponse } from '../utils/response';
import type { Katakana } from '../models/types';

/**
 * Get all katakana characters
 */
export async function getAllKatakana(type?: string) {
  let query = supabase
    .from('katakana')
    .select('*')
    .order('order_index', { ascending: true });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    return { error: errorResponse('Failed to fetch katakana', 'FETCH_ERROR'), status: 500 };
  }

  return { data: successResponse(data || []), status: 200 };
}

/**
 * Get katakana by ID
 */
export async function getKatakanaById(id: number) {
  const { data, error } = await supabase
    .from('katakana')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return { error: errorResponse('Katakana not found', 'NOT_FOUND'), status: 404 };
  }

  return { data: successResponse(data), status: 200 };
}

/**
 * Get katakana grouped by type
 */
export async function getKatakanaGrouped() {
  const { data, error } = await supabase
    .from('katakana')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    return { error: errorResponse('Failed to fetch katakana', 'FETCH_ERROR'), status: 500 };
  }

  // Group by type
  const grouped = (data || []).reduce((acc, char) => {
    const type = char.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(char);
    return acc;
  }, {} as Record<string, Katakana[]>);

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
 * Create katakana character (Admin)
 */
export async function createKatakana(katakana: Omit<Katakana, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('katakana')
    .insert(katakana)
    .select()
    .single();

  if (error) {
    return { error: errorResponse('Failed to create katakana', 'CREATE_ERROR'), status: 500 };
  }

  return { data: successResponse(data, 'Katakana created'), status: 201 };
}

/**
 * Update katakana character (Admin)
 */
export async function updateKatakana(
  id: number,
  updates: Partial<Omit<Katakana, 'id' | 'created_at' | 'updated_at'>>
) {
  const { data, error } = await supabase
    .from('katakana')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: errorResponse('Failed to update katakana', 'UPDATE_ERROR'), status: 500 };
  }

  if (!data) {
    return { error: errorResponse('Katakana not found', 'NOT_FOUND'), status: 404 };
  }

  return { data: successResponse(data, 'Katakana updated'), status: 200 };
}

/**
 * Delete katakana character (Admin)
 */
export async function deleteKatakana(id: number) {
  const { error } = await supabase
    .from('katakana')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: errorResponse('Failed to delete katakana', 'DELETE_ERROR'), status: 500 };
  }

  return { data: successResponse(null, 'Katakana deleted'), status: 200 };
}
