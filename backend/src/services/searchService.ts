import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const TAVILY_API_KEY = process.env.TAVILY_API_KEY ?? '';

export interface SearchResult {
    title: string;
    url: string;
    content: string;
    score: number;
}

/**
 * Searches the web using Tavily API.
 * @param query The search query string
 */
export async function searchWeb(query: string): Promise<{ results: SearchResult[]; answer?: string }> {
    if (!TAVILY_API_KEY) {
        console.warn('TAVILY_API_KEY is not set. Search will return empty results.');
        return { results: [] };
    }

    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: query,
                search_depth: 'advanced',
                include_answer: true,
                max_results: 10,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Tavily search failed (${response.status}): ${err}`);
        }

        const data = await response.json();
        return {
            results: data.results as SearchResult[],
            answer: data.answer
        };
    } catch (error) {
        console.error('Error calling Tavily API:', error);
        throw error;
    }
}
