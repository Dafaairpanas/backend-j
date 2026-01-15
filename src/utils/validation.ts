import { t } from 'elysia';
import {
  JLPT_LEVELS,
  HIRAGANA_TYPES,
  KATAKANA_TYPES,
  FLASHCARD_RESULTS,
  QUIZ_TYPES,
  CONTENT_TYPES,
} from '../config/constants';

// ==================== Auth Schemas ====================
export const loginSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 6 }),
});

export const registerSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 6 }),
  username: t.String({ minLength: 3, maxLength: 30 }),
  full_name: t.Optional(t.String({ maxLength: 100 })),
});

// ==================== Query Schemas ====================
export const paginationQuery = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
});

export const levelQuery = t.Object({
  level: t.Optional(t.Union(JLPT_LEVELS.map((l) => t.Literal(l)))),
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
});

export const hiraganaQuery = t.Object({
  type: t.Optional(t.Union(HIRAGANA_TYPES.map((h) => t.Literal(h)))),
});

export const katakanaQuery = t.Object({
  type: t.Optional(t.Union(KATAKANA_TYPES.map((k) => t.Literal(k)))),
});

export const vocabularyQuery = t.Object({
  level: t.Optional(t.Union(JLPT_LEVELS.map((l) => t.Literal(l)))),
  category: t.Optional(t.String()),
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
});

export const searchQuery = t.Object({
  q: t.String({ minLength: 1 }),
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
});

// ==================== Flashcard Schemas ====================
export const flashcardReviewSchema = t.Object({
  content_type: t.Union(CONTENT_TYPES.map((c) => t.Literal(c))),
  content_id: t.Number(),
  result: t.Union(FLASHCARD_RESULTS.map((r) => t.Literal(r))),
});

// ==================== Quiz Schemas ====================
export const quizStartSchema = t.Object({
  type: t.Union(QUIZ_TYPES.map((q) => t.Literal(q))),
  level: t.Optional(t.Union(JLPT_LEVELS.map((l) => t.Literal(l)))),
  question_count: t.Optional(t.Number({ minimum: 5, maximum: 50 })),
});

export const quizSubmitSchema = t.Object({
  quiz_id: t.String(),
  answers: t.Array(
    t.Object({
      question_id: t.String(),
      answer: t.String(),
    })
  ),
});

// ==================== Progress Schemas ====================
export const progressUpdateSchema = t.Object({
  content_type: t.Union(CONTENT_TYPES.map((c) => t.Literal(c))),
  content_id: t.Number(),
  mastery_delta: t.Optional(t.Number()),
  correct: t.Optional(t.Boolean()),
});

// ==================== Admin Schemas ====================
export const hiraganaCreateSchema = t.Object({
  character: t.String({ minLength: 1, maxLength: 5 }),
  romaji: t.String({ minLength: 1, maxLength: 10 }),
  type: t.Union(HIRAGANA_TYPES.map((h) => t.Literal(h))),
  stroke_order: t.Optional(t.Array(t.String())),
  audio_url: t.Optional(t.String()),
  example_word: t.Optional(t.String()),
  example_meaning: t.Optional(t.String()),
  mnemonic: t.Optional(t.String()),
  order_index: t.Number(),
});

export const hiraganaUpdateSchema = t.Partial(hiraganaCreateSchema);

export const katakanaCreateSchema = t.Object({
  character: t.String({ minLength: 1, maxLength: 5 }),
  romaji: t.String({ minLength: 1, maxLength: 10 }),
  type: t.Union(KATAKANA_TYPES.map((k) => t.Literal(k))),
  stroke_order: t.Optional(t.Array(t.String())),
  audio_url: t.Optional(t.String()),
  example_word: t.Optional(t.String()),
  example_meaning: t.Optional(t.String()),
  mnemonic: t.Optional(t.String()),
  order_index: t.Number(),
});

export const katakanaUpdateSchema = t.Partial(katakanaCreateSchema);

export const kanjiCreateSchema = t.Object({
  character: t.String({ minLength: 1, maxLength: 5 }),
  meaning: t.String({ minLength: 1 }),
  kunyomi: t.Optional(t.String()),
  onyomi: t.Optional(t.String()),
  level: t.Union(JLPT_LEVELS.map((l) => t.Literal(l))),
  stroke_count: t.Number({ minimum: 1 }),
  radical: t.Optional(t.String()),
  stroke_order: t.Optional(t.Array(t.String())),
  examples: t.Optional(
    t.Array(
      t.Object({
        word: t.String(),
        reading: t.String(),
        meaning: t.String(),
      })
    )
  ),
  mnemonic: t.Optional(t.String()),
  jlpt_order: t.Number(),
  audio_url: t.Optional(t.String()),
});

export const kanjiUpdateSchema = t.Partial(kanjiCreateSchema);

export const vocabularyCreateSchema = t.Object({
  word: t.String({ minLength: 1 }),
  reading: t.String({ minLength: 1 }),
  meaning: t.String({ minLength: 1 }),
  part_of_speech: t.String(),
  level: t.Union(JLPT_LEVELS.map((l) => t.Literal(l))),
  category: t.Optional(t.String()),
  example_sentence: t.Optional(t.String()),
  example_translation: t.Optional(t.String()),
  audio_url: t.Optional(t.String()),
  kanji_used: t.Optional(t.Array(t.String())),
});

export const vocabularyUpdateSchema = t.Partial(vocabularyCreateSchema);

export const grammarCreateSchema = t.Object({
  pattern: t.String({ minLength: 1 }),
  meaning: t.String({ minLength: 1 }),
  explanation: t.String({ minLength: 1 }),
  level: t.Union(JLPT_LEVELS.map((l) => t.Literal(l))),
  structure: t.String(),
  examples: t.Array(
    t.Object({
      japanese: t.String(),
      romaji: t.Optional(t.String()),
      english: t.String(),
    })
  ),
  related_grammar: t.Optional(t.Array(t.Number())),
  notes: t.Optional(t.String()),
});

export const grammarUpdateSchema = t.Partial(grammarCreateSchema);

export const userRoleUpdateSchema = t.Object({
  role: t.Union([t.Literal('user'), t.Literal('admin')]),
});

// ==================== ID Param Schema ====================
export const idParam = t.Object({
  id: t.String(),
});

export const levelParam = t.Object({
  level: t.Union(JLPT_LEVELS.map((l) => t.Literal(l))),
});
