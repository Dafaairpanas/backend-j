# Japanese Learning API

REST API for Japanese Learning Application built with **Elysia.js** and **Bun**.

## 🚀 Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Framework**: [Elysia.js](https://elysiajs.com/) - TypeScript web framework
- **Database**: [Supabase](https://supabase.com/) PostgreSQL
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI

## 📦 Features

- 🔐 JWT Authentication with role-based access (user/admin)
- 📚 Complete JLPT content (Hiragana, Katakana, Kanji, Vocabulary, Grammar)
- 🧠 Spaced Repetition System (SRS) for flashcards
- 📝 Quiz system with multiple question types
- 📈 Progress tracking per user
- 🗺️ JLPT roadmap (N5-N1)
- 🏆 Achievement system with XP rewards
- 📖 Swagger API documentation

## 🏗️ Project Structure

```
src/
├── config/           # Configuration files
│   ├── supabase.ts   # Supabase client
│   └── constants.ts  # App constants
├── controllers/      # Business logic
├── middleware/       # Auth & admin middleware
├── models/           # TypeScript interfaces
├── routes/           # API route definitions
│   ├── admin/        # Admin routes
│   └── ...
├── services/         # SRS, Quiz, Achievement services
├── utils/            # Helpers & validation schemas
├── db/
│   ├── schema.sql    # Database schema
│   └── seed.ts       # Seed data
└── index.ts          # Entry point
```

## 🛠️ Installation

### Prerequisites

- [Bun](https://bun.sh/) installed
- [Supabase](https://supabase.com/) project

### Setup

1. Clone the repository:

```bash
git clone <repository>
cd japanese-learning-api
```

2. Install dependencies:

```bash
bun install
```

3. Setup environment:

```bash
cp .env.example .env
```

4. Configure `.env` with your Supabase credentials:

```env
PORT=3001
NODE_ENV=development

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
```

5. Setup database:

   - Go to Supabase SQL Editor
   - Run `src/db/schema.sql`

6. Seed initial data:

```bash
bun run seed
```

7. Start development server:

```bash
bun run dev
```

## 📚 API Endpoints

### Public Endpoints

| Method | Endpoint              | Description                 |
| ------ | --------------------- | --------------------------- |
| POST   | `/api/auth/register`  | Register new user           |
| POST   | `/api/auth/login`     | Login                       |
| GET    | `/api/hiragana`       | Get all hiragana            |
| GET    | `/api/katakana`       | Get all katakana            |
| GET    | `/api/kanji`          | Get kanji (with pagination) |
| GET    | `/api/vocabulary`     | Get vocabulary              |
| GET    | `/api/grammar`        | Get grammar patterns        |
| GET    | `/api/roadmap/:level` | Get JLPT roadmap            |

### Protected Endpoints (Requires JWT)

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| GET    | `/api/auth/me`          | Get current user         |
| GET    | `/api/flashcard/next`   | Get next flashcard (SRS) |
| POST   | `/api/flashcard/review` | Submit review result     |
| POST   | `/api/quiz/start`       | Start new quiz           |
| POST   | `/api/quiz/submit`      | Submit quiz answers      |
| GET    | `/api/progress`         | Get user progress        |

### Admin Endpoints (Requires Admin Role)

| Method | Endpoint                              | Description     |
| ------ | ------------------------------------- | --------------- |
| POST   | `/api/admin/hiragana`                 | Create hiragana |
| PUT    | `/api/admin/hiragana/:id`             | Update hiragana |
| DELETE | `/api/admin/hiragana/:id`             | Delete hiragana |
| GET    | `/api/admin/users`                    | Get all users   |
| GET    | `/api/admin/users/analytics/overview` | Get analytics   |

## 📖 API Documentation

Access Swagger documentation at: `http://localhost:3001/docs`

## 🧪 Testing with cURL

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get hiragana (public)
curl http://localhost:3001/api/hiragana

# Get kanji N5 (public)
curl "http://localhost:3001/api/kanji?level=N5"

# Get next flashcard (protected)
curl http://localhost:3001/api/flashcard/next \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Scripts

```bash
bun run dev      # Start development server with watch
bun run start    # Start production server
bun run seed     # Seed database with initial data
```

## 🔧 Environment Variables

| Variable                    | Description                          |
| --------------------------- | ------------------------------------ |
| `PORT`                      | Server port (default: 3001)          |
| `NODE_ENV`                  | Environment (development/production) |
| `SUPABASE_URL`              | Supabase project URL                 |
| `SUPABASE_ANON_KEY`         | Supabase anon key                    |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key            |
| `JWT_SECRET`                | Secret for JWT signing               |
| `JWT_EXPIRES_IN`            | JWT expiration time                  |
| `FRONTEND_URL`              | Frontend URL for CORS                |

## 📄 License

MIT
