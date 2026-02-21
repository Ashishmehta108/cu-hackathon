import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import * as complaintService from '../services/complaintService';
import sharp from 'sharp';
import type { ComplaintStatus, ComplaintCategory } from '../types';

// ─── Create ───────────────────────────────────────────────────────────────────

export async function create(req: Request, res: Response): Promise<void> {
    const { text, language, category, keywords, department, location, petition, audioUrl } = req.body;
// complaintController.ts — in the create function, replace the keywords parsing block:

const rawKeywords = req.body['keywords[]'] ?? req.body.keywords;

let parsedKeywords: string[] = [];
if (Array.isArray(rawKeywords)) {
    parsedKeywords = rawKeywords.map(String);
} else if (typeof rawKeywords === 'string') {
    try {
        const parsed = JSON.parse(rawKeywords);
        parsedKeywords = Array.isArray(parsed) ? parsed.map(String) : [parsed];
    } catch {
        parsedKeywords = rawKeywords ? [rawKeywords] : [];
    }
}

    let imageUrl: string | undefined;
    let imageTimestamp: string | undefined;

    if (req.file) {
        const timestamp = new Date().toISOString();
        const fileName = `complaint-${Date.now()}-${req.file.originalname}`;
        const locationText = `${location.village}, ${location.district}, ${location.state}`;
        const bufferWithTimestamp = await sharp(req.file.buffer)
            .composite([{
                input: Buffer.from(`
                    <svg width="600" height="100">
                        <text x="10" y="30" font-family="Arial" font-size="20" fill="white" stroke="black" stroke-width="2">${timestamp}</text>
                        <text x="10" y="60" font-family="Arial" font-size="20" fill="white" stroke="black" stroke-width="2">${locationText}</text>
                    </svg>
                `),
                top: 10,
                left: 10,
            }])
            .png()
            .toBuffer();
        const { data, error } = await supabase.storage
            .from('upload')
            .upload(fileName, bufferWithTimestamp, {
                contentType: 'image/png',
                upsert: false,
            });

        if (error) {
            console.error('Supabase upload error:', error);
            // Continue without image, or return error
            // For now, continue without image
        } else {
            // Get public URL
            const { data: urlData } = supabase.storage
                .from('upload')
                .getPublicUrl(fileName);
            imageUrl = urlData.publicUrl;
            imageTimestamp = timestamp;
        }
    }

    const complaint = await complaintService.createComplaint({
        text,
        language,
        category: category as ComplaintCategory,
        keywords: parsedKeywords,
        department,
        location,
        status: 'pending',
        ...(petition != null && petition !== '' && { petition }),
        ...(audioUrl != null && audioUrl !== '' && { audioUrl }),
        ...(imageUrl && { imageUrl }),
        ...(imageTimestamp && { imageTimestamp }),
        escalationLevel: 0,
    });

    res.status(201).json(complaint);
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function list(req: Request, res: Response): Promise<void> {
    const { status, category, village } = req.query;

    const complaints = await complaintService.getComplaints({
        status: status as ComplaintStatus | undefined,
        category: category as string | undefined,
        village: village as string | undefined,
    });

    res.json(complaints);
}

// ─── Get by ID ────────────────────────────────────────────────────────────────

export async function getById(req: Request, res: Response): Promise<void> {
    const complaint = await complaintService.getComplaintById(req.params.id);
    if (!complaint) {
        res.status(404).json({ error: 'Complaint not found' });
        return;
    }
    res.json(complaint);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function update(req: Request, res: Response): Promise<void> {
    const updated = await complaintService.updateComplaint(req.params.id, req.body);
    if (!updated) {
        res.status(404).json({ error: 'Complaint not found' });
        return;
    }
    res.json(updated);
}

// ─── Update Status ────────────────────────────────────────────────────────────

export async function updateStatus(req: Request, res: Response): Promise<void> {
    const { status, notes } = req.body;
    const updated = await complaintService.updateComplaintStatus(
        req.params.id,
        status as ComplaintStatus,
        notes as string | undefined
    );
    if (!updated) {
        res.status(404).json({ error: 'Complaint not found' });
        return;
    }
    res.json(updated);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function remove(req: Request, res: Response): Promise<void> {
    const deleted = await complaintService.deleteComplaint(req.params.id);
    if (!deleted) {
        res.status(404).json({ error: 'Complaint not found' });
        return;
    }
    res.json({ message: 'Complaint deleted successfully' });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function analytics(req: Request, res: Response): Promise<void> {
    const counts = await complaintService.countByCategory();
    res.json({ byCategory: counts });
}

// ─── Cluster count ─────────────────────────────────────────────────────────────

export async function clusterCount(req: Request, res: Response): Promise<void> {
    const { category, village, district, state } = req.query;
    if (!category) {
        res.status(400).json({ error: 'Missing required query param: category' });
        return;
    }
    const count = await complaintService.getClusterCount(category as string, {
        village: (village as string) ?? '',
        district: (district as string) ?? '',
        state: (state as string) ?? '',
    });
    res.json({ clusterCount: count });
}
