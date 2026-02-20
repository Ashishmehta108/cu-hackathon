import { Request, Response } from 'express';
import * as sarvamService from '../services/sarvamService';
import * as vectorService from '../services/vectorService';

// ─── Speech-to-Text ──────────────────────────────────────────────────────────

export async function stt(req: Request, res: Response): Promise<void> {
    const buffer = req.file!.buffer;
    const language = (req.body.language as string) || 'auto';

    const result = await sarvamService.speechToText(buffer, language);
    res.json(result); // { text, language }
}

// ─── Translate ───────────────────────────────────────────────────────────────

export async function translate(req: Request, res: Response): Promise<void> {
    const { text, sourceLang, targetLang } = req.body;
    const translatedText = await sarvamService.translate(text, sourceLang, targetLang);
    res.json({ translatedText });
}

// ─── Categorize ──────────────────────────────────────────────────────────────

export async function categorize(req: Request, res: Response): Promise<void> {
    const { text } = req.body;
    const result = await sarvamService.categorizeComplaint(text);
    res.json(result); // { category, keywords, department }
}

// ─── Petition Drafting ───────────────────────────────────────────────────────

export async function petition(req: Request, res: Response): Promise<void> {
    const { complaint, category, department, location, clusterCount } = req.body;
    const text = await sarvamService.draftPetition({
        complaint,
        category,
        department,
        location,
        clusterCount: clusterCount ?? 0,
    });
    res.json({ petition: text });
}

// ─── Text-to-Speech ──────────────────────────────────────────────────────────

export async function tts(req: Request, res: Response): Promise<void> {
    const { text, language } = req.body;
    const audioBase64 = await sarvamService.textToSpeech(text, language);
    res.json({ audioBase64 });
}

// ─── Magic Link (Vector Search) ──────────────────────────────────────────────

export async function magicLink(req: Request, res: Response): Promise<void> {
    const { complaintText } = req.body;
    const matches = await vectorService.searchSimilar(complaintText, 3);
    res.json({ matches });
}

// ─── Process Wiki Entry (combined pipeline) ───────────────────────────────────

export async function processWiki(req: Request, res: Response): Promise<void> {
    const { transcription, language } = req.body;
    const result = await sarvamService.processWikiEntry(transcription, language);
    res.json(result);
}
