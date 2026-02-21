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
    imageUrl?: string;   // optional image URL with embedded timestamp
    imageTimestamp?: string; // timestamp when image was uploaded
    clusterId?: string;  // cluster key: category|village|district|state
    clusterCount?: number; // number of complaints in same cluster (same category + location)
    escalationLevel?: number; // escalation level: 0 (initial), 1 (after 3 days), 2 (after 7 days), 3 (after 15 days)
    lastEscalationDate?: string; // date of last escalation
    statusHistory?: { status: ComplaintStatus; timestamp: string; notes?: string }[]; // status change history
    emails?: { type: 'sent' | 'received'; to?: string; from?: string; subject: string; body: string; timestamp: string }[]; // email communications
    createdAt?: string;
    updatedAt?: string;
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
    createdAt?: string;
    updatedAt?: string;
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
    isGenuine: boolean;
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
    elderName?: string;
    village?: string;
}

export interface MagicLinkResult {
    matches: MagicLinkMatch[];
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiError {
    error: string;
    details?: string;
}
