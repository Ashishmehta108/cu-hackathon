import { MOCK_COMPLAINTS, MOCK_WIKI_ENTRIES, MOCK_STATS } from "./mock-data";
import type {
  Complaint,
  ComplaintCategory,
  WikiEntry,
  WikiCategory,
} from "./types";

// Simulated network delay
function delay(ms: number = 1200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Complaint APIs ──

export async function fetchComplaints(filters?: {
  category?: ComplaintCategory;
  status?: string;
  search?: string;
}): Promise<Complaint[]> {
  await delay(600);
  let results = [...MOCK_COMPLAINTS];

  if (filters?.category) {
    results = results.filter((c) => c.category === filters.category);
  }
  if (filters?.status) {
    results = results.filter((c) => c.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (c) =>
        c.translatedText.toLowerCase().includes(q) ||
        c.location.village.toLowerCase().includes(q) ||
        c.location.district.toLowerCase().includes(q) ||
        c.location.state.toLowerCase().includes(q)
    );
  }

  return results;
}

export async function fetchComplaintById(
  id: string
): Promise<Complaint | null> {
  await delay(400);
  return MOCK_COMPLAINTS.find((c) => c.id === id) ?? null;
}

export async function submitComplaint(data: {
  audioBlob?: Blob;
  language: string;
  location: { village: string; district: string; state: string };
}): Promise<Complaint> {
  await delay(1500);
  // Return the first mock complaint as if newly created
  return {
    ...MOCK_COMPLAINTS[0],
    id: `c${Date.now()}`,
    language: data.language,
    location: data.location,
    createdAt: new Date().toISOString(),
    status: "submitted",
  };
}

export async function upvoteComplaint(id: string): Promise<number> {
  await delay(300);
  const complaint = MOCK_COMPLAINTS.find((c) => c.id === id);
  return (complaint?.upvotes ?? 0) + 1;
}

// ── Sarvam AI Simulation APIs ──

export async function transcribeAudio(_audioBlob: Blob, _language: string): Promise<{
  transcription: string;
  detectedLanguage: string;
}> {
  await delay(2000);
  return {
    transcription:
      "नल लगातार पानी नहीं आ रहा। हमारे गाँव में पिछले दो हफ्ते से पानी नहीं आया है। बोरवेल भी सूख गई है। हम लोग बहुत परेशान हैं।",
    detectedLanguage: "hi",
  };
}

export async function translateText(
  _text: string,
  _sourceLang: string,
  _targetLang: string
): Promise<string> {
  await delay(1000);
  return "Water has not been coming through the tap for a long time. Our village has had no water supply for the past two weeks.";
}

export async function categorizeComplaint(_text: string): Promise<{
  category: ComplaintCategory;
  department: string;
  keywords: string[];
}> {
  await delay(1500);
  return {
    category: "water",
    department: "Jal Shakti / Water Resources Department",
    keywords: ["water shortage", "borewell", "supply", "drought"],
  };
}

export async function draftPetition(_text: string, _category: ComplaintCategory, _location: {
  village: string;
  district: string;
  state: string;
}): Promise<string> {
  await delay(2000);
  return MOCK_COMPLAINTS[0].petitionText;
}

export async function findMagicLinks(
  _text: string,
  _category: ComplaintCategory,
  _location: { village: string; district: string; state: string }
): Promise<Complaint["magicLinks"]> {
  await delay(1000);
  return MOCK_COMPLAINTS[0].magicLinks;
}

export async function textToSpeech(_text: string, _language: string): Promise<string> {
  await delay(800);
  // Return a fake audio URL
  return "data:audio/wav;base64,FAKE";
}

// ── Wiki APIs ──

export async function fetchWikiEntries(filters?: {
  category?: WikiCategory;
  search?: string;
}): Promise<WikiEntry[]> {
  await delay(600);
  let results = [...MOCK_WIKI_ENTRIES];

  if (filters?.category) {
    results = results.filter((w) => w.category === filters.category);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.elderName.toLowerCase().includes(q) ||
        w.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return results;
}

export async function fetchWikiEntryById(
  id: string
): Promise<WikiEntry | null> {
  await delay(400);
  return MOCK_WIKI_ENTRIES.find((w) => w.id === id) ?? null;
}

export async function processWikiEntry(_data: {
  audioBlob?: Blob;
  elderName: string;
  language: string;
  location: { village: string; district: string; state: string };
}): Promise<{
  transcriptionOriginal: string;
  transcriptionEnglish: string;
  transcriptionHindi: string;
  suggestedTitle: string;
  suggestedCategory: WikiCategory;
  suggestedTags: string[];
  suggestedDescription: string;
}> {
  await delay(2500);
  return {
    transcriptionOriginal: MOCK_WIKI_ENTRIES[0].transcriptionOriginal,
    transcriptionEnglish: MOCK_WIKI_ENTRIES[0].transcriptionEnglish,
    transcriptionHindi: MOCK_WIKI_ENTRIES[0].transcriptionHindi,
    suggestedTitle: "Traditional Water Conservation Method",
    suggestedCategory: "water_management",
    suggestedTags: ["water", "harvesting", "traditional", "drought"],
    suggestedDescription:
      "A centuries-old rainwater collection method using stone bunds and earthen channels, perfected by communities in semi-arid regions.",
  };
}

export async function fetchStats(): Promise<typeof MOCK_STATS> {
  await delay(400);
  return MOCK_STATS;
}
