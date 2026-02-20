import { Pinecone } from '@pinecone-database/pinecone';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import type { MagicLinkMatch } from '../types';

dotenv.config();

const INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? 'awaaz-wiki';
const DIMENSION = 1024; // multilingual-e5-large output dimension
const PINECONE_API_KEY = process.env.PINECONE_API_KEY ?? '';

let pc: Pinecone;
let index: ReturnType<Pinecone['index']>;

/**
 * Initializes the Pinecone client and ensures the index exists.
 * Called once on server startup.
 */
export async function initPinecone(): Promise<void> {
    pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY ?? '' });

    const indexList = await pc.listIndexes();
    const exists = indexList.indexes?.some((i) => i.name === INDEX_NAME);

    if (!exists) {
        console.log(`Pinecone: creating index "${INDEX_NAME}"…`);
        await pc.createIndex({
            name: INDEX_NAME,
            dimension: DIMENSION,
            metric: 'cosine',
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1',
                },
            },
        });

        // Wait until the index is ready
        let ready = false;
        while (!ready) {
            await new Promise((r) => setTimeout(r, 3000));
            const desc = await pc.describeIndex(INDEX_NAME);
            ready = desc.status?.ready ?? false;
            console.log(`Pinecone: index status — ready=${ready}`);
        }
    }

    index = pc.index(INDEX_NAME);
    console.log(`Pinecone: connected to index "${INDEX_NAME}"`);
}

/**
 * Generates a 1024-dim embedding for the given text using Pinecone Inference.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    if (!PINECONE_API_KEY) {
        throw new Error('PINECONE_API_KEY is not configured');
    }

    // Prefer SDK-based inference when available
    const anyPc = pc as any;
    if (anyPc?.inference?.embed) {
        const model = 'multilingual-e5-large';
        const embeddings = await anyPc.inference.embed(
            model,
            [text],
            { inputType: 'passage', truncate: 'END' }
        );

        const first = embeddings?.[0];
        if (!first?.values) {
            throw new Error('Pinecone inference (SDK) returned no embedding values');
        }
        return first.values as number[];
    }

    // Fallback: call Inference HTTP API directly
    const response = await fetch('https://api.pinecone.io/embed', {
        method: 'POST',
        headers: {
            'Api-Key': PINECONE_API_KEY,
            'Content-Type': 'application/json',
            'X-Pinecone-Api-Version': '2025-04',
        },
        body: JSON.stringify({
            model: 'multilingual-e5-large',
            parameters: {
                input_type: 'passage',
                truncate: 'END',
            },
            inputs: [{ text }],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
            `Pinecone HTTP inference error: ${response.status} ${response.statusText} ${errorText}`
        );
    }

    const json = (await response.json()) as {
        data?: { values?: number[] }[];
    };

    const values = json.data?.[0]?.values;
    if (!values || !Array.isArray(values)) {
        throw new Error('Pinecone HTTP inference returned no embedding values');
    }

    return values;
}

/**
 * Upserts a wiki entry vector into Pinecone.
 * @param id        Firestore document ID of the wiki entry
 * @param text      English text to embed
 * @param metadata  Extra metadata stored alongside the vector
 */
export async function upsertWikiEntry(
    id: string,
    text: string,
    metadata: Record<string, string>
): Promise<void> {
    const values = await generateEmbedding(text);
    await index.upsert([{ id, values, metadata }]);
    console.log(`Pinecone: upserted wiki entry "${id}"`);
}

/**
 * Finds the top-K semantically similar wiki entries for a query text.
 * Returns matches with score > 0.7.
 */
export async function searchSimilar(
    queryText: string,
    topK = 3
): Promise<MagicLinkMatch[]> {
    const vector = await generateEmbedding(queryText);

    const result = await index.query({
        vector,
        topK,
        includeMetadata: true,
    });

    return (result.matches ?? [])
        .filter((m) => (m.score ?? 0) > 0.4)
        .map((m) => ({
            wikiId: m.id,
            score: m.score ?? 0,
            title: (m.metadata?.title as string) ?? '',
            elderName: (m.metadata?.elderName as string) ?? '',
            village: (m.metadata?.village as string) ?? '',
        }));
}

/**
 * Deletes a wiki vector from Pinecone (called when a wiki entry is deleted).
 */
export async function deleteWikiEntry(id: string): Promise<void> {
    await index.deleteOne(id);
    console.log(`Pinecone: deleted vector "${id}"`);
}
