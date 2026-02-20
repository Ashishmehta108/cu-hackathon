# PLANNING.md

## 1. Project Overview

**Awaaz** is a hyperlocal community intelligence platform that bridges civic complaints with traditional community wisdom. Citizens can voice complaints in any Indian language, which AI escalates to the relevant government authority — while simultaneously connecting those problems with documented knowledge from village elders that may already contain a solution.

### The Two Core Superpowers

1. **Voice of the Voiceless** — Citizens record complaints in local language → AI transcribes, clusters similar complaints, drafts formal petitions to government
2. **Hyperlocal Wiki** — Elders record knowledge (farming, remedies, history) in local language → AI preserves, translates, and makes it searchable

### The Magic Link Feature

AI automatically connects active complaints to relevant elder wisdom already stored in the wiki. After every complaint is categorized, the system runs a semantic search across the village wiki:

- Complaint: "No water for 3 months" → Keywords: [water, shortage, village]
- Wiki Search: Finds Elder Ramappa's entry on Banda rainwater harvesting technique from 1970s
- Magic Link surfaces: Complaint card shows a yellow panel — "Community Wisdom Found" — with the elder's recording and a link to listen
- Result: Community can self-solve BEFORE the petition even reaches government

---

## 2. Problem Statement

Rural and semi-urban communities in India face two silent crises running in parallel:

**Crisis 1: Unheard Civic Complaints**
- Civic complaints (broken roads, water shortage, power cuts) go unheard because citizens lack access to formal channels, especially in regional languages
- Government systems receive no structured complaints and have no visibility into proven local solutions

**Crisis 2: Disappearing Generational Knowledge**
- Generational knowledge held by village elders — traditional farming techniques, water harvesting methods, natural remedies — is disappearing with no system to preserve or share it

Awaaz solves both crises with one platform and connects them with a feature no other app has — the Magic Link.

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js + TypeScript + Vite | UI, voice recording, all pages |
| **Backend** | Node.js + Express | API routes, Sarvam integration |
| **Database** | Firebase Firestore | Complaints, wiki entries, users |
| **Voice/AI** | Sarvam AI | |
| - STT | Sarvam Saaras v3 | Transcribe voice in Indian languages |
| - TTS | Sarvam Bulbul v3 | Read back content in local language |
| - LLM | Sarvam-M | Categorize, draft petitions, Magic Link |
| - Translation | Sarvam Translate API | Translate across 22 Indian languages |
| **Maps** | Google Maps API | Complaint heatmap by location |
| **Hosting** | Vercel | Deploy frontend instantly |

---

## 4. Folder Structure

```
awaaz/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceRecorder.tsx          # Voice recording component with waveform
│   │   │   ├── ComplaintCard.tsx          # Display complaint with category, petition, Magic Link
│   │   │   ├── MagicLinkPanel.tsx         # Yellow panel showing connected wiki wisdom
│   │   │   ├── WikiEntry.tsx              # Display elder knowledge entry
│   │   │   ├── PetitionDraft.tsx          # Display auto-generated petition
│   │   │   ├── HeatMap.tsx                # Google Maps heatmap component
│   │   │   ├── ComplaintCluster.tsx       # Show similar complaints count
│   │   │   └── SearchBar.tsx              # Multilingual wiki search
│   │   ├── pages/
│   │   │   ├── Home.tsx                   # Landing page
│   │   │   ├── RecordComplaint.tsx       # Voice complaint recording page
│   │   │   ├── Dashboard.tsx              # Complaint dashboard with stats
│   │   │   ├── Wiki.tsx                   # Community wiki browser
│   │   │   └── RecordWiki.tsx            # Elder knowledge recording page
│   │   ├── hooks/
│   │   │   ├── useVoiceRecorder.ts        # Voice recording hook
│   │   │   ├── useSarvamSTT.ts            # STT API hook
│   │   │   ├── useSarvamTTS.ts            # TTS API hook
│   │   │   ├── useComplaints.ts           # Firebase complaints hook
│   │   │   └── useWiki.ts                 # Firebase wiki hook
│   │   ├── services/
│   │   │   ├── sarvamSTT.ts               # Sarvam STT API service
│   │   │   ├── sarvamTTS.ts               # Sarvam TTS API service
│   │   │   ├── sarvamLLM.ts               # Sarvam-M LLM API service
│   │   │   ├── sarvamTranslate.ts         # Sarvam Translate API service
│   │   │   ├── firebase.ts                # Firebase config & initialization
│   │   │   └── maps.ts                    # Google Maps API service
│   │   ├── types/
│   │   │   ├── complaint.ts               # Complaint type definitions
│   │   │   ├── wiki.ts                    # Wiki entry type definitions
│   │   │   └── user.ts                    # User type definitions
│   │   ├── utils/
│   │   │   ├── clustering.ts              # Complaint clustering algorithm
│   │   │   └── magicLink.ts               # Semantic search for Magic Link
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── complaints.ts              # Complaint API routes
│   │   │   ├── wiki.ts                    # Wiki API routes
│   │   │   └── sarvam.ts                  # Sarvam proxy routes
│   │   ├── middleware/
│   │   │   └── auth.ts                    # Firebase auth middleware
│   │   ├── services/
│   │   │   ├── sarvamService.ts           # Centralized Sarvam API calls
│   │   │   └── firebaseService.ts         # Firebase admin SDK
│   │   └── server.ts                      # Express server entry
│   ├── package.json
│   └── tsconfig.json
├── .env.example
├── README.md
└── PLANNING.md
```

---

## 5. Core Features & MVP Scope

### Must Have — Demo-Critical

- ✅ Voice complaint recording in any Indian language
- ✅ Real-time transcription using Sarvam STT
- ✅ AI categorization of complaint (Infrastructure / Health / Agriculture / Corruption)
- ✅ Complaint clustering — show how many people have same complaint
- ✅ Auto petition drafting addressed to relevant government department
- ✅ Elder knowledge recording and wiki entry creation
- ✅ Multilingual search across the wiki
- ✅ Magic Link — automatic connection between complaint and relevant wiki wisdom

### Nice to Have — If Time Permits

- ⏳ Google Maps heatmap showing complaint density by area
- ⏳ Community upvoting of complaints
- ⏳ Offline-friendly mode for low connectivity areas
- ⏳ WhatsApp-style sharing of petitions

---

## 6. Component Breakdown

| Component | Description |
|-----------|-------------|
| **VoiceRecorder** | Records audio from browser mic, shows waveform animation, handles blob conversion |
| **ComplaintCard** | Displays complaint with transcription, category badge, department, petition preview |
| **MagicLinkPanel** | Yellow highlighted panel that surfaces connected wiki wisdom on complaint page |
| **WikiEntry** | Shows elder knowledge entry with original audio, transcript, translations, tags |
| **PetitionDraft** | Displays auto-generated formal petition letter with department address |
| **HeatMap** | Google Maps component showing complaint density by geographic area |
| **ComplaintCluster** | Shows count of similar complaints and links to cluster view |
| **SearchBar** | Multilingual search input that queries wiki entries across all languages |
| **Dashboard** | Main complaint dashboard with stats, filters, and complaint list |
| **RecordComplaint** | Full-page voice recording interface for submitting complaints |
| **RecordWiki** | Full-page interface for elders to record knowledge entries |
| **Wiki** | Wiki browser with search, filters, and entry cards |

---

## 7. Sarvam API Integration Plan

### API Base Configuration
- **Base URL**: `https://api.sarvam.ai`
- **Auth Header**: `api-subscription-key: YOUR_KEY`
- **Free Credits**: ₹1000 (more than enough for hackathon)

### Endpoint Mapping to Features

| Sarvam API Endpoint | Feature in Awaaz | Implementation |
|---------------------|------------------|----------------|
| `POST /speech-to-text` | **Complaint Transcription** | User records complaint → Send audio blob → Receive transcribed text → Display in UI |
| `POST /speech-to-text` | **Wiki Entry Transcription** | Elder records knowledge → Send audio blob → Receive transcribed text → Store in Firestore |
| `POST /translate` | **Wiki Multilingual Support** | After transcription, translate to English + Hindi → Store all versions → Enable cross-language search |
| `POST /v1/chat/completions` (Sarvam-M) | **Complaint Categorization** | Send transcribed complaint → LLM extracts category (Infrastructure/Health/Agriculture/Corruption) → Store category |
| `POST /v1/chat/completions` (Sarvam-M) | **Petition Drafting** | Send complaint + category → LLM generates formal petition letter → Address to correct department → Display in UI |
| `POST /v1/chat/completions` (Sarvam-M) | **Magic Link Semantic Search** | After complaint categorization → Extract keywords → Query LLM to find semantically similar wiki entries → Return matches |
| `POST /text-to-speech` | **Wiki Audio Playback** | When user clicks elder's entry → Convert transcript to audio in original language → Play back via TTS |

### Service File Structure

Each Sarvam API gets its own service file in `frontend/src/services/`:

- `sarvamSTT.ts` — Handles audio → text transcription
- `sarvamTTS.ts` — Handles text → audio synthesis
- `sarvamLLM.ts` — Handles categorization, petition drafting, Magic Link search
- `sarvamTranslate.ts` — Handles translation between 22 Indian languages

---

## 8. Firebase Schema

### Collection: `complaints`

```typescript
{
  id: string;                    // Auto-generated document ID
  userId: string;                // Reference to users collection
  audioUrl: string;              // Storage path to audio blob
  transcription: string;         // Transcribed text (original language)
  language: string;              // Detected language code (e.g., "hi", "ta", "te")
  category: string;              // Infrastructure | Health | Agriculture | Corruption
  keywords: string[];            // Extracted keywords for clustering
  location: {
    lat: number;
    lng: number;
    village: string;
    district: string;
    state: string;
  };
  department: string;            // Target government department
  petition: string;              // Auto-generated petition text
  clusterId: string;             // ID of complaint cluster (for grouping)
  magicLinkWikiIds: string[];   // Array of wiki entry IDs connected via Magic Link
  status: string;               // pending | submitted | resolved
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `wikiEntries`

```typescript
{
  id: string;                    // Auto-generated document ID
  elderId: string;               // Reference to users collection (elder)
  elderName: string;             // Display name
  audioUrl: string;              // Storage path to audio blob
  transcription: {
    original: string;            // Original language transcription
    english: string;             // English translation
    hindi: string;              // Hindi translation
  };
  language: string;              // Original language code
  title: string;                // AI-generated title
  category: string;             // Farming | Remedies | History | Water | etc.
  tags: string[];               // AI-generated tags for search
  location: {
    village: string;
    district: string;
    state: string;
  };
  description: string;           // AI-generated summary
  createdAt: Timestamp;
}
```

### Collection: `users`

```typescript
{
  id: string;                    // Firebase Auth UID
  name: string;
  email: string;
  phone: string;
  role: string;                 // citizen | elder | admin
  location: {
    village: string;
    district: string;
    state: string;
  };
  createdAt: Timestamp;
}
```

### Collection: `clusters` (Optional — for complaint grouping)

```typescript
{
  id: string;                    // Cluster ID
  complaintIds: string[];        // Array of complaint document IDs
  category: string;
  location: {
    village: string;
    district: string;
  };
  count: number;                // Number of complaints in cluster
  createdAt: Timestamp;
}
```

---

## 9. 24-Hour Timeline

### Team Roles
- **P1**: Frontend Developer (React UI, pages, responsive design)
- **P2**: Voice & API Integration (Sarvam STT/TTS, voice recorder, audio handling)
- **P3**: AI Logic Developer (Sarvam-M prompts, categorization, petition drafting, Magic Link)
- **P4**: Backend & Infra (Firebase setup, Express routes, Maps, Vercel deployment)

| Time Block | Hours | Tasks | Owner |
|------------|-------|-------|-------|
| **Setup & Planning** | 0:00 – 1:00 | Repo setup, Firebase project, Sarvam API key, design DB schema, assign tasks | All |
| **Voice Foundation** | 1:00 – 4:00 | Voice recorder component, Sarvam STT connection, transcription display on UI | P2 + P1 |
| **Complaint Engine** | 4:00 – 8:00 | Categorization logic, complaint storage in Firebase, basic complaint list UI | P3 + P1 |
| **Clustering + Petition** | 8:00 – 12:00 | Complaint clustering algorithm, auto-petition drafting with Sarvam-M, petition display | P3 + P1 |
| **Wiki Side** | 12:00 – 16:00 | Elder recording UI, wiki storage, translation, tagging, search functionality | P2 + P1 |
| **Magic Link** | 16:00 – 19:00 | Semantic search connecting complaints to wiki, Magic Link UI card component | P3 + P1 |
| **Dashboard + Maps** | 19:00 – 21:00 | Complaint dashboard, Google Maps heatmap, community stats view | P4 + P1 |
| **Polish & Bug Fix** | 21:00 – 23:00 | UI polish, bug fixes, edge cases, loading states, error handling | All |
| **Demo Prep** | 23:00 – 24:00 | Demo script practice, record 2-min video, test all flows end-to-end | All |

---

## 10. Demo Script

Follow this exact script during the live demo. Each step should take 1-2 minutes. Total demo: 8-10 minutes.

| Step | Action | What Judges See |
|------|--------|-----------------|
| **1 — Hook** | Open the app on screen. Say: "What if your village could speak?" | Clean landing page with Awaaz branding |
| **2 — Complaint** | Click Record Complaint. Speak in Hindi/Tamil: a water shortage complaint | Live voice recording, waveform animation |
| **3 — AI Magic** | Stop recording. Wait 3 seconds. Transcription appears. Category auto-fills. Department auto-selected. | Transcription, category badge, department name |
| **4 — Clustering** | Click 'Find Similar Complaints' | Map shows 47 people had same complaint in same area |
| **5 — Petition** | Click 'Draft Petition' | Formal petition letter appears in English, addressed to PWD department |
| **6 — Magic Link** | Scroll down on complaint page | Yellow card: 'Community Wisdom Found — Elder Ramappa's rainwater technique' |
| **7 — Wiki** | Click the link. Switch to Wiki tab. Elder's voice recording plays in Hindi. Transcript + English translation shown. | Wiki entry with audio player, multilingual content |
| **8 — Search** | Type 'water' in English search bar | Elder's entry appears. Multilingual match confirmed. |
| **9 — Close** | Say: 'The government gets a petition. The village gets its memory back.' | Judges remember this line. |

---

## Quick Reference

### Sarvam API Endpoints

| API Endpoint | Use In Awaaz |
|--------------|--------------|
| `POST /speech-to-text` | Transcribe complaint & wiki voice recordings |
| `POST /translate` | Translate between all 22 Indian languages |
| `POST /v1/chat/completions` | Categorize complaints, draft petitions, Magic Link |
| `POST /text-to-speech` | Read back elder wisdom in local language |

### Why Awaaz Wins

- **Uniqueness**: No other team will connect civic complaints to community wisdom — this is a first
- **Social Impact**: Dual impact: civic empowerment + cultural preservation + language inclusion
- **Technical Depth**: Sarvam AI for 22 Indian languages, real-time STT, LLM petition drafting, semantic search
- **Working Demo**: Every feature is live and demonstrable — no slides-only explanations
- **Wow Moment**: The Magic Link surfacing elder wisdom during a live complaint is emotionally unforgettable
- **Story**: "Before we ask the government, let's ask our elders" — judges will quote this

---

**Build it. Demo it. Win it. 🏆**

*Awaaz — PROTOWAR 1.0 | Open Innovation Track*
