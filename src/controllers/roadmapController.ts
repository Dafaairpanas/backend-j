import { supabase } from '../config/supabase';
import { successResponse, errorResponse } from '../utils/response';
import type { RoadmapStage } from '../models/types';

/**
 * Get roadmap for a specific JLPT level
 */
export async function getRoadmap(level: string) {
  const { data, error } = await supabase
    .from('roadmap_stages')
    .select('*')
    .eq('level', level)
    .order('order_index', { ascending: true });

  if (error) {
    return { error: errorResponse('Failed to fetch roadmap', 'FETCH_ERROR'), status: 500 };
  }

  return { data: successResponse(data || []), status: 200 };
}

/**
 * Get roadmap with user progress
 */
export async function getRoadmapWithProgress(level: string, userId: string) {
  // Get roadmap stages
  const { data: stages, error } = await supabase
    .from('roadmap_stages')
    .select('*')
    .eq('level', level)
    .order('order_index', { ascending: true });

  if (error) {
    return { error: errorResponse('Failed to fetch roadmap', 'FETCH_ERROR'), status: 500 };
  }

  if (!stages || stages.length === 0) {
    return { data: successResponse([]), status: 200 };
  }

  // Get user progress for each stage
  const { data: userProgress } = await supabase
    .from('user_roadmap_progress')
    .select('*')
    .eq('user_id', userId)
    .in('stage_id', stages.map((s) => s.id));

  const progressMap = new Map(
    (userProgress || []).map((p) => [p.stage_id, p])
  );

  // Combine stages with progress
  const stagesWithProgress = stages.map((stage, index) => {
    const progress = progressMap.get(stage.id);

    // Determine status
    let status = 'locked';
    if (progress) {
      status = progress.status;
    } else if (index === 0) {
      // First stage is always unlocked
      status = 'in_progress';
    } else {
      // Check if previous stage is completed
      const prevProgress = progressMap.get(stages[index - 1].id);
      if (prevProgress?.status === 'completed') {
        status = 'in_progress';
      }
    }

    return {
      ...stage,
      user_progress: {
        status,
        progress_percentage: progress?.progress_percentage || 0,
        started_at: progress?.started_at,
        completed_at: progress?.completed_at,
      },
    };
  });

  return { data: successResponse(stagesWithProgress), status: 200 };
}

/**
 * Get specific stage details
 */
export async function getStageDetails(stageId: number, userId?: string) {
  const { data: stage, error } = await supabase
    .from('roadmap_stages')
    .select('*')
    .eq('id', stageId)
    .single();

  if (error || !stage) {
    return { error: errorResponse('Stage not found', 'NOT_FOUND'), status: 404 };
  }

  // Get content items for this stage
  const contentItems: Record<string, any[]> = {};

  if (stage.content_requirements) {
    for (const req of stage.content_requirements) {
      if (req.ids && req.ids.length > 0) {
        const { data } = await supabase
          .from(req.type)
          .select('*')
          .in('id', req.ids);

        contentItems[req.type] = data || [];
      }
    }
  }

  // Get user progress if userId provided
  let userProgress = null;
  if (userId) {
    const { data } = await supabase
      .from('user_roadmap_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('stage_id', stageId)
      .single();

    userProgress = data;
  }

  return {
    data: successResponse({
      stage,
      content_items: contentItems,
      user_progress: userProgress,
    }),
    status: 200,
  };
}

/**
 * Update user's roadmap progress
 */
export async function updateRoadmapProgress(
  userId: string,
  stageId: number,
  progressPercentage: number
) {
  try {
    // Check if progress exists
    const { data: existing } = await supabase
      .from('user_roadmap_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('stage_id', stageId)
      .single();

    const status =
      progressPercentage >= 100 ? 'completed' : 'in_progress';

    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('user_roadmap_progress')
        .update({
          progress_percentage: progressPercentage,
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { data: successResponse(data), status: 200 };
    } else {
      // Create
      const { data, error } = await supabase
        .from('user_roadmap_progress')
        .insert({
          user_id: userId,
          stage_id: stageId,
          status,
          progress_percentage: progressPercentage,
          started_at: new Date().toISOString(),
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return { data: successResponse(data), status: 201 };
    }
  } catch (error) {
    console.error('Update roadmap progress error:', error);
    return { error: errorResponse('Failed to update progress', 'UPDATE_ERROR'), status: 500 };
  }
}

/**
 * Get all roadmaps overview
 */
export async function getAllRoadmaps(userId?: string) {
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const roadmaps: Record<string, any> = {};

  for (const level of levels) {
    const { data: stages, count } = await supabase
      .from('roadmap_stages')
      .select('id', { count: 'exact' })
      .eq('level', level);

    let completedStages = 0;

    if (userId && stages) {
      const { count: completed } = await supabase
        .from('user_roadmap_progress')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'completed')
        .in('stage_id', stages.map((s) => s.id));

      completedStages = completed || 0;
    }

    roadmaps[level] = {
      total_stages: count || 0,
      completed_stages: completedStages,
      progress_percentage:
        count && count > 0
          ? Math.round((completedStages / count) * 100)
          : 0,
    };
  }

  return { data: successResponse(roadmaps), status: 200 };
}

// ==================== Admin Functions ====================

/**
 * Create roadmap stage (Admin)
 */
export async function createStage(
  stage: Omit<RoadmapStage, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('roadmap_stages')
    .insert(stage)
    .select()
    .single();

  if (error) {
    return { error: errorResponse('Failed to create stage', 'CREATE_ERROR'), status: 500 };
  }

  return { data: successResponse(data, 'Stage created'), status: 201 };
}

/**
 * Update roadmap stage (Admin)
 */
export async function updateStage(
  id: number,
  updates: Partial<Omit<RoadmapStage, 'id' | 'created_at' | 'updated_at'>>
) {
  const { data, error } = await supabase
    .from('roadmap_stages')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: errorResponse('Failed to update stage', 'UPDATE_ERROR'), status: 500 };
  }

  return { data: successResponse(data, 'Stage updated'), status: 200 };
}

/**
 * Delete roadmap stage (Admin)
 */
export async function deleteStage(id: number) {
  const { error } = await supabase
    .from('roadmap_stages')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: errorResponse('Failed to delete stage', 'DELETE_ERROR'), status: 500 };
  }

  return { data: successResponse(null, 'Stage deleted'), status: 200 };
}
