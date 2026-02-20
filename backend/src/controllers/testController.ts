import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import * as complaintService from '../services/complaintService';
import * as wikiService from '../services/wikiService';

/**
 * Test API for Postman — Supabase connectivity & basic CRUD.
 */

/** GET /api/test/firebase — Verify Supabase connection */
export async function testFirebase(_req: Request, res: Response): Promise<void> {
    try {
        const { error } = await supabase.from('complaints').select('id').limit(1);
        if (error) throw error;
        res.json({
            success: true,
            message: 'Supabase connected',
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: 'Supabase connection failed',
            details: err?.message || String(err),
        });
    }
}

/** POST /api/test/complaint — Create a sample complaint (for Postman) */
export async function createTestComplaint(req: Request, res: Response): Promise<void> {
    const body = req.body;
    const payload = {
        text: body.text ?? 'Test complaint: No water supply in our village for 3 days.',
        language: body.language ?? 'hi',
        category: (body.category ?? 'Water') as any,
        keywords: body.keywords ?? ['water', 'shortage', 'village'],
        department: body.department ?? 'Public Health Engineering Department',
        location: body.location ?? {
            village: 'Test Village',
            district: 'Test District',
            state: 'Test State',
        },
        status: 'pending' as const,
        petition: body.petition ?? 'This is a test petition text for Postman.',
    };

    try {
        const complaint = await complaintService.createComplaint(payload);
        res.status(201).json({
            success: true,
            message: 'Test complaint created',
            complaint,
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: 'Failed to create complaint',
            details: err.message,
        });
    }
}

/** GET /api/test/complaints — List all complaints */
export async function listTestComplaints(_req: Request, res: Response): Promise<void> {
    try {
        const complaints = await complaintService.getComplaints({});
        res.json({
            success: true,
            count: complaints.length,
            complaints,
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: 'Failed to list complaints',
            details: err.message,
        });
    }
}

/** GET /api/test/complaints/:id — Get single complaint */
export async function getTestComplaint(req: Request, res: Response): Promise<void> {
    const complaint = await complaintService.getComplaintById(req.params.id);
    if (!complaint) {
        res.status(404).json({ success: false, error: 'Complaint not found' });
        return;
    }
    res.json({ success: true, complaint });
}

/** GET /api/test/cluster-count — Test cluster count */
export async function testClusterCount(req: Request, res: Response): Promise<void> {
    const { category = 'Water', village = 'Test Village', district = 'Test District', state = 'Test State' } = req.query;
    try {
        const count = await complaintService.getClusterCount(category as string, {
            village: village as string,
            district: district as string,
            state: state as string,
        });
        res.json({
            success: true,
            clusterCount: count,
            query: { category, village, district, state },
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: 'Failed to get cluster count',
            details: err.message,
        });
    }
}

/** GET /api/test/wiki — List all wiki entries */
export async function listTestWiki(_req: Request, res: Response): Promise<void> {
    try {
        const entries = await wikiService.getWikiEntries({});
        res.json({
            success: true,
            count: entries.length,
            entries,
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: 'Failed to list wiki entries',
            details: err.message,
        });
    }
}
