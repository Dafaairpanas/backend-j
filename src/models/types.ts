// ==================== User Types ====================
export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  current_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  streak_days: number;
  total_xp: number;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  content_type: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'grammar';
  content_id: number;
  mastery_level: number; // 0-100
  review_count: number;
  correct_count: number;
  created_at: string;
  updated_at: string;
}

// ==================== Hiragana & Katakana ====================
export interface Hiragana {
  id: number;
  character: string;
  romaji: string;
  type: 'basic' | 'dakuon' | 'handakuon' | 'yoon';
  stroke_order?: string[];
  audio_url?: string;
  example_word?: string;
  example_meaning?: string;
  mnemonic?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Katakana {
  id: number;
  character: string;
  romaji: string;
  type: 'basic' | 'dakuon' | 'handakuon' | 'yoon';
  stroke_order?: string[];
  audio_url?: string;
  example_word?: string;
  example_meaning?: string;
  mnemonic?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// ==================== Kanji ====================
export interface Kanji {
  id: number;
  character: string;
  meaning: string;
  kunyomi?: string;
  onyomi?: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  stroke_count: number;
  radical?: string;
  stroke_order?: string[];
  examples: KanjiExample[];
  mnemonic?: string;
  jlpt_order: number;
  audio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
}

// ==================== Vocabulary ====================
export interface Vocabulary {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  part_of_speech: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  category?: string;
  example_sentence?: string;
  example_translation?: string;
  audio_url?: string;
  kanji_used?: string[];
  created_at: string;
  updated_at: string;
}

// ==================== Grammar ====================
export interface Grammar {
  id: number;
  pattern: string;
  meaning: string;
  explanation: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  structure: string;
  examples: GrammarExample[];
  related_grammar?: number[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GrammarExample {
  japanese: string;
  romaji?: string;
  english: string;
}

// ==================== Flashcard (SRS) ====================
export interface FlashcardDeck {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  content_type: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'grammar';
  level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface FlashcardReview {
  id: string;
  user_id: string;
  content_type: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'grammar';
  content_id: number;
  ease_factor: number;
  interval: number; // days
  repetitions: number;
  next_review_at: string;
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FlashcardResult {
  cardId: string;
  result: 'again' | 'hard' | 'good' | 'easy';
}

// ==================== Quiz ====================
export interface Quiz {
  id: string;
  user_id: string;
  type: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'grammar' | 'mixed';
  level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  question_count: number;
  correct_count: number;
  score: number;
  time_spent?: number; // seconds
  completed_at?: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id?: string;
  question_type: string;
  question: string;
  options: string[];
  correct_answer: string;
  user_answer?: string;
  is_correct?: boolean;
  content_type: string;
  content_id: number;
}

// ==================== Roadmap ====================
export interface RoadmapStage {
  id: number;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  stage_number: number;
  title: string;
  description: string;
  objectives: string[];
  content_requirements: RoadmapContent[];
  estimated_hours: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface RoadmapContent {
  type: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'grammar';
  count: number;
  ids?: number[];
}

export interface UserRoadmapProgress {
  id: string;
  user_id: string;
  stage_id: number;
  status: 'locked' | 'in_progress' | 'completed';
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// ==================== Achievement ====================
export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'mastery' | 'quiz' | 'milestone';
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: number;
  unlocked_at: string;
}

// ==================== API Types ====================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ==================== Auth Types ====================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  full_name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  exp: number;
}
