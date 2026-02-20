 PDF To Markdown Converter
Debug View
Result View
# AWAAZ

## Voice of the Community

##### Hackathon Project Planning Document

###### Track: Open Innovation | PROTOWAR 1.

###### Duration: 24 Hours | Stack: Sarvam AI + React + Firebase

## 1. Project Overview

Awaaz is a hyperlocal community intelligence platform that bridges civic complaints with traditional
community wisdom. Citizens can voice complaints in any Indian language, which AI escalates to the
relevant government authority — while simultaneously connecting those problems with documented
knowledge from village elders that may already contain a solution.

###### The Two Superpowers:

- Voice of the Voiceless **— Citizens record complaints in local language → AI transcribes,**
    clusters similar complaints, drafts formal petitions to government
- Hyperlocal Wiki **—** Elders record knowledge (farming, remedies, history) in local language
    **→ AI preserves, translates, and makes it searchable**
- The Magic Link **—** AI automatically connects active complaints to relevant elder wisdom
    already stored in the wiki

## 2. Problem Statement

Rural and semi-urban communities in India face two silent crises running in parallel:

- Civic complaints (broken roads, water shortage, power cuts) go unheard because citizens lack
    access to formal channels, especially in regional languages
- Generational knowledge held by village elders — traditional farming techniques, water harvesting
    methods, natural remedies — is disappearing with no system to preserve or share it
- Government systems are disconnected from both: they receive no structured complaints AND
    have no visibility into proven local solutions

Awaaz solves both crises with one platform and connects them with a feature no other app has — the
Magic Link.

## 3. Solution Architecture

#### 3.1 Side A — Complaint Engine


```
Step What Happens Technology
```
```
1 User records voice complaint in any
Indian language
```
```
Web Browser + Mic API
```
```
2 AI transcribes audio to text Sarvam Saaras v3 (STT)
```
```
3 AI categorizes and extracts keywords Sarvam-M LLM
```
```
4 System finds similar complaints from
same area
```
```
Firebase + clustering logic
```
```
5 Auto-drafts formal petition to correct
dept.
```
```
Sarvam-M LLM
```
```
6 Magic Link searches wiki for related
wisdom
```
```
Sarvam-M + Firebase query
```
```
7 Complaint + petition + link shown on
dashboard
```
```
React Frontend
```
#### 3.2 Side B — Community Wiki

```
Step What Happens Technology
```
```
1 Elder records voice/video knowledge
entry
```
```
Web Browser + Mic API
```
```
2 AI transcribes in local language Sarvam Saaras v3 (STT)
```
```
3 AI translates to English + Hindi Sarvam Translate API
```
```
4 AI tags and categorizes the entry Sarvam-M LLM
```
```
5 Entry stored in village's knowledge
base
```
```
Firebase Firestore
```
```
6 Searchable by anyone in any language Firebase + Sarvam Translate
```
#### 3.3 The Magic Link — How It Works

After every complaint is categorized, the system runs a semantic search across the village wiki:

- Complaint: "No water for 3 months" → Keywords: [water, shortage, village]
- Wiki Search: Finds Elder Ramappa's entry on Banda rainwater harvesting technique from 1970s
- Magic Link surfaces: Complaint card shows a yellow panel — "Community Wisdom Found" —
    with the elder's recording and a link to listen
- Result: Community can self-solve BEFORE the petition even reaches government

## 4. Technology Stack

```
Layer Technology Purpose Cost
```

```
Frontend React.js + Vite UI, voice recording, all pages Free
```
```
Backend Node.js + Express API routes, Sarvam
integration
```
```
Free
```
```
Database Firebase Firestore Complaints, wiki entries,
users
```
```
Free tier
```
```
Speech-to-Text Sarvam Saaras v3 Transcribe voice in Indian
languages
```
```
₹1000 free
credits
```
```
Translation Sarvam Translate API Translate across 22 Indian
languages
```
```
Included in
credits
```
```
AI/LLM Sarvam-M Categorize, draft petitions,
Magic Link
```
```
Included in
credits
```
```
Text-to-Speech Sarvam Bulbul v3 Read back content in local
language
```
```
Included in
credits
```
```
Maps Google Maps API Complaint heatmap by
location
```
```
Free tier
```
```
Hosting Vercel Deploy frontend instantly Free
```
## 5. Core Features (MVP for 24 Hours)

#### Must Have — Demo-Critical

- Voice complaint recording in any Indian language
- Real-time transcription using Sarvam STT
- AI categorization of complaint (Infrastructure / Health / Agriculture / Corruption)
- Complaint clustering — show how many people have same complaint
- Auto petition drafting addressed to relevant government department
- Elder knowledge recording and wiki entry creation
- Multilingual search across the wiki
- Magic Link — automatic connection between complaint and relevant wiki wisdom

#### Nice to Have — If Time Permits

- Google Maps heatmap showing complaint density by area
- Community upvoting of complaints
- Offline-friendly mode for low connectivity areas
- WhatsApp-style sharing of petitions

## 6. Team Roles & Responsibilities

```
Person Role Tasks
```

```
Person 1 Frontend Developer React UI, all pages (Home, Record, Wiki, Dashboard), responsive
design, demo polish
```
```
Person 2 Voice & API
Integration
```
```
Sarvam STT + TTS integration, voice recorder component, audio
blob handling
```
```
Person 3 AI Logic Developer Sarvam-M prompts for categorization, petition drafting, Magic Link
search logic, translation
```
```
Person 4 Backend & Infra Firebase setup, Express API routes, Maps integration, Vercel
deployment, glue code
```
## 7. 24-Hour Build Timeline

```
Time Block Hours Tasks Owner
```
```
Setup & Planning 0:00 – 1:00 Repo setup, Firebase project, Sarvam API
key, design DB schema, assign tasks
```
```
All
```
```
Voice Foundation 1:00 – 4:00 Voice recorder component, Sarvam STT
connection, transcription display on UI
```
```
P2 + P
```
```
Complaint Engine 4:00 – 8:00 Categorization logic, complaint storage in
Firebase, basic complaint list UI
```
```
P3 + P
```
```
Clustering + Petition 8:00 – 12:00 Complaint clustering algorithm, auto-petition
drafting with Sarvam-M, petition display
```
```
P3 + P
```
```
Wiki Side 12:00 –
16:
```
```
Elder recording UI, wiki storage, translation,
tagging, search functionality
```
```
P2 + P
```
```
Magic Link 16:00 –
19:
```
```
Semantic search connecting complaints to
wiki, Magic Link UI card component
```
```
P3 + P
```
```
Dashboard + Maps 19:00 –
21:
```
```
Complaint dashboard, Google Maps heatmap,
community stats view
```
```
P4 + P
```
```
Polish & Bug Fix 21:00 –
23:
```
```
UI polish, bug fixes, edge cases, loading
states, error handling
```
```
All
```
```
Demo Prep 23:00 –
24:
```
```
Demo script practice, record 2-min video, test
all flows end-to-end
```
```
All
```
## 8. Demo Script for Judges

Follow this exact script during the live demo. Each step should take 1-2 minutes. Total demo: 8- 10
minutes.

```
Step Action What Judges See
```

```
1 — Hook Open the app on screen. Say: "What if
your village could speak?"
```
```
Clean landing page with Awaaz branding
```
```
2 —
Complaint
```
```
Click Record Complaint. Speak in
Hindi/Tamil: a water shortage
complaint
```
```
Live voice recording, waveform animation
```
```
3 — AI Magic Stop recording. Wait 3 seconds. Transcription appears. Category auto-fills.
Department auto-selected.
```
```
4 —
Clustering
```
```
Click 'Find Similar Complaints' Map shows 47 people had same complaint in
same area
```
```
5 — Petition Click 'Draft Petition' Formal petition letter appears in English,
addressed to PWD department
```
```
6 — Magic
Link
```
```
Scroll down on complaint page Yellow card: 'Community Wisdom Found — Elder
Ramappa's rainwater technique'
```
```
7 — Wiki Click the link. Switch to Wiki tab. Elder's voice recording plays in Hindi. Transcript +
English translation shown.
```
```
8 — Search Type 'water' in English search bar Elder's entry appears. Multilingual match
confirmed.
```
```
9 — Close Say: 'The government gets a petition.
The village gets its memory back.'
```
```
Judges remember this line.
```
## 9. Sarvam API Quick Reference

#### Getting Started

- Sign up at sarvam.ai → get ₹1000 free credits (more than enough for hackathon)
- All APIs use base URL: https://api.sarvam.ai
- Auth header: api-subscription-key: YOUR_KEY

#### Key API Endpoints

```
API Endpoint Use In Awaaz
```
```
Speech-to-Text POST /speech-to-text Transcribe complaint & wiki voice recordings
```
```
Translate POST /translate Translate between all 22 Indian languages
```
```
Sarvam-M (LLM) POST /v1/chat/completions Categorize complaints, draft petitions, Magic Link
```
```
Text-to-Speech POST /text-to-speech Read back elder wisdom in local language
```
## 10. Why Awaaz Wins


Judging Criterion Awaaz Advantage

Uniqueness No other team will connect civic complaints to community wisdom — this is
a first

Social Impact Dual impact: civic empowerment + cultural preservation + language
inclusion

Technical Depth Sarvam AI for 22 Indian languages, real-time STT, LLM petition drafting,
semantic search

Working Demo Every feature is live and demonstrable — no slides-only explanations

Wow Moment The Magic Link surfacing elder wisdom during a live complaint is
emotionally unforgettable

Story 'Before we ask the government, let's ask our elders' — judges will quote
this

### Build it. Demo it. Win it. 🏆

```
Awaaz — PROTOWAR 1.0 | Open Innovation Track
```


This is a offline tool, your data stays locally and is not send to any server!
Feedback & Bug Reports