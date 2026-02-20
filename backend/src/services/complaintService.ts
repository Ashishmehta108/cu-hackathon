import { db } from '../config/firebase';
import type { Complaint, ComplaintStatus } from '../types';
import * as admin from 'firebase-admin';

const COLLECTION = 'complaints';

/**
 * Create a new complaint document in Firestore.
 */
export async function createComplaint(
    data: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Complaint> {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const ref = await db.collection(COLLECTION).add({
        ...data,
        status: data.status ?? 'pending',
        createdAt: now,
        updatedAt: now,
    });
    const snap = await ref.get();
    return { id: ref.id, ...snap.data() } as Complaint;
}

/**
 * Fetch a single complaint by Firestore document ID.
 */
export async function getComplaintById(id: string): Promise<Complaint | null> {
    const snap = await db.collection(COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as Complaint;
}

/**
 * Fetch all complaints, optionally filtered by status or category.
 */
export async function getComplaints(filters?: {
    status?: ComplaintStatus;
    category?: string;
    village?: string;
}): Promise<Complaint[]> {
    let query: admin.firestore.Query = db.collection(COLLECTION).orderBy('createdAt', 'desc');

    if (filters?.status) {
        query = query.where('status', '==', filters.status);
    }
    if (filters?.category) {
        query = query.where('category', '==', filters.category);
    }
    if (filters?.village) {
        query = query.where('location.village', '==', filters.village);
    }

    const snap = await query.get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Complaint[];
}

/**
 * Update an existing complaint (partial update).
 */
export async function updateComplaint(
    id: string,
    data: Partial<Omit<Complaint, 'id' | 'createdAt'>>
): Promise<Complaint | null> {
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;

    await ref.update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updated = await ref.get();
    return { id: ref.id, ...updated.data() } as Complaint;
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
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return false;
    await ref.delete();
    return true;
}

/**
 * Count complaints grouped by category (for analytics).
 */
export async function countByCategory(): Promise<Record<string, number>> {
    const snap = await db.collection(COLLECTION).get();
    const counts: Record<string, number> = {};
    snap.docs.forEach((d) => {
        const cat = d.data().category ?? 'Other';
        counts[cat] = (counts[cat] ?? 0) + 1;
    });
    return counts;
}
