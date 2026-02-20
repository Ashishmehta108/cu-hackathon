import { searchWeb } from './searchService';
import { chatCompletion } from './sarvamService';

const CONTACT_FINDER_PROMPT = `You are Awaaz Contact Finder Agent.
Your goal is to extract official contact details (phone number and email address) for a specific government department in a given location in India based on search results.

Instructions:
1. Examine the provided search results carefully.
2. Look for:
   - Official phone numbers (helplines, toll-free, office landlines, mobile numbers of key officers).
   - Official email addresses (ending in .gov.in, .nic.in, or official department domains).
3. If multiple contacts are found, prioritize official office numbers and official government emails.
4. If you find a "Contact Us" or "Directory" page URL, prioritize that.
5. Even if exact matches are hard, look for regional offices (District or State level) related to the department.
6. Respond ONLY with a valid JSON object:
{
  "department": "...",
  "location": "...",
  "contactNumber": "...", // The extracted number or "Not found"
  "email": "...",         // The extracted email or "Not found"
  "sourceUrl": "...",     // The primary URL where you found the details
  "confidence": 0.0-1.0,  // Your confidence in these details being correct
  "isRegional": boolean   // True if it's a district/regional office rather than state head office
}
`;

/**
 * Agent that searches for a department's contact details (Phone & Email).
 */
export async function findDepartmentContact(department: string, location: string) {
    // Basic normalization/synonyms for better search
    let searchTerm = department;
    if (department.toLowerCase().includes('jal shakti')) {
        searchTerm += ' Water Resources Department';
    } else if (department.toLowerCase().includes('bijli') || department.toLowerCase().includes('electricity')) {
        searchTerm += ' PSPCL Power Corporation';
    }

    const mainQuery = `official contact number email directory ${searchTerm} in ${location} India .gov.in`;
    console.log(`Agent searching for: ${mainQuery}`);

    const { results: searchResults, answer } = await searchWeb(mainQuery);

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
        .map((r, i) => `Result ${i + 1} (${r.url}):\n${r.content}`)
        .join('\n\n');

    if (answer) {
        context = `Summary Answer from Search: ${answer}\n\n` + context;
    }

    const userMessage = `Department: ${department}\nLocation: ${location}\n\nSearch Results:\n${context}`;

    const rawResponse = await chatCompletion(CONTACT_FINDER_PROMPT, userMessage);

    try {
        // Clean the response if LLM adds markdown blocks
        const cleaned = rawResponse.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error('Failed to parse Agent response:', rawResponse);
        return {
            department,
            location,
            contactNumber: 'Error parsing response',
            email: 'Error parsing response',
            sourceUrl: '',
            confidence: 0,
            raw: rawResponse
        };
    }
}
const EMAIL_DRAFTER_PROMPT = `You are Awaaz Email Drafting Agent.
Your task is to write a professional, formal email to a government department regarding a citizen's complaint.

The email should:
1. Have a clear, descriptive subject line.
2. Be polite and respectful.
3. State the issue clearly.
4. Mention the location (village/district/state).
5. Request a resolution or acknowledgment.
6. Use a formal closing.

Respond ONLY with a valid JSON object:
{
  "subject": "...",
  "body": "..."
}
`;

/**
 * Agent that drafts a professional email for the complaint.
 */
export async function draftEmail(params: {
    complaint: string;
    department: string;
    location: { village: string; district: string; state: string };
    recipientEmail?: string;
}) {
    const userMessage = `
    Complaint: ${params.complaint}
    Department: ${params.department}
    Location: ${params.location.village}, ${params.location.district}, ${params.location.state}
    Recipient Email: ${params.recipientEmail || 'Official Department Email'}
    `;

    const rawResponse = await chatCompletion(EMAIL_DRAFTER_PROMPT, userMessage);

    try {
        const cleaned = rawResponse.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error('Failed to parse Email Draft response:', rawResponse);
        return {
            subject: `Formal Complaint: ${params.department} - ${params.location.village}`,
            body: rawResponse
        };
    }
}
