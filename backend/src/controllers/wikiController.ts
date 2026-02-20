import { Request, Response } from 'express';
import * as wikiService from '../services/wikiService';
import * as vectorService from '../services/vectorService';
import type { WikiCategory } from '../types';

// ─── Create ───────────────────────────────────────────────────────────────────

export async function create(req: Request, res: Response): Promise<void> {
    const {
        transcription, language, english, hindi,
        title, category, tags, description,
        elderName, village, audioUrl,
    } = req.body;

    const entry = await wikiService.createWikiEntry({
        transcription, language, english, hindi,
        title, category: category as WikiCategory, tags,
        description, elderName, village, audioUrl,
    });

    // Upsert into Pinecone for Magic Link search
    if (entry.id && entry.english) {
        await vectorService.upsertWikiEntry(entry.id, entry.english, {
            title: entry.title ?? '',
            category: entry.category ?? '',
            tags: (entry.tags ?? []).join(','),
            elderName: entry.elderName ?? '',
            village: entry.village ?? '',
        });
    }

    res.status(201).json(entry);
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function list(req: Request, res: Response): Promise<void> {
    const { category, village, tag } = req.query;

    const entries = await wikiService.getWikiEntries({
        category: category as string | undefined,
        village: village as string | undefined,
        tag: tag as string | undefined,
    });

    res.json(entries);
}

// ─── Get by ID ────────────────────────────────────────────────────────────────

export async function getById(req: Request, res: Response): Promise<void> {
    const entry = await wikiService.getWikiEntryById(req.params.id);
    if (!entry) {
        res.status(404).json({ error: 'Wiki entry not found' });
        return;
    }
    res.json(entry);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function update(req: Request, res: Response): Promise<void> {
    const updated = await wikiService.updateWikiEntry(req.params.id, req.body);
    if (!updated) {
        res.status(404).json({ error: 'Wiki entry not found' });
        return;
    }

    // Re-upsert vector if english text changed
    if (req.body.english && updated.id) {
        await vectorService.upsertWikiEntry(updated.id, updated.english, {
            title: updated.title ?? '',
            category: updated.category ?? '',
            tags: (updated.tags ?? []).join(','),
            elderName: updated.elderName ?? '',
            village: updated.village ?? '',
        });
    }

    res.json(updated);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function remove(req: Request, res: Response): Promise<void> {
    const deleted = await wikiService.deleteWikiEntry(req.params.id);
    if (!deleted) {
        res.status(404).json({ error: 'Wiki entry not found' });
        return;
    }

    // Remove from Pinecone too
    await vectorService.deleteWikiEntry(req.params.id);

    res.json({ message: 'Wiki entry deleted successfully' });
}

// ─── Tag Search ───────────────────────────────────────────────────────────────

export async function searchByTags(req: Request, res: Response): Promise<void> {
    const tags = (req.query.tags as string)?.split(',').map((t) => t.trim()) ?? [];
    if (tags.length === 0) {
        res.status(400).json({ error: 'Provide at least one tag via ?tags=tag1,tag2' });
        return;
    }
    const entries = await wikiService.searchWikiByTags(tags);
    res.json(entries);
}
