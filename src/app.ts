import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { corsConfig } from './middleware/cors';

// Routes
import authRoutes from './routes/auth';
import hiraganaRoutes from './routes/hiragana';
import katakanaRoutes from './routes/katakana';
import kanjiRoutes from './routes/kanji';
import vocabularyRoutes from './routes/vocabulary';
import grammarRoutes from './routes/grammar';
import flashcardRoutes from './routes/flashcard';
import quizRoutes from './routes/quiz';
import progressRoutes from './routes/progress';
import roadmapRoutes from './routes/roadmap';

// Admin routes
import adminHiraganaRoutes from './routes/admin/hiragana';
import adminKatakanaRoutes from './routes/admin/katakana';
import adminKanjiRoutes from './routes/admin/kanji';
import adminVocabularyRoutes from './routes/admin/vocabulary';
import adminGrammarRoutes from './routes/admin/grammar';
import adminCurriculumRoutes from './routes/admin/curriculum';
import adminUsersRoutes from './routes/admin/users';

const PORT = process.env.PORT || 3001;

export const app = new Elysia()
  // CORS
  .use(corsConfig)
  
  // Swagger Documentation
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Japanese Learning API',
          version: '1.0.0',
          description: 'RESTful API for Japanese Learning Application with SRS flashcards, quizzes, and JLPT progress tracking',
          contact: {
            name: 'API Support',
            email: 'support@japanlearn.app',
          },
        },
        tags: [
          { name: 'Auth', description: 'Authentication endpoints' },
          { name: 'Hiragana', description: 'Hiragana character endpoints' },
          { name: 'Katakana', description: 'Katakana character endpoints' },
          { name: 'Kanji', description: 'Kanji character endpoints' },
          { name: 'Vocabulary', description: 'Vocabulary endpoints' },
          { name: 'Grammar', description: 'Grammar pattern endpoints' },
          { name: 'Flashcard', description: 'Flashcard & SRS endpoints' },
          { name: 'Quiz', description: 'Quiz endpoints' },
          { name: 'Progress', description: 'User progress endpoints' },
          { name: 'Roadmap', description: 'JLPT roadmap endpoints' },
          { name: 'Admin', description: 'Admin management endpoints' },
        ],
        servers: [
          // If you deploy to Vercel, this local URL won't matter much for production
          { url: `http://localhost:${PORT}`, description: 'Development server' },
        ],
      },
      path: '/docs',
    })
  )
  
  // Health check
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }))
  
  // API info
  .get('/api', () => ({
    name: 'Japanese Learning API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      hiragana: '/api/hiragana',
      katakana: '/api/katakana',
      kanji: '/api/kanji',
      vocabulary: '/api/vocabulary',
      grammar: '/api/grammar',
      flashcard: '/api/flashcard',
      quiz: '/api/quiz',
      progress: '/api/progress',
      roadmap: '/api/roadmap',
      admin: '/api/admin',
      docs: '/docs',
    },
  }))
  
  // Public routes
  .use(authRoutes)
  .use(hiraganaRoutes)
  .use(katakanaRoutes)
  .use(kanjiRoutes)
  .use(vocabularyRoutes)
  .use(grammarRoutes)
  .use(roadmapRoutes)
  
  // Protected routes
  .use(flashcardRoutes)
  .use(quizRoutes)
  .use(progressRoutes)
  
  // Admin routes
  .group('/api/admin', (app) =>
    app
      .use(adminHiraganaRoutes)
      .use(adminKatakanaRoutes)
      .use(adminKanjiRoutes)
      .use(adminVocabularyRoutes)
      .use(adminGrammarRoutes)
      .use(adminCurriculumRoutes)
      .use(adminUsersRoutes)
  )
  
  // Global error handler
  .onError(({ code, error, set }) => {
    console.error(`Error [${code}]:`, error);
    
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: {
          message: 'Endpoint not found',
          code: 'NOT_FOUND',
        },
      };
    }
    
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.message,
        },
      };
    }
    
    set.status = 500;
    return {
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    };
  });

export type App = typeof app;
