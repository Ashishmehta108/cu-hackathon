import { supabase } from '../config/supabase';
import type { WikiEntry } from '../types';

const TABLE = 'wiki_entries';

/**
 * Create a new wiki entry row in Supabase.
 */
export async function createWikiEntry(
    data: Omit<WikiEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WikiEntry> {
    const row = {
        transcription: data.transcription,
        language: data.language,
        english: data.english,
        hindi: data.hindi,
        title: data.title,
        category: data.category,
        tags: data.tags ?? [],
        description: data.description,
        elder_name: data.elderName ?? null,
        village: data.village ?? null,
        audio_url: data.audioUrl ?? null,
    };

    const { data: inserted, error } = await supabase
        .from(TABLE)
        .insert(row)
        .select()
        .single();

    if (error || !inserted) {
        console.error('createWikiEntry error:', error);
        throw new Error(error?.message ?? 'Failed to create wiki entry');
    }

    return mapRow(inserted);
}

/**
 * Fetch a single wiki entry by ID.
 */
export async function getWikiEntryById(id: string): Promise<WikiEntry | null> {
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;
    return mapRow(data);
}

/**
 * Fetch all wiki entries, optionally filtered by category, village, or tag.
 */
export async function getWikiEntries(filters?: {
    category?: string;
    village?: string;
    tag?: string;
}): Promise<WikiEntry[]> {
    let query = supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false });

    if (filters?.category) {
        query = query.eq('category', filters.category) as any;
    }
    if (filters?.village) {
        query = query.eq('village', filters.village) as any;
    }
    if (filters?.tag) {
        // tags is a text[] column — use the @> (contains) operator
        query = (query as any).contains('tags', [filters.tag]);
    }

    const { data, error } = await query;
    if (error) {
        console.error('getWikiEntries error:', error);
        throw new Error(error.message);
    }
    return (data ?? []).map(mapRow);
}

/**
 * Update a wiki entry (partial update).
 */
export async function updateWikiEntry(
    id: string,
    data: Partial<Omit<WikiEntry, 'id' | 'createdAt'>>
): Promise<WikiEntry | null> {
    const updates: Record<string, unknown> = {};

    if (data.transcription !== undefined) updates.transcription = data.transcription;
    if (data.language !== undefined) updates.language = data.language;
    if (data.english !== undefined) updates.english = data.english;
    if (data.hindi !== undefined) updates.hindi = data.hindi;
    if (data.title !== undefined) updates.title = data.title;
    if (data.category !== undefined) updates.category = data.category;
    if (data.tags !== undefined) updates.tags = data.tags;
    if (data.description !== undefined) updates.description = data.description;
    if (data.elderName !== undefined) updates.elder_name = data.elderName;
    if (data.village !== undefined) updates.village = data.village;
    if (data.audioUrl !== undefined) updates.audio_url = data.audioUrl;
    updates.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
        .from(TABLE)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error || !updated) {
        console.error('updateWikiEntry error:', error);
        return null;
    }
    return mapRow(updated);
}

/**
 * Delete a wiki entry by ID.
 * NOTE: The corresponding Pinecone vector must be deleted separately
 * (handled in the wiki controller via vectorService.deleteWikiEntry).
 */
export async function deleteWikiEntry(id: string): Promise<boolean> {
    const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id);

    if (error) {
        console.error('deleteWikiEntry error:', error);
        return false;
    }
    return true;
}

/**
 * Search wiki entries by tags (array overlap).
 */
export async function searchWikiByTags(tags: string[]): Promise<WikiEntry[]> {
    // Use Supabase's array overlap operator (&&)
    const { data, error } = await (supabase
        .from(TABLE)
        .select('*') as any)
        .overlaps('tags', tags);

    if (error) {
        console.error('searchWikiByTags error:', error);
        return [];
    }
    return (data ?? []).map(mapRow);
}

// ── Row mapper: Supabase snake_case → app camelCase ──────────────────────────

function mapRow(row: Record<string, unknown>): WikiEntry {
    return {
        id: row.id as string,
        transcription: row.transcription as string,
        language: row.language as string,
        english: row.english as string,
        hindi: row.hindi as string,
        title: row.title as string,
        category: row.category as WikiEntry['category'],
        tags: (row.tags as string[]) ?? [],
        description: row.description as string,
        elderName: row.elder_name as string | undefined,
        village: row.village as string | undefined,
        audioUrl: row.audio_url as string | undefined,
        createdAt: row.created_at as string | undefined,
        updatedAt: row.updated_at as string | undefined,
    };
}
