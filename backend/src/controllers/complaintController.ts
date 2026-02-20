import { Request, Response } from 'express';
import * as complaintService from '../services/complaintService';
import type { ComplaintStatus, ComplaintCategory } from '../types';

// ─── Create ───────────────────────────────────────────────────────────────────

export async function create(req: Request, res: Response): Promise<void> {
    const { text, language, category, keywords, department, location, petition, audioUrl, clusterCount } = req.body;

    const complaint = await complaintService.createComplaint({
        text,
        language,
        category: category as ComplaintCategory,
        keywords: keywords ?? [],
        department,
        location,
        status: 'pending',
        petition,
        audioUrl,
        clusterCount,
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
    const { status } = req.body;
    const updated = await complaintService.updateComplaintStatus(
        req.params.id,
        status as ComplaintStatus
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
