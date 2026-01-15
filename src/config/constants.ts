export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export type JLPTLevel = typeof JLPT_LEVELS[number];

export const HIRAGANA_TYPES = ['basic', 'dakuon', 'handakuon', 'yoon'] as const;
export type HiraganaType = typeof HIRAGANA_TYPES[number];

export const KATAKANA_TYPES = ['basic', 'dakuon', 'handakuon', 'yoon'] as const;
export type KatakanaType = typeof KATAKANA_TYPES[number];

export const VOCABULARY_CATEGORIES = [
  'food',
  'travel',
  'business',
  'daily',
  'nature',
  'family',
  'numbers',
  'time',
  'colors',
  'weather',
  'animals',
  'body',
  'clothes',
  'school',
  'work',
] as const;
export type VocabularyCategory = typeof VOCABULARY_CATEGORIES[number];

export const FLASHCARD_RESULTS = ['again', 'hard', 'good', 'easy'] as const;
export type FlashcardResult = typeof FLASHCARD_RESULTS[number];

export const QUIZ_TYPES = [
  'hiragana',
  'katakana',
  'kanji',
  'vocabulary',
  'grammar',
  'mixed',
] as const;
export type QuizType = typeof QUIZ_TYPES[number];

export const CONTENT_TYPES = [
  'hiragana',
  'katakana',
  'kanji',
  'vocabulary',
  'grammar',
] as const;
export type ContentType = typeof CONTENT_TYPES[number];

export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = typeof USER_ROLES[number];

// SRS Constants (SM-2 Algorithm)
export const SRS_CONFIG = {
  initialInterval: 1, // 1 day
  initialEaseFactor: 2.5,
  minEaseFactor: 1.3,
  maxInterval: 365, // Max 1 year interval
  graduatingInterval: 4, // Days before "graduating" from learning
  easyBonus: 1.3,
  intervalModifier: 1.0,
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
