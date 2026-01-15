# 🦊 Japanese Learning API - Full Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3001`  
**Runtime:** Bun + Elysia.js  
**Database:** Supabase (PostgreSQL)  
**Authentication:** JWT Bearer Token

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Hiragana Endpoints](#hiragana-endpoints)
4. [Katakana Endpoints](#katakana-endpoints)
5. [Kanji Endpoints](#kanji-endpoints)
6. [Vocabulary Endpoints](#vocabulary-endpoints)
7. [Grammar Endpoints](#grammar-endpoints)
8. [Flashcard Endpoints (SRS)](#flashcard-endpoints-srs)
9. [Quiz Endpoints](#quiz-endpoints)
10. [Progress Endpoints](#progress-endpoints)
11. [Roadmap Endpoints](#roadmap-endpoints)
12. [Admin Endpoints](#admin-endpoints)
13. [Error Codes](#error-codes)

---

## Getting Started

### Health Check

```
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-01-15T12:00:00.000Z",
  "version": "1.0.0"
}
```

### API Info

```
GET /api
```

**Response:**

```json
{
  "name": "Japanese Learning API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "hiragana": "/api/hiragana",
    "katakana": "/api/katakana",
    "kanji": "/api/kanji",
    "vocabulary": "/api/vocabulary",
    "grammar": "/api/grammar",
    "flashcard": "/api/flashcard",
    "quiz": "/api/quiz",
    "progress": "/api/progress",
    "roadmap": "/api/roadmap",
    "admin": "/api/admin",
    "docs": "/docs"
  }
}
```

### Interactive Documentation

```
GET /docs
```

Opens Swagger UI for live API testing.

---

## Authentication

### Register New User

```
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "learner_01",
  "full_name": "John Doe"
}
```

| Field     | Type   | Required | Description             |
| --------- | ------ | -------- | ----------------------- |
| email     | string | ✅       | Valid email format      |
| password  | string | ✅       | Minimum 6 characters    |
| username  | string | ✅       | 3-30 characters, unique |
| full_name | string | ❌       | Max 100 characters      |

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "username": "learner_01",
      "full_name": "John Doe",
      "role": "user",
      "current_level": "N5",
      "streak_days": 0,
      "total_xp": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Email already registered",
    "code": "EMAIL_EXISTS"
  }
}
```

---

### Login

```
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "username": "learner_01",
      "role": "user",
      "current_level": "N5",
      "streak_days": 5,
      "total_xp": 1250
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS"
  }
}
```

---

### Get Current User Profile

```
GET /api/auth/me
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "learner_01",
    "full_name": "John Doe",
    "avatar_url": null,
    "role": "user",
    "current_level": "N5",
    "streak_days": 5,
    "total_xp": 1250,
    "last_activity_at": "2026-01-15T10:00:00.000Z",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## Hiragana Endpoints

### Get All Hiragana

```
GET /api/hiragana
GET /api/hiragana?type=basic
GET /api/hiragana?type=dakuon
GET /api/hiragana?type=handakuon
GET /api/hiragana?type=yoon
```

**Query Parameters:**
| Parameter | Type | Required | Options |
|-----------|------|----------|---------|
| type | string | ❌ | basic, dakuon, handakuon, yoon |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "character": "あ",
      "romaji": "a",
      "type": "basic",
      "stroke_order": ["stroke1.svg", "stroke2.svg"],
      "audio_url": "/audio/hiragana/a.mp3",
      "example_word": "あめ",
      "example_meaning": "rain",
      "mnemonic": "Looks like a person bowing and saying 'Ahhh'",
      "order_index": 1
    }
  ]
}
```

---

### Get Hiragana Grouped by Type

```
GET /api/hiragana/grouped
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "basic": [
      { "id": 1, "character": "あ", "romaji": "a", ... },
      { "id": 2, "character": "い", "romaji": "i", ... }
    ],
    "dakuon": [
      { "id": 47, "character": "が", "romaji": "ga", ... }
    ],
    "handakuon": [...],
    "yoon": [...]
  }
}
```

---

### Get Single Hiragana

```
GET /api/hiragana/:id
```

**Example:** `GET /api/hiragana/1`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "character": "あ",
    "romaji": "a",
    "type": "basic",
    "stroke_order": ["stroke1.svg", "stroke2.svg"],
    "audio_url": "/audio/hiragana/a.mp3",
    "example_word": "あめ",
    "example_meaning": "rain",
    "mnemonic": "Looks like a person bowing and saying 'Ahhh'",
    "order_index": 1
  }
}
```

---

## Katakana Endpoints

### Get All Katakana

```
GET /api/katakana
GET /api/katakana?type=basic
```

_(Same structure as Hiragana)_

---

### Get Katakana Grouped

```
GET /api/katakana/grouped
```

_(Same structure as Hiragana grouped)_

---

### Get Single Katakana

```
GET /api/katakana/:id
```

---

## Kanji Endpoints

### Get All Kanji (Paginated)

```
GET /api/kanji
GET /api/kanji?level=N5
GET /api/kanji?level=N5&page=1&limit=20
```

**Query Parameters:**
| Parameter | Type | Required | Default | Options |
|-----------|------|----------|---------|---------|
| level | string | ❌ | all | N5, N4, N3, N2, N1 |
| page | number | ❌ | 1 | - |
| limit | number | ❌ | 20 | max 100 |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "character": "日",
      "meaning": "day, sun",
      "kunyomi": "ひ, -び, -か",
      "onyomi": "ニチ, ジツ",
      "level": "N5",
      "stroke_count": 4,
      "radical": "日",
      "stroke_order": ["stroke1.svg"],
      "examples": [
        {
          "word": "日本",
          "reading": "にほん",
          "meaning": "Japan"
        },
        {
          "word": "今日",
          "reading": "きょう",
          "meaning": "today"
        }
      ],
      "mnemonic": "Picture of a window with the sun shining through",
      "jlpt_order": 1
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 103,
    "total_pages": 6
  }
}
```

---

### Search Kanji

```
GET /api/kanji/search?q=sun
GET /api/kanji/search?q=日
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | ✅ | Search term (meaning, character, or reading) |
| page | number | ❌ | Page number |
| limit | number | ❌ | Items per page |

---

### Get Kanji Statistics

```
GET /api/kanji/stats
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "total": 2136,
    "by_level": {
      "N5": 103,
      "N4": 181,
      "N3": 361,
      "N2": 415,
      "N1": 1076
    }
  }
}
```

---

### Get Single Kanji

```
GET /api/kanji/:id
```

---

## Vocabulary Endpoints

### Get All Vocabulary (Paginated)

```
GET /api/vocabulary
GET /api/vocabulary?level=N5
GET /api/vocabulary?level=N5&category=daily
GET /api/vocabulary?page=2&limit=30
```

**Query Parameters:**
| Parameter | Type | Required | Options |
|-----------|------|----------|---------|
| level | string | ❌ | N5, N4, N3, N2, N1 |
| category | string | ❌ | daily, food, travel, nature, etc. |
| page | number | ❌ | - |
| limit | number | ❌ | - |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "word": "食べる",
      "reading": "たべる",
      "meaning": "to eat",
      "part_of_speech": "verb",
      "level": "N5",
      "category": "daily",
      "example_sentence": "朝ごはんを食べる",
      "example_translation": "I eat breakfast",
      "audio_url": "/audio/vocab/taberu.mp3",
      "kanji_used": ["食"]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 800
  }
}
```

---

### Search Vocabulary

```
GET /api/vocabulary/search?q=eat
```

---

### Get Vocabulary Categories

```
GET /api/vocabulary/categories
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    "daily",
    "food",
    "travel",
    "nature",
    "business",
    "family",
    "numbers",
    "time"
  ]
}
```

---

### Get Single Vocabulary

```
GET /api/vocabulary/:id
```

---

## Grammar Endpoints

### Get All Grammar (Paginated)

```
GET /api/grammar
GET /api/grammar?level=N5
GET /api/grammar?page=1&limit=10
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "pattern": "〜です",
      "meaning": "is, am, are (polite)",
      "explanation": "Used to make polite statements about something",
      "level": "N5",
      "structure": "[Noun] + です",
      "examples": [
        {
          "japanese": "これは本です",
          "romaji": "kore wa hon desu",
          "english": "This is a book"
        }
      ],
      "related_grammar": [2, 5],
      "notes": "Desu is the polite copula in Japanese"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

### Search Grammar

```
GET /api/grammar/search?q=desu
```

---

### Get Grammar Statistics

```
GET /api/grammar/stats
```

---

### Get Single Grammar

```
GET /api/grammar/:id
```

Returns grammar point with related grammar points included.

---

## Flashcard Endpoints (SRS)

> ⚠️ **All flashcard endpoints require authentication**

### Get Next Due Card

```
GET /api/flashcard/next
GET /api/flashcard/next?type=kanji
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Options |
|-----------|------|----------|---------|
| type | string | ❌ | hiragana, katakana, kanji, vocabulary, grammar |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "review_id": "uuid",
    "content_type": "kanji",
    "content_id": 15,
    "content": {
      "id": 15,
      "character": "大",
      "meaning": "big, large",
      "kunyomi": "おお-きい",
      "onyomi": "ダイ, タイ"
    },
    "ease_factor": 2.5,
    "interval": 4,
    "repetitions": 3,
    "next_review_at": "2026-01-15T14:00:00.000Z"
  }
}
```

---

### Get All Due Cards

```
GET /api/flashcard/due
GET /api/flashcard/due?type=vocabulary&limit=20
Authorization: Bearer <token>
```

---

### Submit Review Result

```
POST /api/flashcard/review
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "content_type": "kanji",
  "content_id": 15,
  "result": "good"
}
```

| Field        | Type   | Required | Options                                        |
| ------------ | ------ | -------- | ---------------------------------------------- |
| content_type | string | ✅       | hiragana, katakana, kanji, vocabulary, grammar |
| content_id   | number | ✅       | ID of the content item                         |
| result       | string | ✅       | again, hard, good, easy                        |

**Result Options Explained:**
| Result | Effect |
|--------|--------|
| again | Reset interval to 1 day, decrease ease factor |
| hard | Increase interval slightly, slight decrease to ease |
| good | Normal interval increase based on SM-2 algorithm |
| easy | Large interval increase, boost ease factor |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "review_id": "uuid",
    "next_review_at": "2026-01-20T14:00:00.000Z",
    "new_interval": 5,
    "new_ease_factor": 2.6,
    "xp_earned": 10
  },
  "message": "Review recorded"
}
```

---

### Get SRS Statistics

```
GET /api/flashcard/stats
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "total_cards": 250,
    "due_today": 15,
    "due_this_week": 45,
    "by_type": {
      "hiragana": { "total": 46, "due": 0 },
      "katakana": { "total": 46, "due": 2 },
      "kanji": { "total": 50, "due": 8 },
      "vocabulary": { "total": 100, "due": 5 },
      "grammar": { "total": 8, "due": 0 }
    },
    "retention_rate": 87.5,
    "average_ease": 2.45
  }
}
```

---

### Add Content to Flashcards

```
POST /api/flashcard/add
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "content_type": "kanji",
  "content_ids": [1, 2, 3, 4, 5]
}
```

---

### Get User's Flashcard Decks

```
GET /api/flashcard/decks
Authorization: Bearer <token>
```

---

### Create Custom Deck

```
POST /api/flashcard/decks
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "JLPT N5 Kanji",
  "description": "All kanji for N5 level",
  "content_type": "kanji",
  "level": "N5"
}
```

---

## Quiz Endpoints

> ⚠️ **All quiz endpoints require authentication**

### Start New Quiz

```
POST /api/quiz/start
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "type": "kanji",
  "level": "N5",
  "question_count": 10
}
```

| Field          | Type   | Required | Default | Options                                               |
| -------------- | ------ | -------- | ------- | ----------------------------------------------------- |
| type           | string | ✅       | -       | hiragana, katakana, kanji, vocabulary, grammar, mixed |
| level          | string | ❌       | all     | N5, N4, N3, N2, N1                                    |
| question_count | number | ❌       | 10      | 5-50                                                  |

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "quiz_id": "uuid-here",
    "type": "kanji",
    "level": "N5",
    "questions": [
      {
        "id": "q1",
        "question": "日",
        "options": ["day", "month", "year", "week"]
      },
      {
        "id": "q2",
        "question": "月",
        "options": ["sun", "moon", "star", "sky"]
      }
    ]
  }
}
```

---

### Submit Quiz Answers

```
POST /api/quiz/submit
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "quiz_id": "uuid-here",
  "answers": [
    { "question_id": "q1", "answer": "day" },
    { "question_id": "q2", "answer": "moon" }
  ]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "quiz_id": "uuid-here",
    "score": 90,
    "correct_count": 9,
    "total_questions": 10,
    "xp_earned": 50,
    "results": [
      {
        "question_id": "q1",
        "is_correct": true,
        "correct_answer": "day",
        "user_answer": "day"
      },
      {
        "question_id": "q2",
        "is_correct": true,
        "correct_answer": "moon",
        "user_answer": "moon"
      }
    ]
  }
}
```

---

### Get Quiz History

```
GET /api/quiz/history
GET /api/quiz/history?page=1&limit=10
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "kanji",
      "level": "N5",
      "question_count": 10,
      "correct_count": 9,
      "score": 90,
      "completed_at": "2026-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

---

### Get Quiz Statistics

```
GET /api/quiz/stats
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "total_quizzes": 50,
    "average_score": 85,
    "by_type": {
      "hiragana": 15,
      "katakana": 10,
      "kanji": 15,
      "vocabulary": 8,
      "grammar": 2
    },
    "best_score": 100,
    "perfect_quizzes": 5
  }
}
```

---

### Get Specific Quiz Result

```
GET /api/quiz/:id
Authorization: Bearer <token>
```

---

## Progress Endpoints

> ⚠️ **All progress endpoints require authentication**

### Get Overall Progress

```
GET /api/progress
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "overall_mastery": 45,
    "by_type": {
      "hiragana": {
        "total": 46,
        "learned": 46,
        "mastery": 95
      },
      "katakana": {
        "total": 46,
        "learned": 30,
        "mastery": 65
      },
      "kanji": {
        "total": 103,
        "learned": 25,
        "mastery": 24
      },
      "vocabulary": {
        "total": 800,
        "learned": 150,
        "mastery": 18
      },
      "grammar": {
        "total": 50,
        "learned": 10,
        "mastery": 20
      }
    },
    "total_xp": 2500,
    "current_level": "N5",
    "streak_days": 7
  }
}
```

---

### Get Daily Progress

```
GET /api/progress/daily
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "date": "2026-01-15",
    "items_studied": 25,
    "by_type": {
      "hiragana": 5,
      "kanji": 10,
      "vocabulary": 10
    },
    "quizzes_taken": 2,
    "xp_earned": 150
  }
}
```

---

### Get Weekly Progress

```
GET /api/progress/weekly
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "start_date": "2026-01-09",
    "end_date": "2026-01-15",
    "total_items": 150,
    "by_day": {
      "2026-01-09": { "items": 20, "types": { "kanji": 10, "vocabulary": 10 } },
      "2026-01-10": { "items": 25, "types": { "kanji": 15, "vocabulary": 10 } },
      "2026-01-11": { "items": 22, "types": { "grammar": 5, "vocabulary": 17 } }
    }
  }
}
```

---

### Update Progress Manually

```
POST /api/progress/update
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "content_type": "kanji",
  "content_id": 15,
  "mastery_delta": 10,
  "correct": true
}
```

---

### Get Progress for Specific Content

```
GET /api/progress/:contentType/:contentId
Authorization: Bearer <token>
```

**Example:** `GET /api/progress/kanji/15`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "content_type": "kanji",
    "content_id": 15,
    "mastery_level": 75,
    "review_count": 12,
    "correct_count": 10,
    "last_reviewed": "2026-01-15T10:00:00.000Z"
  }
}
```

---

## Roadmap Endpoints

### Get All Roadmaps Overview

```
GET /api/roadmap
GET /api/roadmap (with token for user-specific progress)
Authorization: Bearer <token> (optional)
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "N5": {
      "total_stages": 10,
      "completed_stages": 3,
      "progress_percentage": 30
    },
    "N4": {
      "total_stages": 12,
      "completed_stages": 0,
      "progress_percentage": 0
    },
    "N3": { ... },
    "N2": { ... },
    "N1": { ... }
  }
}
```

---

### Get Roadmap for Specific Level

```
GET /api/roadmap/:level
GET /api/roadmap/N5
Authorization: Bearer <token> (optional, includes user progress)
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "level": "N5",
      "stage_number": 1,
      "title": "Introduction to Hiragana",
      "description": "Learn all 46 basic hiragana characters",
      "objectives": [
        "Master あ行 (a, i, u, e, o)",
        "Master か行 (ka, ki, ku, ke, ko)",
        "Complete hiragana quiz with 80%+"
      ],
      "content_requirements": [{ "type": "hiragana", "count": 46 }],
      "estimated_hours": 5,
      "order_index": 1,
      "user_progress": {
        "status": "completed",
        "progress_percentage": 100,
        "started_at": "2026-01-01T00:00:00.000Z",
        "completed_at": "2026-01-05T00:00:00.000Z"
      }
    },
    {
      "id": 2,
      "level": "N5",
      "stage_number": 2,
      "title": "Introduction to Katakana",
      "description": "Learn all 46 basic katakana characters",
      "user_progress": {
        "status": "in_progress",
        "progress_percentage": 45
      }
    }
  ]
}
```

---

### Get Stage Details

```
GET /api/roadmap/stage/:id
Authorization: Bearer <token> (optional)
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "stage": {
      "id": 1,
      "title": "Introduction to Hiragana",
      "description": "...",
      "objectives": [...],
      "content_requirements": [...]
    },
    "content_items": {
      "hiragana": [
        { "id": 1, "character": "あ", "romaji": "a", ... },
        { "id": 2, "character": "い", "romaji": "i", ... }
      ]
    },
    "user_progress": {
      "status": "in_progress",
      "progress_percentage": 75
    }
  }
}
```

---

### Update Stage Progress

```
POST /api/roadmap/stage/:id/progress
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "progress_percentage": 50
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "stage_id": 1,
    "status": "in_progress",
    "progress_percentage": 50,
    "started_at": "2026-01-15T10:00:00.000Z"
  },
  "message": "Progress updated"
}
```

---

## Admin Endpoints

> ⚠️ **All admin endpoints require authentication with admin role**

### User Management

#### List All Users

```
GET /api/admin/users
GET /api/admin/users?page=1&limit=20
Authorization: Bearer <admin-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "username": "learner_01",
      "full_name": "John Doe",
      "role": "user",
      "current_level": "N5",
      "streak_days": 5,
      "total_xp": 1250,
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

#### Get User Details

```
GET /api/admin/users/:id
Authorization: Bearer <admin-token>
```

---

#### Update User Role

```
PUT /api/admin/users/:id/role
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "role": "admin"
}
```

---

#### Delete User

```
DELETE /api/admin/users/:id
Authorization: Bearer <admin-token>
```

⚠️ This will delete the user and all associated data (progress, quizzes, flashcards, etc.)

---

#### Get Analytics Overview

```
GET /api/admin/users/analytics/overview
Authorization: Bearer <admin-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1500,
      "active_week": 450
    },
    "content": {
      "hiragana": 46,
      "katakana": 46,
      "kanji": 2136,
      "vocabulary": 8000,
      "grammar": 500
    },
    "quizzes": {
      "total": 15000
    }
  }
}
```

---

### Content Management (CRUD)

All content types follow the same pattern:

#### Create Content

```
POST /api/admin/hiragana
POST /api/admin/katakana
POST /api/admin/kanji
POST /api/admin/vocabulary
POST /api/admin/grammar
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Example - Create Kanji:**

```json
{
  "character": "新",
  "meaning": "new",
  "kunyomi": "あたら-しい",
  "onyomi": "シン",
  "level": "N5",
  "stroke_count": 13,
  "radical": "斤",
  "examples": [{ "word": "新しい", "reading": "あたらしい", "meaning": "new" }],
  "mnemonic": "Standing by a tree with an axe to cut new wood",
  "jlpt_order": 50
}
```

---

#### Update Content

```
PUT /api/admin/kanji/:id
Authorization: Bearer <admin-token>
Content-Type: application/json
```

---

#### Delete Content

```
DELETE /api/admin/kanji/:id
Authorization: Bearer <admin-token>
```

---

#### Bulk Create

```
POST /api/admin/kanji/bulk
POST /api/admin/vocabulary/bulk
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "kanji": [
    { "character": "新", "meaning": "new", ... },
    { "character": "古", "meaning": "old", ... }
  ]
}
```

---

### Curriculum Management

#### Create Roadmap Stage

```
POST /api/admin/curriculum/stages
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "level": "N5",
  "stage_number": 1,
  "title": "Introduction to Hiragana",
  "description": "Learn all 46 basic hiragana characters",
  "objectives": [
    "Master basic vowels",
    "Complete hiragana quiz"
  ],
  "content_requirements": [
    { "type": "hiragana", "count": 46, "ids": [1,2,3,...] }
  ],
  "estimated_hours": 5,
  "order_index": 1
}
```

---

#### Update Roadmap Stage

```
PUT /api/admin/curriculum/stages/:id
Authorization: Bearer <admin-token>
```

---

#### Delete Roadmap Stage

```
DELETE /api/admin/curriculum/stages/:id
Authorization: Bearer <admin-token>
```

---

## Error Codes

| Code                | HTTP Status | Description                                   |
| ------------------- | ----------- | --------------------------------------------- |
| UNAUTHORIZED        | 401         | Missing or invalid authentication token       |
| INVALID_TOKEN       | 401         | Token has expired or is malformed             |
| FORBIDDEN           | 403         | User doesn't have permission (admin required) |
| NOT_FOUND           | 404         | Resource not found                            |
| VALIDATION          | 400         | Request body validation failed                |
| EMAIL_EXISTS        | 400         | Email already registered                      |
| USERNAME_EXISTS     | 400         | Username already taken                        |
| INVALID_CREDENTIALS | 401         | Wrong email or password                       |
| FETCH_ERROR         | 500         | Database fetch failed                         |
| CREATE_ERROR        | 500         | Failed to create resource                     |
| UPDATE_ERROR        | 500         | Failed to update resource                     |
| DELETE_ERROR        | 500         | Failed to delete resource                     |

**Standard Error Response Format:**

```json
{
  "success": false,
  "error": {
    "message": "Human readable error message",
    "code": "ERROR_CODE"
  }
}
```

---

## cURL Examples

### Register User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Kanji (Authenticated)

```bash
curl http://localhost:3001/api/kanji?level=N5 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Start Quiz

```bash
curl -X POST http://localhost:3001/api/quiz/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"type":"kanji","level":"N5","question_count":10}'
```

### Submit Flashcard Review

```bash
curl -X POST http://localhost:3001/api/flashcard/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"content_type":"kanji","content_id":15,"result":"good"}'
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider adding:

- 100 requests/minute for authenticated users
- 20 requests/minute for unauthenticated endpoints

---

## Changelog

### v1.0.0 (2026-01-15)

- Initial release
- Full CRUD for all content types
- SRS flashcard system with SM-2 algorithm
- Quiz system with multiple question types
- Progress tracking and statistics
- JLPT roadmap system
- Admin panel with analytics
- JWT authentication
- Swagger documentation

---

**Built with ❤️ using Elysia.js + Bun + Supabase**
