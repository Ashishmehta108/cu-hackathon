# Frontend Context — Awaaz React App

> **Read this before writing any frontend code.**

**IMPORTANT**: Use **shadcn/ui** (and Tailwind CSS) for all UI components in this project.

read to the theme.md for better theme understandability

## Overview

React + TypeScript + Vite single-page application. Communicates with the Express backend (`localhost:3001/api/*`) for all Sarvam AI and vector search operations. Uses Firebase Firestore directly for reading/writing complaints and wiki entries.

**Dev Server**: `http://localhost:5173`

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18 + TypeScript | UI components & logic |
| Bundler | Vite 5 | Dev server & build |
| UI Library | shadcn/ui + Tailwind CSS | UI components & styling |
| Routing | react-router-dom v6 | Client-side routing |
| Database | Firebase Firestore (client SDK) | Read/write complaints & wiki entries |
| Fonts | Inter, Outfit, Noto Sans Devanagari | Typography (via Google Fonts) |

---

## Folder Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx                 # Top nav: logo + links + mobile hamburger
│   │   ├── VoiceRecorder.tsx          # Mic button + waveform canvas + timer
│   │   ├── ComplaintCard.tsx           # Compact complaint display card
│   │   ├── MagicLinkPanel.tsx          # Amber panel: "🔗 Community Wisdom Found"
│   │   ├── WikiEntryCard.tsx           # Wiki entry card with audio, translations
│   │   ├── PetitionDraft.tsx           # Formatted petition letter + copy/download
│   │   ├── ComplaintCluster.tsx        # "47 people reported similar issues"
│   │   ├── SearchBar.tsx               # Debounced multilingual search input
│   │   └── LoadingSpinner.tsx          # "AI is thinking..." indicator
│   ├── pages/
│   │   ├── Home.tsx                    # Landing page: hero + CTAs + stats
│   │   ├── RecordComplaint.tsx         # 4-step voice complaint flow
│   │   ├── ComplaintDetail.tsx         # Single complaint + petition + Magic Link
│   │   ├── Dashboard.tsx               # Complaint list + stats + filters
│   │   ├── Wiki.tsx                    # Wiki browser with search + filters
│   │   └── RecordWiki.tsx              # 4-step elder knowledge recording
│   ├── hooks/
│   │   ├── useVoiceRecorder.ts         # MediaRecorder API wrapper
│   │   ├── useComplaints.ts            # Firestore complaints listener
│   │   └── useWiki.ts                  # Firestore wiki listener
│   ├── services/
│   │   ├── api.ts                      # Backend API client (all /api/* calls)
│   │   └── firebase.ts                 # Firebase init + Firestore helpers
│   ├── types/
│   │   ├── complaint.ts                # Complaint, ComplaintCategory types
│   │   ├── wiki.ts                     # WikiEntry, WikiCategory types
│   │   └── user.ts                     # User type (minimal for MVP)
│   ├── App.tsx                         # Router setup + layout shell
│   ├── main.tsx                        # React entry point
│   └── index.css                       # Global styles + CSS variables (design system)
├── index.html                          # HTML template (Google Fonts loaded here)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Routing (`App.tsx`)

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Navbar />
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/record-complaint" element={<RecordComplaint />} />
    <Route path="/complaint/:id" element={<ComplaintDetail />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/wiki" element={<Wiki />} />
    <Route path="/record-wiki" element={<RecordWiki />} />
  </Routes>
</BrowserRouter>
```

---

## Design System (`index.css`)

### Color Palette

```css
:root {
  /* Primary — Saffron (India-inspired) */
  --color-primary: #FF6B35;
  --color-primary-light: #FF8F65;
  --color-primary-dark: #E55A25;

  /* Secondary — Deep Teal */
  --color-secondary: #004E64;
  --color-secondary-light: #007991;

  /* Accent — Golden Amber (Magic Link) */
  --color-accent: #F5A623;

  /* Backgrounds */
  --color-bg: #FFF8F0;                 /* Warm cream */
  --color-bg-card: #FFFFFF;
  --color-bg-dark: #1A1A2E;

  /* Text */
  --color-text: #1A1A2E;
  --color-text-secondary: #6B7280;

  /* Status */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Category badge colors */
  --cat-infrastructure: #3B82F6;
  --cat-health: #EF4444;
  --cat-agriculture: #10B981;
  --cat-water: #06B6D4;
  --cat-education: #8B5CF6;
  --cat-corruption: #F97316;
  --cat-other: #6B7280;

  /* Typography */
  --font-sans: 'Inter', 'Noto Sans Devanagari', system-ui, sans-serif;
  --font-display: 'Outfit', var(--font-sans);

  /* Spacing & Effects */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.15);
}
```

### Google Fonts (load in `index.html`)

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600&display=swap" rel="stylesheet">
```

### Design Principles

- **Mobile-first** responsive — design for 375px width, scale up
- **Glassmorphism** on cards: `backdrop-filter: blur(10px)`, semi-transparent backgrounds
- **Micro-animations**: hover scaling on buttons, fade-in on page transitions, pulse on recording
- **Category badges**: Colored pills using `--cat-*` variables
- **Magic Link panel**: Amber/golden background (#F5A623) with subtle glow

---

## TypeScript Types

### Complaint (`types/complaint.ts`)

```typescript
export interface Complaint {
  id: string;
  audioUrl: string;                              // Base64 audio data
  transcription: string;                         // Original language text
  language: string;                              // ISO 639-1 code
  category: ComplaintCategory;
  keywords: string[];
  location: Location;
  department: string;
  petition: string;
  clusterId?: string;
  magicLinkWikiIds: string[];
  status: 'pending' | 'submitted' | 'resolved';
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ComplaintCategory =
  | 'Infrastructure' | 'Health' | 'Agriculture'
  | 'Water' | 'Education' | 'Corruption' | 'Other';

export interface Location {
  lat?: number;
  lng?: number;
  village: string;
  district: string;
  state: string;
}

export const CATEGORY_DEPARTMENT_MAP: Record<ComplaintCategory, string> = {
  Infrastructure: 'Public Works Department (PWD)',
  Health: 'Department of Health & Family Welfare',
  Agriculture: 'Department of Agriculture & Farmers Welfare',
  Water: 'Department of Drinking Water & Sanitation',
  Education: 'Department of School Education & Literacy',
  Corruption: 'Central Vigilance Commission (CVC)',
  Other: 'District Collector Office',
};
```

### WikiEntry (`types/wiki.ts`)

```typescript
export interface WikiEntry {
  id: string;
  elderName: string;
  audioUrl: string;
  transcription: {
    original: string;
    english: string;
    hindi: string;
  };
  language: string;
  title: string;
  category: WikiCategory;
  tags: string[];
  location: { village: string; district: string; state: string };
  description: string;
  createdAt: Date;
}

export type WikiCategory =
  | 'Farming' | 'Water Management' | 'Natural Remedies'
  | 'History' | 'Festivals' | 'Crafts' | 'Other';
```

---

## Backend API Client (`services/api.ts`)

Thin wrapper for all calls to the Express backend at `http://localhost:3001/api`:

```typescript
const API_BASE = 'http://localhost:3001/api';

export const api = {
  // Speech-to-Text: send audio blob, get transcription
  transcribe: async (audioBlob: Blob, language?: string): Promise<{ text: string; language: string }> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    if (language) formData.append('language', language);
    const res = await fetch(`${API_BASE}/sarvam/stt`, { method: 'POST', body: formData });
    return res.json();
  },

  // Translate text between languages
  translate: async (text: string, sourceLang: string, targetLang: string): Promise<{ translatedText: string }> => {
    const res = await fetch(`${API_BASE}/sarvam/translate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLang, targetLang }),
    });
    return res.json();
  },

  // Categorize complaint text
  categorize: async (text: string): Promise<{ category: string; keywords: string[]; department: string }> => {
    const res = await fetch(`${API_BASE}/sarvam/categorize`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  // Draft a formal petition
  draftPetition: async (params: {
    complaint: string; category: string; department: string;
    location: { village: string; district: string; state: string };
    clusterCount: number;
  }): Promise<{ petition: string }> => {
    const res = await fetch(`${API_BASE}/sarvam/petition`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  // Magic Link — find related wiki entries via vector search
  findMagicLinks: async (complaintText: string): Promise<{ matches: { wikiId: string; score: number; title: string }[] }> => {
    const res = await fetch(`${API_BASE}/sarvam/magic-link`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaintText }),
    });
    return res.json();
  },

  // Text-to-Speech
  textToSpeech: async (text: string, language: string): Promise<{ audioBase64: string }> => {
    const res = await fetch(`${API_BASE}/sarvam/tts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });
    return res.json();
  },

  // Process wiki entry (translate + generate metadata)
  processWikiEntry: async (transcription: string, language: string) => {
    const res = await fetch(`${API_BASE}/sarvam/process-wiki`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcription, language }),
    });
    return res.json();
  },
};
```

---

## Firebase Service (`services/firebase.ts`)

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Firestore helpers
export const complaintsRef = collection(db, 'complaints');
export const wikiRef = collection(db, 'wikiEntries');
```

> **Note**: Firebase env vars in Vite must be prefixed with `VITE_` — e.g., `VITE_FIREBASE_API_KEY`.

---

## Custom Hooks

### `useVoiceRecorder` Hook

```typescript
interface UseVoiceRecorderReturn {
  isRecording: boolean;
  duration: number;          // seconds
  audioLevel: number;        // 0-1, for waveform visualization
  audioBlob: Blob | null;    // recorded audio blob (webm/opus)
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  error: string | null;
}
```

**Implementation notes:**
- Uses `navigator.mediaDevices.getUserMedia({ audio: true })`
- Creates `MediaRecorder` with `mimeType: 'audio/webm;codecs=opus'`
- Uses `AudioContext` + `AnalyserNode` for real-time `audioLevel` data
- Tracks `duration` with `setInterval` during recording
- Returns `Blob` on stop

### `useComplaints` Hook

```typescript
interface UseComplaintsReturn {
  complaints: Complaint[];
  loading: boolean;
  addComplaint: (data: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  getClusterCount: (category: string, village: string) => number;
}
```

- Uses `onSnapshot` for real-time Firestore listener on `complaints` collection
- `getClusterCount` filters in-memory by category + location

### `useWiki` Hook

```typescript
interface UseWikiReturn {
  entries: WikiEntry[];
  loading: boolean;
  addEntry: (data: Omit<WikiEntry, 'id' | 'createdAt'>) => Promise<string>;
  searchEntries: (query: string) => WikiEntry[];
}
```

- Uses `onSnapshot` for real-time Firestore listener on `wikiEntries` collection
- `searchEntries` filters client-side: matches query against `title`, `tags`, `description`, `transcription.english`

---

## Page Specifications

### Home (`pages/Home.tsx`)

- **Hero section**: Large heading "What if your village could speak?", subtext, gradient background using `--color-primary` → `--color-secondary`
- **Two feature cards**: "🗣️ Report a Problem" → `/record-complaint`, "📚 Share Wisdom" → `/record-wiki`
- **Stats bar**: Live counts from Firebase — total complaints, total wiki entries, petitions drafted
- **Footer**: "Awaaz — Voice of the Community"

### RecordComplaint (`pages/RecordComplaint.tsx`)

**4-step wizard flow** with progress indicator:

| Step | UI | Actions |
|------|-----|---------|
| 1. Record | VoiceRecorder component, language dropdown (22 languages), location fields (village/district/state) | User speaks complaint, presses stop |
| 2. Review | Display transcription, let user edit text, show detected language | Call `api.transcribe()` on audio blob |
| 3. AI Processing | Loading spinner → category badge + department + keywords → petition draft → Magic Link matches | Chain: `api.categorize()` → `api.draftPetition()` → `api.findMagicLinks()` |
| 4. Submitted | Success animation, complaint ID, petition text, download option | Write to Firestore via `useComplaints.addComplaint()` |

### ComplaintDetail (`pages/ComplaintDetail.tsx`)

- Reads complaint from Firestore by URL param `:id`
- Full transcription + audio playback
- Category badge + department
- `PetitionDraft` component
- `ComplaintCluster` showing similar count
- `MagicLinkPanel` if `magicLinkWikiIds.length > 0`

### Dashboard (`pages/Dashboard.tsx`)

- **Stats row**: Total complaints, by category (colored bars), petitions count
- **Filters**: Category dropdown, status dropdown, location text
- **Complaint list**: `ComplaintCard` components, ordered by `createdAt` desc
- Click card → navigate to `/complaint/:id`

### Wiki (`pages/Wiki.tsx`)

- `SearchBar` at top with placeholder "Search wisdom in any language..."
- Category filter pills: Farming, Water Management, Natural Remedies, etc.
- Grid of `WikiEntryCard` components
- Click card → expand with full translations + audio player

### RecordWiki (`pages/RecordWiki.tsx`)

**4-step wizard** (similar to RecordComplaint):

| Step | UI | Actions |
|------|-----|---------|
| 1. Record | Elder name input, VoiceRecorder, language dropdown, location fields | Elder speaks knowledge |
| 2. Review | Original transcription + English translation + Hindi translation | Call `api.transcribe()` then `api.processWikiEntry()` |
| 3. AI Tags | Display AI-generated title, category, tags, description — allow edits | Parse from `processWikiEntry` response |
| 4. Published | Success screen, link to entry, "Share this wisdom" | Save to Firestore + upsert vector to Pinecone (via backend) |

---

## Component Specs

### `VoiceRecorder`
- **Props**: `onRecordingComplete: (blob: Blob) => void`, `language?: string`
- **UI**: Large circular mic button (pulsing red animation when recording), canvas waveform visualization, timer display (MM:SS)
- **States**: idle → recording → processing

### `ComplaintCard`
- **Props**: `complaint: Complaint`, `onClick: () => void`
- **UI**: Card with transcription snippet (2 lines), category badge (colored pill), department name, location, cluster count, status pill

### `MagicLinkPanel`
- **Props**: `wikiEntries: WikiEntry[]`
- **UI**: Amber/golden background panel with glow border. Title: "🔗 Community Wisdom Found". Lists entry titles as clickable links to wiki. Shows elder name + location.

### `WikiEntryCard`
- **Props**: `entry: WikiEntry`, `onPlay?: () => void`
- **UI**: Card with elder name, title, category tag, description preview, audio play button, expandable tabs for Original/English/Hindi transcriptions

### `PetitionDraft`
- **Props**: `petition: string`, `department: string`, `location: Location`
- **UI**: Formal letter format with letterhead styling, department address, petition body, signature line. Copy and Download buttons.

### `SearchBar`
- **Props**: `onSearch: (query: string) => void`, `placeholder?: string`
- **UI**: Search input with magnifying glass icon. Debounce: 300ms. Shows result count badge.

### `ComplaintCluster`
- **Props**: `count: number`, `category: string`
- **UI**: "🔥 47 people reported similar issues in your area" with category-colored background bar.

### `Navbar`
- **UI**: Fixed top bar. Left: Awaaz logo. Center/Right: Links (Home, Report, Dashboard, Wiki, Record Wisdom). Mobile: hamburger menu.
- Active link highlighted with `--color-primary`.

### `LoadingSpinner`
- **Props**: `message?: string`
- **UI**: Animated spinner with pulsing text. Default: "AI is thinking..."

---

## Firebase Environment Variables (Vite)

In `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
