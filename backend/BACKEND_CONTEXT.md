# Backend Context — Awaaz API Server

> **Read this before writing any backend code.**

## Overview

Express + TypeScript server that proxies Sarvam AI APIs (hiding the API key from the frontend), manages Pinecone vector search for Magic Link, and serves as the glue between the React frontend and external services.

**Port**: 3001 | **Base Path**: `/api`

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Runtime | Node.js | 18+ | Server runtime |
| Framework | Express | 4.x | HTTP server + routing |
| Language | TypeScript | 5.x | Type safety |
| Vector DB | Pinecone | `@pinecone-database/pinecone` | Semantic search for Magic Link |
| Embedding | `multilingual-e5-large` | via Pinecone Inference | Multilingual embeddings (Indian languages) |
| File Upload | Multer | 1.x | Audio file handling (multipart/form-data) |
| HTTP Client | node-fetch | 2.x | Calling Sarvam APIs |
| Config | dotenv | 16.x | Environment variables |

---

## Folder Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── sarvam.ts              # /api/sarvam/* — Sarvam API proxy + vector search
│   │   ├── complaints.ts          # /api/complaints/* — Firestore CRUD for complaints
│   │   └── wiki.ts                # /api/wiki/* — Firestore CRUD for wiki entries
│   ├── services/
│   │   ├── sarvamService.ts       # Centralized Sarvam API client (STT, TTS, LLM, Translate)
│   │   └── vectorService.ts       # Pinecone client: init, embed, upsert, query
│   └── server.ts                  # Express entry point: CORS, multer, route mounting
├── .env.example
├── package.json
├── tsconfig.json
└── nodemon.json
```

---

## Environment Variables (`.env`)

```env
# Sarvam AI
SARVAM_API_KEY=your_sarvam_api_subscription_key
SARVAM_BASE_URL=https://api.sarvam.ai

# Pinecone Vector DB
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=awaaz-wiki

# Firebase (for server-side Firestore access, if needed)
FIREBASE_PROJECT_ID=your_project_id

# Server
PORT=3001
```

---

## Server Setup (`server.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { sarvamRoutes } from './routes/sarvam';
import { complaintRoutes } from './routes/complaints';
import { wikiRoutes } from './routes/wiki';
import { initPinecone } from './services/vectorService';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

// Mount routes
app.use('/api/sarvam', sarvamRoutes(upload));
app.use('/api/complaints', complaintRoutes);
app.use('/api/wiki', wikiRoutes);

// Initialize Pinecone, then start server
initPinecone().then(() => {
  app.listen(process.env.PORT || 3001, () => {
    console.log(`Server running on port ${process.env.PORT || 3001}`);
  });
});
```

**Dev command**: `npx nodemon --exec ts-node src/server.ts`

---

## API Routes — Complete Specification

### `/api/sarvam/stt` — Speech-to-Text

```
POST | multipart/form-data
Fields: audio (file, required), language (string, optional, default "auto")
```

**Implemen`tation**:
1. Extract audio buffer from `req.file`
2. Call `sarvamService.speechToText(buffer, language)`
3. Return `{ text: string, language: string }`

### `/api/sarvam/translate` — Translation

```
POST | application/json
Body: { text: string, sourceLang: string, targetLang: string }
```

**Implementation**:
1. Call `sarvamService.translate(text, sourceLang, targetLang)`
2. Return `{ translatedText: string }`

### `/api/sarvam/categorize` — Complaint Categorization

```
POST | application/json
Body: { text: string }
```

**Implementation**:
1. Call `sarvamService.chatCompletion(CATEGORIZE_SYSTEM_PROMPT, text)`
2. Parse JSON response from LLM
3. Return `{ category: string, keywords: string[], department: string }`

### `/api/sarvam/petition` — Petition Drafting

```
POST | application/json
Body: { complaint: string, category: string, department: string, location: {village, district, state}, clusterCount: number }
```

**Implementation**:
1. Construct user message from all fields
2. Call `sarvamService.chatCompletion(PETITION_SYSTEM_PROMPT, userMessage)`
3. Return `{ petition: string }`

### `/api/sarvam/magic-link` — Vector Similarity Search

```
POST | application/json
Body: { complaintText: string }
```

**Implementation**:
1. Call `vectorService.searchSimilar(complaintText, 3)`
2. Filter results by score > 0.7
3. Return `{ matches: { wikiId: string, score: number, title: string }[] }`

### `/api/sarvam/tts` — Text-to-Speech

```
POST | application/json
Body: { text: string, language: string }
```

**Implementation**:
1. Call `sarvamService.textToSpeech(text, language)`
2. Return `{ audioBase64: string }`

### `/api/sarvam/process-wiki` — Process Wiki Entry (Combined)

```
POST | application/json
Body: { transcription: string, language: string }
```

**Implementation** (convenience route that chains multiple calls):
1. Translate to English: `sarvamService.translate(text, lang, 'en')`
2. Translate to Hindi: `sarvamService.translate(text, lang, 'hi')`
3. Generate metadata: `sarvamService.chatCompletion(WIKI_PROCESS_PROMPT, englishText)`
4. Return `{ english: string, hindi: string, title: string, category: string, tags: string[], description: string }`

---

## Sarvam API Service (`sarvamService.ts`)

All external Sarvam API calls go through this service. Contains 4 functions:

### `speechToText(audioBuffer: Buffer, language?: string)`

```typescript
// POST https://api.sarvam.ai/speech-to-text
// Content-Type: multipart/form-data
// Headers: { 'api-subscription-key': SARVAM_API_KEY }
//
// FormData fields:
//   file: audioBuffer (as Blob)
//   model: 'saaras:v3'
//   language_code: language || 'auto'
//
// Response: { transcript: string, language_code: string }
```

### `translate(text: string, sourceLang: string, targetLang: string)`

```typescript
// POST https://api.sarvam.ai/translate
// Content-Type: application/json
// Headers: { 'api-subscription-key': SARVAM_API_KEY }
//
// Body: {
//   input: text,
//   source_language_code: sourceLang,
//   target_language_code: targetLang,
//   model: 'mayura:v1'
// }
//
// Response: { translated_text: string }
```

### `chatCompletion(systemPrompt: string, userMessage: string)`

```typescript
// POST https://api.sarvam.ai/v1/chat/completions
// Content-Type: application/json
// Headers: { 'api-subscription-key': SARVAM_API_KEY }
//
// Body: {
//   model: 'sarvam-m',
//   messages: [
//     { role: 'system', content: systemPrompt },
//     { role: 'user', content: userMessage }
//   ]
// }
//
// Response: { choices: [{ message: { content: string } }] }
```

### `textToSpeech(text: string, language: string)`

```typescript
// POST https://api.sarvam.ai/text-to-speech
// Content-Type: application/json
// Headers: { 'api-subscription-key': SARVAM_API_KEY }
//
// Body: {
//   inputs: [text],
//   target_language_code: language,
//   model: 'bulbul:v3'
// }
//
// Response: { audios: [base64_audio_string] }
```

---

## Vector Service (`vectorService.ts`)

Pinecone-based vector search for the Magic Link feature.

### Setup

```typescript
import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
```

### `initPinecone()`

- Check if index `awaaz-wiki` exists
- If not, create: `dimension: 1024, metric: 'cosine', spec: { serverless: { cloud: 'aws', region: 'us-east-1' } }`
- Wait for index to be ready

### `generateEmbedding(text: string): Promise<number[]>`

- Uses Pinecone Inference API: `pc.inference.embed()`
- Model: `multilingual-e5-large`
- Input: English translation of text (for consistent vector space)
- Returns: 1024-dimensional float array

### `upsertWikiEntry(id: string, text: string, metadata: Record<string, string>)`

- Calls `generateEmbedding(text)`
- Upserts to Pinecone: `index.upsert([{ id, values: embedding, metadata }])`
- Metadata: `{ title, category, tags, elderName, village }`

### `searchSimilar(queryText: string, topK = 3): Promise<{id, score}[]>`

- Calls `generateEmbedding(queryText)`
- Queries Pinecone: `index.query({ vector, topK, includeMetadata: true })`
- Returns matches with score > 0.7

**Vector pipeline flow:**
```
Wiki entry saved → English translation → generateEmbedding() → upsert to Pinecone
Complaint filed → English translation → generateEmbedding() → query Pinecone → top-3 matches
```

---

## LLM Prompt Templates

### Complaint Categorization (`CATEGORIZE_SYSTEM_PROMPT`)

```
You are Awaaz, a civic complaint classifier for Indian communities.
Given a citizen's complaint, extract:
1. category: one of [Infrastructure, Health, Agriculture, Water, Education, Corruption, Other]
2. keywords: array of 3-5 relevant keywords in English
3. department: the relevant Indian government department

Respond ONLY with valid JSON: {"category": "...", "keywords": [...], "department": "..."}
```

### Petition Drafting (`PETITION_SYSTEM_PROMPT`)

```
You are Awaaz, drafting a formal petition letter on behalf of a citizen to an Indian government department. Write a professional, respectful petition in English that:
1. Addresses the correct department head
2. States the complaint clearly
3. Mentions the location
4. Requests specific action
5. Is 150-200 words
6. Ends with "Yours faithfully, The Citizens of [village/district]"
```

**User message format:**
```
Complaint: <text>
Category: <category>
Department: <department>
Location: <village, district, state>
Number of similar complaints: <count>
```

### Wiki Entry Processing (`WIKI_PROCESS_PROMPT`)

```
You are Awaaz, processing traditional knowledge shared by a village elder.
Given the transcription, generate:
1. title: A clear, descriptive title (5-10 words)
2. category: one of [Farming, Water Management, Natural Remedies, History, Festivals, Crafts, Other]
3. tags: array of 5-8 searchable keywords in English
4. description: A 2-3 sentence summary in English

Respond ONLY with valid JSON: {"title": "...", "category": "...", "tags": [...], "description": "..."}
```

---

## Error Handling Pattern

Every route should use this pattern:

```typescript
router.post('/endpoint', async (req, res) => {
  try {
    // ... logic
    res.json({ /* success response */ });
  } catch (error: any) {
    console.error('Route /endpoint failed:', error.message);
    res.status(500).json({
      error: 'Description of what failed',
      details: error.message
    });
  }
});
```

---

## Package Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

---

## Language Codes (Sarvam)

| Code | Language | Code | Language |
|------|----------|------|----------|
| `hi` | Hindi | `ta` | Tamil |
| `te` | Telugu | `kn` | Kannada |
| `ml` | Malayalam | `bn` | Bengali |
| `mr` | Marathi | `gu` | Gujarati |
| `pa` | Punjabi | `en` | English |
| `or` | Odia | `as` | Assamese |
