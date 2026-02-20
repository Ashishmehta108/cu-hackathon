# AGENTS.md — Awaaz Project Guide for AI Coding Agents

> This file is the **single source of truth** for any AI agent working on the Awaaz codebase.
> Read this ENTIRELY before making any changes.

## Project Summary

**Awaaz** ("Voice") is a hyperlocal community intelligence platform for Indian communities. It has two core systems connected by an AI "Magic Link":

1. **Complaint Engine** — Citizens record voice complaints in any Indian language → AI transcribes, categorizes, clusters similar complaints, drafts formal petitions to government departments
2. **Community Wiki** — Village elders record traditional knowledge → AI preserves, translates to English + Hindi, tags, and makes searchable
3. **Magic Link** — When a complaint is filed, AI searches the wiki for relevant elder wisdom that could solve the problem

**Stack**: React + Vite (frontend) | Express + Node.js (backend) | Firebase Firestore (database) | Sarvam AI (STT, TTS, LLM, Translation) | Pinecone (Vector DB for semantic search)

---

## Quick Start

```bash
# Terminal 1: Backend
cd backend
cp .env.example .env    # Fill in SARVAM_API_KEY, PINECONE_API_KEY, Firebase config
npm install
npm run dev             # Starts on http://localhost:3001

# Terminal 2: Frontend
cd frontend
npm install
npm run dev             # Starts on http://localhost:5173
```

> **Split context files** — For detailed specs, read these:
> - Backend: [`backend/BACKEND_CONTEXT.md`](file:///c:/Users/Abhijay/awaaz/backend/BACKEND_CONTEXT.md) — All 7 API routes, Sarvam service, Pinecone vector pipeline, LLM prompts
> - Frontend: [`frontend/FRONTEND_CONTEXT.md`](file:///c:/Users/Abhijay/awaaz/frontend/FRONTEND_CONTEXT.md) — All 9 components, 6 pages, hooks, design system, Firebase setup

---

## Folder Structure

```
awaaz/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceRecorder.tsx      # Mic button + waveform + timer
│   │   │   ├── ComplaintCard.tsx      # Compact complaint display card
│   │   │   ├── MagicLinkPanel.tsx     # Yellow panel: "Community Wisdom Found"
│   │   │   ├── WikiEntryCard.tsx      # Wiki entry display card
│   │   │   ├── PetitionDraft.tsx      # Formatted petition letter display
│   │   │   ├── ComplaintCluster.tsx   # "47 people reported similar issues"
│   │   │   ├── SearchBar.tsx          # Multilingual wiki search input
│   │   │   ├── Navbar.tsx             # Top navigation bar
│   │   │   └── LoadingSpinner.tsx     # Reusable loading indicator
│   │   ├── pages/
│   │   │   ├── Home.tsx               # Landing page with hero + CTAs
│   │   │   ├── RecordComplaint.tsx    # Multi-step voice complaint flow
│   │   │   ├── Dashboard.tsx          # Complaint list + stats + filters
│   │   │   ├── Wiki.tsx               # Wiki browser with search
│   │   │   ├── RecordWiki.tsx         # Elder knowledge recording flow
│   │   │   └── ComplaintDetail.tsx    # Single complaint + petition + Magic Link
│   │   ├── hooks/
│   │   │   ├── useVoiceRecorder.ts    # MediaRecorder API wrapper
│   │   │   ├── useComplaints.ts       # Firestore complaints listener
│   │   │   └── useWiki.ts             # Firestore wiki listener
│   │   ├── services/
│   │   │   ├── api.ts                 # Backend API client (all /api/* calls)
│   │   │   └── firebase.ts            # Firebase init + Firestore helpers
│   │   ├── types/
│   │   │   ├── complaint.ts           # Complaint, ComplaintCategory types
│   │   │   ├── wiki.ts                # WikiEntry, WikiCategory types
│   │   │   └── user.ts                # User type
│   │   ├── App.tsx                    # Router + layout shell
│   │   ├── main.tsx                   # Entry point
│   │   └── index.css                  # Global styles + CSS variables
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── sarvam.ts              # /api/sarvam/* proxy routes
│   │   │   ├── complaints.ts          # /api/complaints/* CRUD
│   │   │   └── wiki.ts                # /api/wiki/* CRUD
│   │   ├── services/
│   │   │   ├── sarvamService.ts       # Centralized Sarvam API client
│   │   │   └── vectorService.ts       # Pinecone vector DB + embeddings
│   │   └── server.ts                  # Express entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── .env.example
├── AGENTS.md                          # THIS FILE
├── PLANNING.md                        # Original planning document
├── context.md                         # Hackathon context document
└── README.md
```

---

## API Contract — Backend Routes

All routes are prefixed with `/api`. Backend runs on port 3001.

### Sarvam Proxy Routes — `/api/sarvam/`

| Method | Route | Description | Request Body | Response |
|--------|-------|-------------|--------------|----------|
| POST | `/api/sarvam/stt` | Speech to text | `audio`: file, `language`: string (optional, default "auto") | `{ text: string, language: string }` |
| POST | `/api/sarvam/translate` | Translate text | `{ text: string, sourceLang: string, targetLang: string }` | `{ translatedText: string }` |
| POST | `/api/sarvam/categorize` | Categorize complaint | `{ text: string }` | `{ category: string, keywords: string[], department: string }` |
| POST | `/api/sarvam/petition` | Draft petition | `{ complaint, category, department, location }` | `{ petition }` |
| POST | `/api/sarvam/magic-link` | Find related wiki via vector search | `{ complaintText: string }` | `{ matches: {wikiId, score, title}[] }` |
| POST | `/api/sarvam/tts` | Text to speech | `{ text, language }` | `{ audioBase64: string }` |

---

## Sarvam AI API Reference

**Base URL**: `https://api.sarvam.ai`
**Auth Header**: `api-subscription-key: <YOUR_KEY>`

### Speech-to-Text (Saaras v3)
```
POST /speech-to-text
Content-Type: multipart/form-data

Fields:
  file: <audio file>                    # WAV, MP3, WebM, OGG supported
  model: "saaras:v3"
  language_code: "hi" | "ta" | "te" | ... | "auto"

Response: { "transcript": "...", "language_code": "hi" }
```

### Translation (Mayura v1)
```
POST /translate
Content-Type: application/json

Body: {
  "input": "text to translate",
  "source_language_code": "hi",         # or "auto"
  "target_language_code": "en",
  "model": "mayura:v1"
}

Response: { "translated_text": "..." }
```

### Chat Completions (Sarvam-M)
```
POST /v1/chat/completions
Content-Type: application/json

Body: {
  "model": "sarvam-m",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ]
}

Response: { "choices": [{"message": {"content": "..."}}] }
```

### Text-to-Speech (Bulbul v3)
```
POST /text-to-speech
Content-Type: application/json

Body: {
  "inputs": ["text to speak"],
  "target_language_code": "hi",
  "model": "bulbul:v3"
}

Response: { "audios": ["<base64 encoded audio>"] }
```

### Pinecone Vector DB (for Magic Link semantic search)

**SDK**: `@pinecone-database/pinecone` (npm)
**Free Tier**: Starter plan — 5 indexes, 2GB storage, `us-east-1` region
**Embedding Model**: `multilingual-e5-large` (via Pinecone Inference — supports Indian languages)
**Index Config**: `dimension: 1024, metric: 'cosine'`

**Pipeline:**
```
Wiki entry saved → English translation → generateEmbedding() → upsert to Pinecone
Complaint filed → English translation → generateEmbedding() → query Pinecone → top-3 matches
```

```typescript
import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index('awaaz-wiki');

// Upsert wiki entry
await index.upsert([{
  id: wikiEntryId,
  values: embedding,  // 1024-dim vector from multilingual-e5-large
  metadata: { title, category, tags: tags.join(','), elderName, village }
}]);

// Query for Magic Link
const results = await index.query({
  vector: complaintEmbedding,
  topK: 3,
  includeMetadata: true
});
// returns: { matches: [{ id, score, metadata }] }
```

### Language Codes (subset)
| Code | Language | Code | Language |
|------|----------|------|----------|
| `hi` | Hindi | `ta` | Tamil |
| `te` | Telugu | `kn` | Kannada |
| `ml` | Malayalam | `bn` | Bengali |
| `mr` | Marathi | `gu` | Gujarati |
| `pa` | Punjabi | `en` | English |

---

## Firebase Schema

### Collection: `complaints`
```typescript
{
  id: string;                // Auto-generated document ID
  audioUrl: string;          // Base64 audio data or storage path
  transcription: string;     // Original language text
  language: string;          // Language code ("hi", "ta", etc.)
  category: string;          // Infrastructure | Health | Agriculture | Water | Education | Corruption | Other
  keywords: string[];        // ["water", "shortage", "village"]
  location: { village: string, district: string, state: string };
  department: string;        // "Public Works Department (PWD)"
  petition: string;          // Auto-generated petition text
  clusterId?: string;        // For grouping similar complaints
  magicLinkWikiIds: string[]; // IDs of connected wiki entries
  status: 'pending' | 'submitted' | 'resolved';
  upvotes: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `wikiEntries`
```typescript
{
  id: string;
  elderName: string;
  audioUrl: string;
  transcription: { original: string, english: string, hindi: string };
  language: string;
  title: string;             // AI-generated title
  category: string;          // Farming | Water Management | Natural Remedies | History | etc.
  tags: string[];            // AI-generated searchable tags
  location: { village: string, district: string, state: string };
  description: string;       // AI-generated summary
  createdAt: Timestamp;
}
```

---

## LLM Prompt Templates

### Complaint Categorization
```
SYSTEM: You are Awaaz, a civic complaint classifier for Indian communities.
Given a citizen's complaint, extract:
1. category: one of [Infrastructure, Health, Agriculture, Water, Education, Corruption, Other]
2. keywords: array of 3-5 relevant keywords in English
3. department: the relevant Indian government department

Respond ONLY with valid JSON: {"category": "...", "keywords": [...], "department": "..."}

USER: <transcribed complaint text>
```

### Petition Drafting
```
SYSTEM: You are Awaaz, drafting a formal petition letter on behalf of a citizen to an Indian government department. Write a professional, respectful petition in English that:
1. Addresses the correct department head
2. States the complaint clearly
3. Mentions the location
4. Requests specific action  
5. Is 150-200 words
6. Ends with "Yours faithfully, The Citizens of [village/district]"

USER: Complaint: <text>
Category: <category>
Department: <department>
Location: <village, district, state>
Number of similar complaints: <count>
```

### Wiki Entry Processing
```
SYSTEM: You are Awaaz, processing traditional knowledge shared by a village elder.
Given the transcription, generate:
1. title: A clear, descriptive title (5-10 words)
2. category: one of [Farming, Water Management, Natural Remedies, History, Festivals, Crafts, Other]
3. tags: array of 5-8 searchable keywords in English
4. description: A 2-3 sentence summary in English

Respond ONLY with valid JSON: {"title": "...", "category": "...", "tags": [...], "description": "..."}

USER: <transcribed elder wisdom text>
```

### Magic Link (Vector Search — NOT LLM)

Magic Link uses **Pinecone vector similarity search**, NOT an LLM prompt.

The complaint text (translated to English) is embedded using `multilingual-e5-large` and compared against wiki entry embeddings in Pinecone. Top-3 results with score > 0.7 are returned as Magic Link matches.

See `vectorService.ts` in the backend for the full implementation.

---

## Design Guidelines

- **Primary Color**: #FF6B35 (Saffron — India-inspired)
- **Secondary Color**: #004E64 (Deep Teal)
- **Accent/Magic Link**: #F5A623 (Golden Amber)
- **Background**: #FFF8F0 (Warm Cream)
- **Fonts**: Inter (body), Outfit (headings), Noto Sans Devanagari (Hindi)
- **Border Radius**: 8px (small), 12px (medium), 16px (large)
- **Mobile-first** responsive design

---

## Key Decisions

1. **Backend proxy for Sarvam API** — Hide API key from frontend, enable server-side processing
2. **Firebase Firestore (not Realtime DB)** — Better querying, offline support, scalable
3. **No Firebase Auth for MVP** — Skip user authentication to save time. All data is public.
4. **Audio stored as Base64** — Simpler than Firebase Storage for hackathon. Tradeoff: limited to ~10MB recordings
5. **Client-side wiki search** — Full-text search in Firestore is limited. For MVP, fetch all entries and filter client-side by tags/keywords
6. **Pinecone vector DB for Magic Link** — Instead of LLM-based matching (sending all wiki entries to LLM), we use proper vector similarity search with `multilingual-e5-large` embeddings. This gives cross-language semantic matching (Hindi complaint → Tamil wiki entry) and scales better.
7. **No clustering algorithm** — For MVP, "clustering" is just counting complaints with the same category in the same location. Not real ML clustering.

---

## Current Status

- [x] Context document and planning document created
- [x] Refined implementation plan with API specs
- [ ] Project scaffolding (frontend + backend)
- [ ] Everything else — see task.md for full breakdown
