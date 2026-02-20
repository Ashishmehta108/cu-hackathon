// ─── Complaint ───────────────────────────────────────────────────────────────

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';
export type ComplaintCategory =
    | 'Infrastructure'
    | 'Health'
    | 'Agriculture'
    | 'Water'
    | 'Education'
    | 'Corruption'
    | 'Other';

export interface Location {
    village: string;
    district: string;
    state: string;
}

export interface Complaint {
    id?: string;
    text: string;        // original complaint text in any language
    language: string;    // Sarvam language code (e.g. 'hi', 'ta')
    category: ComplaintCategory;
    keywords: string[];
    department: string;
    location: Location;
    status: ComplaintStatus;
    petition?: string;   // generated petition text
    audioUrl?: string;   // optional original audio URL
    clusterCount?: number; // similar complaints count found via Magic Link
    createdAt?: FirebaseFirestore.Timestamp | string;
    updatedAt?: FirebaseFirestore.Timestamp | string;
}

// ─── Wiki ────────────────────────────────────────────────────────────────────

export type WikiCategory =
    | 'Farming'
    | 'Water Management'
    | 'Natural Remedies'
    | 'History'
    | 'Festivals'
    | 'Crafts'
    | 'Other';

export interface WikiEntry {
    id?: string;
    transcription: string;     // original transcription
    language: string;          // source language code
    english: string;           // English translation
    hindi: string;             // Hindi translation
    title: string;             // generated title
    category: WikiCategory;
    tags: string[];
    description: string;       // 2-3 sentence summary
    elderName?: string;
    village?: string;
    audioUrl?: string;
    createdAt?: FirebaseFirestore.Timestamp | string;
    updatedAt?: FirebaseFirestore.Timestamp | string;
}

// ─── Sarvam AI ───────────────────────────────────────────────────────────────

export interface SttResult {
    text: string;
    language: string;
}

export interface TranslateResult {
    translatedText: string;
}

export interface CategorizeResult {
    category: ComplaintCategory;
    keywords: string[];
    department: string;
}

export interface PetitionResult {
    petition: string;
}

export interface TtsResult {
    audioBase64: string;
}

export interface ProcessWikiResult {
    english: string;
    hindi: string;
    title: string;
    category: WikiCategory;
    tags: string[];
    description: string;
}

export interface MagicLinkMatch {
    wikiId: string;
    score: number;
    title: string;
}

export interface MagicLinkResult {
    matches: MagicLinkMatch[];
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiError {
    error: string;
    details?: string;
}
