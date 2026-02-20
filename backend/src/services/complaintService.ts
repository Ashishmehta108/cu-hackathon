import { supabase } from '../config/supabase';
import type { Complaint, ComplaintStatus, Location } from '../types';

const TABLE = 'complaints';

/**
 * Normalize location strings for consistent clustering (trim, lowercase).
 */
function normalizeLoc(s: string): string {
    return (s || '').trim().toLowerCase().replace(/\s+/g, ' ') || 'unknown';
}

/**
 * Generate a cluster ID from category and location.
 * Same category + same location = same cluster.
 */
export function getClusterId(category: string, location: Location): string {
    const v = normalizeLoc(location.village);
    const d = normalizeLoc(location.district);
    const s = normalizeLoc(location.state);
    const cat = (category || 'Other').trim();
    return `${cat}|${v}|${d}|${s}`;
}

/**
 * Count complaints in the same cluster (same category + village + district + state).
 */
export async function getClusterCount(category: string, location: Location): Promise<number> {
    const clusterId = getClusterId(category, location);
    const { count, error } = await supabase
        .from(TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('cluster_id', clusterId);

    if (error) {
        console.error('getClusterCount error:', error);
        return 0;
    }
    return count ?? 0;
}

/**
 * Create a new complaint row in Supabase.
 * Auto-computes clusterId and clusterCount (existing count + 1).
 */
export async function createComplaint(
    data: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Complaint> {
    const category = data.category ?? 'Other';
    const location = data.location ?? { village: '', district: '', state: '' };
    const clusterId = getClusterId(category, location);
    const existingCount = await getClusterCount(category, location);
    const clusterCount = existingCount + 1;

    const row = {
        text: data.text,
        language: data.language,
        category: data.category,
        keywords: data.keywords ?? [],
        department: data.department,
        location: data.location,
        status: data.status ?? 'pending',
        petition: data.petition ?? null,
        audio_url: data.audioUrl ?? null,
        cluster_id: clusterId,
        cluster_count: clusterCount,
    };

    const { data: inserted, error } = await supabase
        .from(TABLE)
        .insert(row)
        .select()
        .single();

    if (error || !inserted) {
        console.error('createComplaint error:', error);
        throw new Error(error?.message ?? 'Failed to create complaint');
    }

    return mapRow(inserted);
}

/**
 * Fetch a single complaint by ID.
 */
export async function getComplaintById(id: string): Promise<Complaint | null> {
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;
    return mapRow(data);
}

/**
 * Fetch all complaints, optionally filtered by status or category.
 */
export async function getComplaints(filters?: {
    status?: ComplaintStatus;
    category?: string;
    village?: string;
}): Promise<Complaint[]> {
    let query = supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false });

    if (filters?.status) {
        query = query.eq('status', filters.status) as any;
    }
    if (filters?.category) {
        query = query.eq('category', filters.category) as any;
    }
    if (filters?.village) {
        // location is stored as JSONB — filter by nested key
        query = (query as any).filter('location->>village', 'eq', filters.village);
    }

    const { data, error } = await query;
    if (error) {
        console.error('getComplaints error:', error);
        throw new Error(error.message);
    }
    return (data ?? []).map(mapRow);
}

/**
 * Update an existing complaint (partial update).
 */
export async function updateComplaint(
    id: string,
    data: Partial<Omit<Complaint, 'id' | 'createdAt'>>
): Promise<Complaint | null> {
    const updates: Record<string, unknown> = {};

    if (data.text !== undefined) updates.text = data.text;
    if (data.language !== undefined) updates.language = data.language;
    if (data.category !== undefined) updates.category = data.category;
    if (data.keywords !== undefined) updates.keywords = data.keywords;
    if (data.department !== undefined) updates.department = data.department;
    if (data.location !== undefined) updates.location = data.location;
    if (data.status !== undefined) updates.status = data.status;
    if (data.petition !== undefined) updates.petition = data.petition;
    if (data.audioUrl !== undefined) updates.audio_url = data.audioUrl;
    if (data.clusterId !== undefined) updates.cluster_id = data.clusterId;
    if (data.clusterCount !== undefined) updates.cluster_count = data.clusterCount;
    updates.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
        .from(TABLE)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error || !updated) {
        console.error('updateComplaint error:', error);
        return null;
    }
    return mapRow(updated);
}

/**
 * Update only the status of a complaint.
 */
export async function updateComplaintStatus(
    id: string,
    status: ComplaintStatus
): Promise<Complaint | null> {
    return updateComplaint(id, { status });
}

/**
 * Delete a complaint by ID.
 */
export async function deleteComplaint(id: string): Promise<boolean> {
    const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id);

    if (error) {
        console.error('deleteComplaint error:', error);
        return false;
    }
    return true;
}

/**
 * Count complaints grouped by category (for analytics).
 */
export async function countByCategory(): Promise<Record<string, number>> {
    const { data, error } = await supabase
        .from(TABLE)
        .select('category');

    if (error) {
        console.error('countByCategory error:', error);
        return {};
    }

    const counts: Record<string, number> = {};
    (data ?? []).forEach((row: { category: string }) => {
        const cat = row.category ?? 'Other';
        counts[cat] = (counts[cat] ?? 0) + 1;
    });
    return counts;
}

// ── Row mapper: Supabase snake_case → app camelCase ──────────────────────────

function mapRow(row: Record<string, unknown>): Complaint {
    return {
        id: row.id as string,
        text: row.text as string,
        language: row.language as string,
        category: row.category as Complaint['category'],
        keywords: (row.keywords as string[]) ?? [],
        department: row.department as string,
        location: row.location as Location,
        status: row.status as ComplaintStatus,
        petition: row.petition as string | undefined,
        audioUrl: row.audio_url as string | undefined,
        clusterId: row.cluster_id as string | undefined,
        clusterCount: row.cluster_count as number | undefined,
        createdAt: row.created_at as string | undefined,
        updatedAt: row.updated_at as string | undefined,
    };
}
