import { Request, Response } from 'express';
import * as sarvamService from '../services/sarvamService';
import * as vectorService from '../services/vectorService';

// ─── Speech-to-Text ──────────────────────────────────────────────────────────

export async function stt(req: Request, res: Response): Promise<void> {
    const buffer = req.file!.buffer;
    const mimetype = req.file!.mimetype;
    const language = (req.body.language as string) || 'unknown';
    console.log('language', language, 'mimetype', mimetype);

    const result = await sarvamService.speechToText(buffer, language, mimetype);
    console.log('result', result);
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

    // Run both in parallel for efficiency
    const [petitionText, contactInfo] = await Promise.all([
        sarvamService.draftPetition({
            complaint,
            category,
            department,
            location,
            clusterCount: clusterCount ?? 0,
        }),
        sarvamService.findDepartmentContact(department, `${location.district}, ${location.state}`)
    ]);

    res.json({
        petition: petitionText,
        contact: contactInfo
    });
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

// ─── Department Contact Agent ──────────────────────────────────────────────

export async function findContact(req: Request, res: Response): Promise<void> {
    const { department, location } = req.body;
    const result = await sarvamService.findDepartmentContact(department, location);
    res.json(result);
}

export async function draftEmail(req: Request, res: Response): Promise<void> {
    const { complaint, department, location, recipientEmail } = req.body;
    const result = await sarvamService.draftEmail({
        complaint,
        department,
        location,
        recipientEmail,
    });
    res.json(result);
}
