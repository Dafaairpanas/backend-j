import { supabase } from '../config/supabase';
import type { Quiz, QuizQuestion } from '../models/types';
import { CONTENT_TYPES } from '../config/constants';

/**
 * Quiz Service
 * Handles quiz generation, submission, and scoring
 */
export async function generateQuiz(
  userId: string,
  type: string,
  level?: string,
  count: number = 10
) {
  try {
    let data: any[] | null = null;
    let error: any = null;

    // Fetch questions based on type
    if (type === 'hiragana' || type === 'katakana') {
      const result = await supabase
        .from(type)
        .select('*')
        .limit(count);
      data = result.data;
      error = result.error;
    } else if (type === 'kanji' || type === 'vocabulary' || type === 'grammar') {
      let query = supabase.from(type).select('*');
      if (level) {
        query = query.eq('level', level);
      }
      const result = await query.limit(count);
      data = result.data;
      error = result.error;
    } else {
      // Mixed or unknown type - default to vocabulary
      const result = await supabase.from('vocabulary').select('*').limit(count);
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    // Format questions
    const questions: QuizQuestion[] = (data || []).map((q: any, index: number) => ({
      id: q.id?.toString() || index.toString(),
      content_type: type as any,
      content_id: q.id || 0,
      question_type: 'multiple_choice',
      question: q.character || q.word || q.pattern || '',
      options: generateOptions(q, data || [], type),
      correct_answer: q.romaji || q.meaning || q.reading || '',
      order_index: index
    }));

    return { questions };
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw error;
  }
}

/**
 * Generate multiple choice options
 */
function generateOptions(target: any, all: any[], type: string): string[] {
  const correct = target.romaji || target.meaning || target.reading;
  const options = [correct];

  // Get 3 random wrong answers
  const others = all
    .filter((item) => item.id !== target.id)
    .map((item) => item.romaji || item.meaning || item.reading)
    .filter((val) => val !== correct);

  // Shuffle and pick 3
  const shuffled = others.sort(() => 0.5 - Math.random());
  options.push(...shuffled.slice(0, 3));

  // If not enough options, add some defaults or duplicates (shouldn't happen with enough data)
  while (options.length < 4) {
    options.push('Option ' + (options.length + 1));
  }

  // Final shuffle of all 4 options
  return options.sort(() => 0.5 - Math.random());
}

/**
 * Start a new quiz and save to DB
 */
export async function startQuiz(
  userId: string,
  type: string,
  level?: string,
  count: number = 10
) {
  try {
    const { questions } = await generateQuiz(userId, type, level, count);

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert({
        user_id: userId,
        type,
        level,
        question_count: questions.length,
        score: 0,
        correct_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Save questions
    const quizQuestions = questions.map((q, index) => ({
      quiz_id: quiz.id,
      question_type: q.question_type,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      content_type: q.content_type,
      content_id: q.content_id,
      order_index: index,
    }));

    const { error: qError } = await supabase
      .from('quiz_questions')
      .insert(quizQuestions);

    if (qError) throw qError;

    return {
      status: 201,
      data: {
        success: true,
        data: {
          quiz_id: quiz.id,
          type: quiz.type,
          level: quiz.level,
          questions: questions.map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options,
          })),
        },
      },
    };
  } catch (error) {
    console.error('Start quiz error:', error);
    return {
      status: 500,
      error: { message: 'Failed to start quiz', code: 'QUIZ_ERROR' },
    };
  }
}

/**
 * Submit quiz answers
 */
export async function submitQuiz(
  quizId: string,
  answers: { question_id: string; answer: string }[]
) {
  try {
    // Get quiz and questions
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) throw new Error('Quiz not found');

    const { data: questions, error: qError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId);

    if (qError || !questions) throw new Error('Questions not found');

    let correctCount = 0;
    const results = [];

    // Check answers
    for (const q of questions) {
      const userAnswer = answers.find((a) => a.question_id === q.id.toString())?.answer || '';
      const isCorrect = userAnswer === q.correct_answer;

      if (isCorrect) correctCount++;

      results.push({
        question_id: q.id,
        is_correct: isCorrect,
        correct_answer: q.correct_answer,
        user_answer: userAnswer,
      });

      // Update individual question result
      await supabase
        .from('quiz_questions')
        .update({
          user_answer: userAnswer,
          is_correct: isCorrect,
        })
        .eq('id', q.id);
    }

    const score = Math.round((correctCount / quiz.question_count) * 100);

    // Update quiz result
    const { error: updateError } = await supabase
      .from('quizzes')
      .update({
        correct_count: correctCount,
        score,
        completed_at: new Date().toISOString(),
      })
      .eq('id', quizId);

    if (updateError) throw updateError;

    return {
      status: 200,
      data: {
        success: true,
        data: {
          quiz_id: quizId,
          score,
          correct_count: correctCount,
          total_questions: quiz.question_count,
          results,
        },
      },
    };
  } catch (error) {
    console.error('Submit quiz error:', error);
    return {
      status: 500,
      error: { message: 'Failed to submit quiz', code: 'SUBMIT_ERROR' },
    };
  }
}

/**
 * Get quiz result
 */
export async function getQuizResult(quizId: string) {
  try {
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        quiz_questions (*)
      `)
      .eq('id', quizId)
      .single();

    if (error || !quiz) {
      return { status: 404, error: { message: 'Quiz not found', code: 'NOT_FOUND' } };
    }

    return { status: 200, data: { success: true, data: quiz } };
  } catch (error) {
    return { status: 500, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } };
  }
}

/**
 * Get user quiz history
 */
export async function getQuizHistory(userId: string, page: string = '1', limit: string = '10') {
  try {
    const p = parseInt(page);
    const l = parseInt(limit);
    const offset = (p - 1) * l;

    const { data, error, count } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + l - 1);

    if (error) throw error;

    return {
      status: 200,
      data: {
        success: true,
        data,
        meta: {
          page: p,
          limit: l,
          total: count || 0,
        },
      },
    };
  } catch (error) {
    return { status: 500, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } };
  }
}

/**
 * Get user quiz stats
 */
export async function getQuizStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('score, type, correct_count, question_count')
      .eq('user_id', userId)
      .not('completed_at', 'is', null);

    if (error) throw error;

    const totalQuizzes = data.length;
    const averageScore = totalQuizzes > 0 
      ? Math.round(data.reduce((acc, q) => acc + q.score, 0) / totalQuizzes)
      : 0;

    const byType: Record<string, number> = {};
    data.forEach((q) => {
      byType[q.type] = (byType[q.type] || 0) + 1;
    });

    return {
      status: 200,
      data: {
        success: true,
        data: {
          total_quizzes: totalQuizzes,
          average_score: averageScore,
          by_type: byType,
        },
      },
    };
  } catch (error) {
    return { status: 500, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } };
  }
}
