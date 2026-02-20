import fetch from 'node-fetch';
import FormData from 'form-data';
import dotenv from 'dotenv';
import type { CategorizeResult, ProcessWikiResult, WikiCategory, ComplaintCategory } from '../types';
import { findDepartmentContact, draftEmail } from './agentService';

dotenv.config();

const API_KEY = process.env.SARVAM_API_KEY ?? '';
const BASE_URL = process.env.SARVAM_BASE_URL ?? 'https://api.sarvam.ai';

const headers = () => ({
    'api-subscription-key': API_KEY,
});

// Map simple language codes (hi, en, ta, etc.) to Sarvam's required codes.
// Translate API uses 'auto' for language detection.
function toSarvamLanguageCode(code: string | undefined | null): string {
    if (!code || code.toLowerCase() === 'auto') {
        return 'auto';
    }

    const normalized = code.toLowerCase();
    const map: Record<string, string> = {
        // Short codes
        en: 'en-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
        pa: 'pa-IN',
        gu: 'gu-IN',
        or: 'od-IN',
        od: 'od-IN',
        ne: 'ne-IN',
        ur: 'ur-IN',
        as: 'as-IN',
        // Already-correct codes (pass-through)
        'en-in': 'en-IN',
        'hi-in': 'hi-IN',
        'ta-in': 'ta-IN',
        'te-in': 'te-IN',
        'kn-in': 'kn-IN',
        'ml-in': 'ml-IN',
        'mr-in': 'mr-IN',
        'bn-in': 'bn-IN',
        'pa-in': 'pa-IN',
        'gu-in': 'gu-IN',
        'od-in': 'od-IN',
        'ne-in': 'ne-IN',
        'ur-in': 'ur-IN',
        'as-in': 'as-IN',
    };

    return map[normalized] ?? 'auto';
}

// STT API uses 'unknown' instead of 'auto' for language auto-detection.
function toSarvamSTTLanguageCode(code: string | undefined | null): string {
    const mapped = toSarvamLanguageCode(code);
    return mapped === 'auto' ? 'unknown' : mapped;
}

// Sarvam-M has ~7k token limit. Keep prompts concise. ~1 token ≈ 4 chars.
const MAX_CONTEXT_CHARS = 20000; // ~5k tokens buffer for safety

/** Truncate text to stay under token limit. Exported for agentService. */
export function truncateForTokens(text: string, maxChars = MAX_CONTEXT_CHARS): string {
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars) + '\n\n[...truncated for token limit]';
}

// ─── LLM Prompt Templates (concise for 7k token limit) ─────────────────────────

const CATEGORIZE_SYSTEM_PROMPT = `Classify Indian civic complaints. Output ONLY valid JSON:
{"category":"Infrastructure|Health|Agriculture|Water|Education|Corruption|Other","keywords":["word1","word2","word3"],"department":"Indian govt department name"}`;

const PETITION_SYSTEM_PROMPT = `Draft a formal petition to an Indian govt department. English, 150-200 words. Include: department head address, complaint, location, action requested. End: "Yours faithfully, The Citizens of [village/district]". Output the petition text only.`;

const WIKI_PROCESS_PROMPT = `Process elder wisdom. Output ONLY valid JSON:
{"title":"5-10 word title","category":"Farming|Water Management|Natural Remedies|History|Festivals|Crafts|Other","tags":["tag1","tag2"],"description":"2-3 sentence summary"}`;

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Calls Sarvam Speech-to-Text API.
 * @param audioBuffer  Raw audio bytes from multer memory storage
 * @param language     Simple language code (e.g. 'hi'), full code (e.g. 'hi-IN'), or 'auto' for detection
 */
export async function speechToText(
    audioBuffer: Buffer,
    language = 'auto',
    mimetype = 'audio/wav'
): Promise<{ text: string; language: string }> {
    const extension = mimetype.split(';')[0].split('/')[1] || 'wav';
    const filename = `audio.${extension}`;

    const form = new FormData();
    form.append('file', audioBuffer, { filename, contentType: mimetype });
    form.append('model', 'saaras:v3');
    form.append('language_code', toSarvamSTTLanguageCode(language)); // STT uses 'unknown' for auto-detect

    const response = await fetch(`${BASE_URL}/speech-to-text`, {
        method: 'POST',
        headers: { ...headers(), ...form.getHeaders() },
        body: form,
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Sarvam STT failed (${response.status}): ${err}`);
    }

    const data = (await response.json()) as { transcript: string; language_code: string };
    return { text: data.transcript, language: data.language_code };
}

/**
 * Calls Sarvam Translate API.
 */
export async function translate(
    text: string,
    sourceLang: string,
    targetLang: string
): Promise<string> {
    const response = await fetch(`${BASE_URL}/translate`, {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
            input: text,
            source_language_code: toSarvamLanguageCode(sourceLang),
            target_language_code: toSarvamLanguageCode(targetLang),
            model: 'mayura:v1',
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Sarvam Translate failed (${response.status}): ${err}`);
    }

    const data = (await response.json()) as { translated_text: string };
    return data.translated_text;
}

/**
 * Calls Sarvam LLM Chat Completions.
 */
export async function chatCompletion(
    systemPrompt: string,
    userMessage: string
): Promise<string> {
    const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'sarvam-m',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Sarvam LLM failed (${response.status}): ${err}`);
    }

    const data = (await response.json()) as {
        choices: { message: { content: string } }[];
    };
    return data.choices[0].message.content;
}

/**
 * Calls Sarvam Text-to-Speech API.
 */
export async function textToSpeech(text: string, language: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/text-to-speech`, {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
            inputs: [text],
            target_language_code: toSarvamLanguageCode(language),
            model: 'bulbul:v3',
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Sarvam TTS failed (${response.status}): ${err}`);
    }

    const data = (await response.json()) as { audios: string[] };
    return data.audios[0];
}

// ─── Higher-level helpers (used by controllers) ───────────────────────────────

/**
 * Categorizes a complaint text via LLM and returns structured result.
 */
export async function categorizeComplaint(text: string): Promise<CategorizeResult> {
    const input = truncateForTokens(text, 2000);
    const raw = await chatCompletion(CATEGORIZE_SYSTEM_PROMPT, input);
    try {
        const jsonMatch = raw.match(/\{[\s\S]*?\}/);
        const cleaned = jsonMatch ? jsonMatch[0] : raw.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned) as CategorizeResult;
    } catch {
        throw new Error(`Failed to parse categorization response: ${raw}`);
    }
}

/**
 * Drafts a formal petition letter from structured complaint data.
 */
export async function draftPetition(params: {
    complaint: string;
    category: string;
    department: string;
    location: { village: string; district: string; state: string };
    clusterCount: number;
}): Promise<string> {
    const complaint = truncateForTokens(params.complaint, 800);
    const userMessage = `Complaint: ${complaint}
Category: ${params.category}
Department: ${params.department}
Location: ${params.location.village}, ${params.location.district}, ${params.location.state}
Similar complaints: ${params.clusterCount}`;

    return chatCompletion(PETITION_SYSTEM_PROMPT, userMessage);
}

/**
 * Processes a wiki transcription: translate to EN + HI, extract metadata.
 */
export async function processWikiEntry(
    transcription: string,
    language: string
): Promise<{ english: string; hindi: string; title: string; category: WikiCategory; tags: string[]; description: string }> {
    const [english, hindi] = await Promise.all([
        translate(transcription, language, 'en'),
        translate(transcription, language, 'hi'),
    ]);

    const englishInput = truncateForTokens(english, 3000);
    const raw = await chatCompletion(WIKI_PROCESS_PROMPT, englishInput);
    let metadata: { title: string; category: WikiCategory; tags: string[]; description: string };
    try {
        const jsonMatch = raw.match(/\{[\s\S]*?\}/);
        const cleaned = jsonMatch ? jsonMatch[0] : raw.replace(/```json|```/g, '').trim();
        metadata = JSON.parse(cleaned);
    } catch {
        throw new Error(`Failed to parse wiki metadata response: ${raw}`);
    }

    return { english, hindi, ...metadata };
}

export { findDepartmentContact, draftEmail };