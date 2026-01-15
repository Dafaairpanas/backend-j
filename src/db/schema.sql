-- =============================================
-- Japanese Learning App Database Schema
-- For Supabase PostgreSQL
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  current_level VARCHAR(5) DEFAULT 'N5' CHECK (current_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  streak_days INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- =============================================
-- HIRAGANA TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hiragana (
  id SERIAL PRIMARY KEY,
  character VARCHAR(5) NOT NULL,
  romaji VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('basic', 'dakuon', 'handakuon', 'yoon')),
  stroke_order TEXT[],
  audio_url TEXT,
  example_word VARCHAR(50),
  example_meaning VARCHAR(100),
  mnemonic TEXT,
  order_index INTEGER UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hiragana_type ON hiragana(type);
CREATE INDEX idx_hiragana_order ON hiragana(order_index);

-- =============================================
-- KATAKANA TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS katakana (
  id SERIAL PRIMARY KEY,
  character VARCHAR(5) NOT NULL,
  romaji VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('basic', 'dakuon', 'handakuon', 'yoon')),
  stroke_order TEXT[],
  audio_url TEXT,
  example_word VARCHAR(50),
  example_meaning VARCHAR(100),
  mnemonic TEXT,
  order_index INTEGER UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_katakana_type ON katakana(type);
CREATE INDEX idx_katakana_order ON katakana(order_index);

-- =============================================
-- KANJI TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS kanji (
  id SERIAL PRIMARY KEY,
  character VARCHAR(5) NOT NULL,
  meaning TEXT NOT NULL,
  kunyomi TEXT,
  onyomi TEXT,
  level VARCHAR(5) NOT NULL CHECK (level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  stroke_count INTEGER NOT NULL,
  radical VARCHAR(20),
  stroke_order TEXT[],
  examples JSONB DEFAULT '[]',
  mnemonic TEXT,
  jlpt_order INTEGER UNIQUE NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kanji_level ON kanji(level);
CREATE INDEX idx_kanji_character ON kanji(character);
CREATE INDEX idx_kanji_jlpt_order ON kanji(jlpt_order);

-- =============================================
-- VOCABULARY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS vocabulary (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  reading VARCHAR(100) NOT NULL,
  meaning TEXT NOT NULL,
  part_of_speech VARCHAR(50) NOT NULL,
  level VARCHAR(5) NOT NULL CHECK (level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  category VARCHAR(50),
  example_sentence TEXT,
  example_translation TEXT,
  audio_url TEXT,
  kanji_used TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vocabulary_level ON vocabulary(level);
CREATE INDEX idx_vocabulary_category ON vocabulary(category);
CREATE INDEX idx_vocabulary_word ON vocabulary(word);

-- =============================================
-- GRAMMAR TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS grammar (
  id SERIAL PRIMARY KEY,
  pattern VARCHAR(200) NOT NULL,
  meaning TEXT NOT NULL,
  explanation TEXT NOT NULL,
  level VARCHAR(5) NOT NULL CHECK (level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  structure TEXT NOT NULL,
  examples JSONB DEFAULT '[]',
  related_grammar INTEGER[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grammar_level ON grammar(level);
CREATE INDEX idx_grammar_pattern ON grammar(pattern);

-- =============================================
-- USER PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('hiragana', 'katakana', 'kanji', 'vocabulary', 'grammar')),
  content_id INTEGER NOT NULL,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_type ON user_progress(content_type);
CREATE INDEX idx_user_progress_mastery ON user_progress(mastery_level);

-- =============================================
-- FLASHCARD DECKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS flashcard_decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  content_type VARCHAR(20) CHECK (content_type IN ('hiragana', 'katakana', 'kanji', 'vocabulary', 'grammar')),
  level VARCHAR(5) CHECK (level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  card_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flashcard_decks_user ON flashcard_decks(user_id);

-- =============================================
-- FLASHCARD REVIEWS TABLE (SRS)
-- =============================================
CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('hiragana', 'katakana', 'kanji', 'vocabulary', 'grammar')),
  content_id INTEGER NOT NULL,
  ease_factor DECIMAL(4,2) DEFAULT 2.50,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_at TIMESTAMPTZ NOT NULL,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

CREATE INDEX idx_flashcard_reviews_user ON flashcard_reviews(user_id);
CREATE INDEX idx_flashcard_reviews_next ON flashcard_reviews(next_review_at);
CREATE INDEX idx_flashcard_reviews_type ON flashcard_reviews(content_type);

-- =============================================
-- QUIZZES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('hiragana', 'katakana', 'kanji', 'vocabulary', 'grammar', 'mixed')),
  level VARCHAR(5) CHECK (level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  question_count INTEGER NOT NULL,
  correct_count INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  time_spent INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quizzes_user ON quizzes(user_id);
CREATE INDEX idx_quizzes_type ON quizzes(type);
CREATE INDEX idx_quizzes_completed ON quizzes(completed_at);

-- =============================================
-- QUIZ QUESTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_type VARCHAR(200) NOT NULL,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer TEXT NOT NULL,
  user_answer TEXT,
  is_correct BOOLEAN,
  content_type VARCHAR(20) NOT NULL,
  content_id INTEGER NOT NULL,
  order_index INTEGER DEFAULT 0
);

CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);

-- =============================================
-- ROADMAP STAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS roadmap_stages (
  id SERIAL PRIMARY KEY,
  level VARCHAR(5) NOT NULL CHECK (level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  stage_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  objectives TEXT[] DEFAULT '{}',
  content_requirements JSONB DEFAULT '[]',
  estimated_hours INTEGER DEFAULT 0,
  order_index INTEGER UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roadmap_stages_level ON roadmap_stages(level);
CREATE INDEX idx_roadmap_stages_order ON roadmap_stages(order_index);

-- =============================================
-- USER ROADMAP PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_roadmap_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stage_id INTEGER NOT NULL REFERENCES roadmap_stages(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'locked' CHECK (status IN ('locked', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stage_id)
);

CREATE INDEX idx_user_roadmap_progress_user ON user_roadmap_progress(user_id);
CREATE INDEX idx_user_roadmap_progress_status ON user_roadmap_progress(status);

-- =============================================
-- ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('streak', 'mastery', 'quiz', 'milestone')),
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- Function to increment user XP
CREATE OR REPLACE FUNCTION increment_user_xp(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET total_xp = total_xp + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

-- Users can manage their own progress
CREATE POLICY progress_all_own ON user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY flashcard_decks_all_own ON flashcard_decks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY flashcard_reviews_all_own ON flashcard_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY quizzes_all_own ON quizzes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY quiz_questions_select ON quiz_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.user_id = auth.uid())
);
CREATE POLICY roadmap_progress_all_own ON user_roadmap_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY achievements_all_own ON user_achievements FOR ALL USING (auth.uid() = user_id);

-- Public tables (read only for authenticated users)
CREATE POLICY hiragana_read ON hiragana FOR SELECT TO authenticated USING (true);
CREATE POLICY katakana_read ON katakana FOR SELECT TO authenticated USING (true);
CREATE POLICY kanji_read ON kanji FOR SELECT TO authenticated USING (true);
CREATE POLICY vocabulary_read ON vocabulary FOR SELECT TO authenticated USING (true);
CREATE POLICY grammar_read ON grammar FOR SELECT TO authenticated USING (true);
CREATE POLICY roadmap_stages_read ON roadmap_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY achievements_read ON achievements FOR SELECT TO authenticated USING (true);

-- =============================================
-- INITIAL DATA: ACHIEVEMENTS
-- =============================================
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
  ('First Steps', 'Complete your first study session', '🎯', 'milestone', 'sessions', 1, 10),
  ('Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 'streak', 7, 50),
  ('Month Master', 'Maintain a 30-day streak', '🏆', 'streak', 'streak', 30, 200),
  ('Hiragana Hero', 'Master all basic hiragana', '📝', 'mastery', 'hiragana_mastery', 46, 100),
  ('Katakana Champion', 'Master all basic katakana', '🏅', 'mastery', 'katakana_mastery', 46, 100),
  ('Kanji Beginner', 'Learn 10 kanji', '📚', 'milestone', 'kanji_learned', 10, 50),
  ('Kanji Apprentice', 'Learn 50 kanji', '📖', 'milestone', 'kanji_learned', 50, 150),
  ('Kanji Master', 'Learn 200 kanji', '🎓', 'milestone', 'kanji_learned', 200, 500),
  ('Quiz Starter', 'Complete 5 quizzes', '❓', 'quiz', 'quizzes_completed', 5, 30),
  ('Quiz Pro', 'Complete 50 quizzes', '🧠', 'quiz', 'quizzes_completed', 50, 200),
  ('Perfect Score', 'Get 100% on a quiz', '💯', 'quiz', 'perfect_quiz', 1, 100),
  ('Vocabulary Builder', 'Learn 100 vocabulary words', '📝', 'milestone', 'vocabulary_learned', 100, 150),
  ('Grammar Guru', 'Learn 20 grammar patterns', '✍️', 'milestone', 'grammar_learned', 20, 150),
  ('N5 Ready', 'Complete N5 roadmap', '🎌', 'milestone', 'n5_complete', 1, 500),
  ('N4 Ready', 'Complete N4 roadmap', '🗾', 'milestone', 'n4_complete', 1, 750)
ON CONFLICT DO NOTHING;

-- =============================================
-- DONE!
-- =============================================
