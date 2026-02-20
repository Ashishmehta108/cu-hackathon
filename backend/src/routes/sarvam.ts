import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler';
import { requireBody, requireFile } from '../middlewares/validators';
import * as sarvamController from '../controllers/sarvamController';

export const sarvamRoutes = (upload: multer.Multer) => {
    const router = Router();

    // POST /api/sarvam/stt
    router.post(
        '/stt',
        upload.single('audio'),
        requireFile,
        asyncHandler(sarvamController.stt)
    );

    // POST /api/sarvam/translate
    router.post(
        '/translate',
        requireBody('text', 'sourceLang', 'targetLang'),
        asyncHandler(sarvamController.translate)
    );

    // POST /api/sarvam/categorize
    router.post(
        '/categorize',
        requireBody('text'),
        asyncHandler(sarvamController.categorize)
    );

    // POST /api/sarvam/petition
    router.post(
        '/petition',
        requireBody('complaint', 'category', 'department', 'location'),
        asyncHandler(sarvamController.petition)
    );

    // POST /api/sarvam/tts
    router.post(
        '/tts',
        requireBody('text', 'language'),
        asyncHandler(sarvamController.tts)
    );

    // POST /api/sarvam/magic-link
    router.post(
        '/magic-link',
        requireBody('complaintText'),
        asyncHandler(sarvamController.magicLink)
    );

    // POST /api/sarvam/process-wiki
    router.post(
        '/process-wiki',
        requireBody('transcription', 'language'),
        asyncHandler(sarvamController.processWiki)
    );

    return router;
};
