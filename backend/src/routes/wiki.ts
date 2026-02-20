import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireBody } from '../middlewares/validators';
import * as wikiController from '../controllers/wikiController';

export const wikiRoutes = Router();

// GET  /api/wiki            — list all (with optional ?category=&village=&tag=)
wikiRoutes.get('/', asyncHandler(wikiController.list));

// GET  /api/wiki/search     — search by tags (?tags=water,farming)
wikiRoutes.get('/search', asyncHandler(wikiController.searchByTags));

// GET  /api/wiki/:id        — get single entry
wikiRoutes.get('/:id', asyncHandler(wikiController.getById));

// POST /api/wiki            — create new entry (expects pre-processed fields)
wikiRoutes.post(
    '/',
    requireBody('transcription', 'language', 'english', 'hindi', 'title', 'category', 'tags', 'description'),
    asyncHandler(wikiController.create)
);

// PATCH /api/wiki/:id       — partial update
wikiRoutes.patch('/:id', asyncHandler(wikiController.update));

// DELETE /api/wiki/:id      — delete + remove from Pinecone
wikiRoutes.delete('/:id', asyncHandler(wikiController.remove));
