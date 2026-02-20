import { searchWeb } from './searchService';
import { chatCompletion, truncateForTokens } from './sarvamService';

function normalizeDepartmentForSearch(dept: string): string {
    const d = dept.toLowerCase();
    if (d.includes('jal shakti') || d.includes('water')) return dept + ' Water Resources';
    if (d.includes('bijli') || d.includes('electricity')) return dept + ' PSPCL discom';
    if (d.includes('health')) return dept + ' CMHO CMO district';
    if (d.includes('pwd') || d.includes('works')) return dept + ' Executive Engineer';
    return dept;
}

// Concise prompt; Sarvam has 7k token limit. Indian formats: phone 10 digits, 1800-xxx, +91; email @gov.in, @nic.in
const CONTACT_FINDER_PROMPT = `Extract official contact from search results for Indian govt dept.
Phone: 10-digit (9xxxxxxxxx), 1800 toll-free, +91, landline (011-xxx). Email: @gov.in, @nic.in, @*.gov.in
Output ONLY JSON: {"department":"","location":"","contactNumber":"number or Not found","email":"email or Not found","sourceUrl":"","confidence":0.0-1.0,"isRegional":true|false}`;

/** Truncate each result to avoid exceeding 7k tokens. */
const MAX_RESULT_CHARS = 1000;
const MAX_RESULTS = 5;

/**
 * Agent that searches for a department's contact details (Phone & Email).
 */
export async function findDepartmentContact(department: string, location: string) {
    const searchTerm = normalizeDepartmentForSearch(department);
    const queries = [
        `contact phone helpline ${searchTerm} ${location} India gov.in`,
        `email directory ${searchTerm} ${location} India nic.in gov.in`,
    ];

    const allResults: { title: string; url: string; content: string; score: number }[] = [];
    const seenUrls = new Set<string>();

    let summarizedAnswer = '';
    for (const q of queries) {
        const { results, answer } = await searchWeb(q);
        if (answer) summarizedAnswer += `\n- ${answer}`;
        for (const r of results) {
            if (!seenUrls.has(r.url)) {
                seenUrls.add(r.url);
                allResults.push({ ...r, content: r.content.slice(0, MAX_RESULT_CHARS) });
            }
            if (allResults.length >= MAX_RESULTS * 2) break;
        }
    }

    const searchResults = allResults.slice(0, MAX_RESULTS);
    console.log(`Agent: found ${searchResults.length} results for ${department} in ${location}`);

    if (searchResults.length === 0) {
        return {
            department,
            location,
            contactNumber: 'Not found',
            email: 'Not found',
            sourceUrl: '',
            confidence: 0,
            note: 'No search results found.'
        };
    }

    let context = searchResults
        .map((r, i) => `[${i + 1}] ${r.url}\n${r.content}`)
        .join('\n\n');
    if (summarizedAnswer) {
        context = `Key Findings:${summarizedAnswer}\n\n${context}`;
    }
    context = truncateForTokens(context, 10000); // well within 7k tokens

    const userMessage = `Dept: ${department}\nLocation: ${location}\n\nResults:\n${context}`;

    const rawResponse = await chatCompletion(CONTACT_FINDER_PROMPT, userMessage);

    try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*?\}/);
        const cleaned = jsonMatch ? jsonMatch[0] : rawResponse.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        const fullText = searchResults.map((r) => r.content).join(' ');

        const noPhone = !parsed.contactNumber || /not\s*found|n\/?a|none|null|unspecified/i.test(String(parsed.contactNumber));
        if (noPhone) {
            const extracted = extractPhone(fullText);
            if (extracted) {
                parsed.contactNumber = extracted;
                parsed.confidence = Math.min((parsed.confidence || 0.5) + 0.2, 0.9);
            }
        }

        const noEmail = !parsed.email || /not\s*found|n\/?a|none|null|unspecified/i.test(String(parsed.email));
        if (noEmail) {
            const extracted = extractEmail(fullText);
            if (extracted) {
                parsed.email = extracted;
                parsed.confidence = Math.min((parsed.confidence || 0.5) + 0.2, 0.9);
            }
        }
        return parsed;
    } catch (error) {
        console.error('Failed to parse Agent response:', rawResponse);
        const fullText = searchResults.map((r) => r.content).join(' ');
        return {
            department,
            location,
            contactNumber: extractPhone(fullText) || 'Not found',
            email: extractEmail(fullText) || 'Not found',
            sourceUrl: searchResults[0]?.url ?? '',
            confidence: 0.5,
            note: 'Used regex fallback',
        };
    }
}

/** Extract Indian phone: 10-digit mobile, 1800 toll-free, +91, landline (011-xxx). */
function extractPhone(text: string): string | null {
    const patterns = [
        /\b1800[\s-]?\d{4}[\s-]?\d{3}\b/i, // Toll free
        /\b\+91[\s-]?\d{10}\b/, // Mobile with +91
        /\b0?[6-9]\d{9}\b/, // 10 digit mobile
        /\b0\d{2,4}[\s-]?\d{6,8}\b/, // STD Landline
        /\b\d{3,5}[\s-]\d{5,7}\b/, // General spaced landline
    ];
    for (const p of patterns) {
        const m = text.match(p);
        if (m) return m[0].replace(/\s+/g, ' ').trim();
    }
    return null;
}

/** Extract email, preferring gov/nic emails but allowing others */
function extractEmail(text: string): string | null {
    // try gov/nic first
    let m = text.match(/[\\w.+%-]+@(?:[\\w-]+\\.)?(?:gov|nic)\\.in\\b/i);
    if (m) return m[0];

    // fallback to any valid email
    m = text.match(/[\\w.+%-]+@[\\w.-]+\\.[a-zA-Z]{2,}\\b/);
    return m ? m[0] : null;
}
const EMAIL_DRAFTER_PROMPT = `Draft formal email to Indian govt dept. JSON only: {"subject":"","body":"..."}. Include: clear subject, polite tone, complaint, location, resolution request, formal closing.`;

/**
 * Agent that drafts a professional email for the complaint.
 */
export async function draftEmail(params: {
    complaint: string;
    department: string;
    location: { village: string; district: string; state: string };
    recipientEmail?: string;
}) {
    const complaint = params.complaint.slice(0, 1500);
    const userMessage = `Complaint: ${complaint}\nDept: ${params.department}\nLocation: ${params.location.village}, ${params.location.district}, ${params.location.state}\nTo: ${params.recipientEmail || 'Dept email'}`;

    const rawResponse = await chatCompletion(EMAIL_DRAFTER_PROMPT, userMessage);

    try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*?\}/);
        const cleaned = jsonMatch ? jsonMatch[0] : rawResponse.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error('Failed to parse Email Draft response:', rawResponse);
        return {
            subject: `Formal Complaint: ${params.department} - ${params.location.village}`,
            body: rawResponse
        };
    }
}
