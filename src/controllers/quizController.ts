import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import * as quizService from '../services/quizService';

/**
 * Start a new quiz
 */
export async function startQuiz(
  userId: string,
  type: string,
  level?: string,
  questionCount?: number
) {
  const result = await quizService.startQuiz(
    userId,
    type,
    level,
    questionCount
  );
  return result;
}

/**
 * Submit quiz answers
 */
export async function submitQuiz(
  quizId: string,
  answers: { question_id: string; answer: string }[]
) {
  const result = await quizService.submitQuiz(quizId, answers);
  return result;
}

/**
 * Get quiz history
 */
export async function getQuizHistory(
  userId: string,
  page?: string,
  limit?: string
) {
  const result = await quizService.getQuizHistory(userId, page, limit);
  return result;
}

/**
 * Get specific quiz result
 */
export async function getQuizResult(quizId: string) {
  const result = await quizService.getQuizResult(quizId);
  return result;
}

/**
 * Get quiz statistics
 */
export async function getQuizStats(userId: string) {
  const result = await quizService.getQuizStats(userId);
  return result;
}
