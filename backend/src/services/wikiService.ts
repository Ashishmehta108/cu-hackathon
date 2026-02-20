import { db } from '../config/firebase';
import type { WikiEntry } from '../types';
import * as admin from 'firebase-admin';

const COLLECTION = 'wiki';

/**
 * Create a new wiki entry in Firestore.
 */
export async function createWikiEntry(
    data: Omit<WikiEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WikiEntry> {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const ref = await db.collection(COLLECTION).add({
        ...data,
        createdAt: now,
        updatedAt: now,
    });
    const snap = await ref.get();
    return { id: ref.id, ...snap.data() } as WikiEntry;
}

/**
 * Fetch a single wiki entry by Firestore document ID.
 */
export async function getWikiEntryById(id: string): Promise<WikiEntry | null> {
    const snap = await db.collection(COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as WikiEntry;
}

/**
 * Fetch all wiki entries, optionally filtered by category, village, or tag.
 */
export async function getWikiEntries(filters?: {
    category?: string;
    village?: string;
    tag?: string;
}): Promise<WikiEntry[]> {
    let query: admin.firestore.Query = db.collection(COLLECTION).orderBy('createdAt', 'desc');

    if (filters?.category) {
        query = query.where('category', '==', filters.category);
    }
    if (filters?.village) {
        query = query.where('village', '==', filters.village);
    }
    if (filters?.tag) {
        query = query.where('tags', 'array-contains', filters.tag);
    }

    const snap = await query.get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as WikiEntry[];
}

/**
 * Update a wiki entry (partial update).
 */
export async function updateWikiEntry(
    id: string,
    data: Partial<Omit<WikiEntry, 'id' | 'createdAt'>>
): Promise<WikiEntry | null> {
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;

    await ref.update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updated = await ref.get();
    return { id: ref.id, ...updated.data() } as WikiEntry;
}

/**
 * Delete a wiki entry by ID.
 * NOTE: The corresponding Pinecone vector must be deleted separately
 * (handled in the wiki controller via vectorService.deleteWikiEntry).
 */
export async function deleteWikiEntry(id: string): Promise<boolean> {
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return false;
    await ref.delete();
    return true;
}

/**
 * Search wiki entries by English title or description text
 * (basic Firestore contains-no-native-full-text approach using tag array).
 */
export async function searchWikiByTags(tags: string[]): Promise<WikiEntry[]> {
    const results: WikiEntry[] = [];
    // Firestore doesn't support OR across array-contains, so we run per-tag queries
    for (const tag of tags) {
        const snap = await db
            .collection(COLLECTION)
            .where('tags', 'array-contains', tag)
            .get();
        snap.docs.forEach((d) => {
            if (!results.find((r) => r.id === d.id)) {
                results.push({ id: d.id, ...d.data() } as WikiEntry);
            }
        });
    }
    return results;
}
