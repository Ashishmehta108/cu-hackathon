import { MOCK_COMPLAINTS, MOCK_WIKI_ENTRIES, MOCK_STATS } from "./mock-data";
import { config } from "./config";
import type {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  Location,
  MagicLink,
  WikiEntry,
  WikiCategory,
} from "./types";
import { CATEGORY_DEPARTMENT_MAP } from "./types";

// Simulated network delay
function delay(ms: number = 1200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Normalize language codes: backend handles mapping, but we normalize here for consistency
// Converts "hi-IN" -> "hi", "en-IN" -> "en", etc. Keeps "auto" as-is.
function normalizeLanguageCode(code: string | undefined | null): string {
  if (!code || code.toLowerCase() === "auto") {
    return "auto";
  }
  // Extract base language code (e.g., "hi-IN" -> "hi")
  const match = code.toLowerCase().match(/^([a-z]{2})(?:-in)?$/);
  return match ? match[1] : code.toLowerCase();
}

// API base URL from config
const API_BASE_URL = config.apiBaseUrl;

// Whether to prefer mocks (e.g. when backend is not running)
const SHOULD_USE_MOCKS_BY_DEFAULT = !API_BASE_URL;

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const fetchOptions = { ...options };

  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not configured");
  }

  try {
    const isFormData = fetchOptions.body instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(fetchOptions.headers ?? {}),
      },
      ...fetchOptions,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`API error: ${response.status} ${response.statusText} ${errorText}`);
    }

    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    try {
      return (await response.json()) as T;
    } catch {
      return (await response.text()) as unknown as T;
    }
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

// Backend-aligned types
type BackendComplaint = {
  id?: string;
  text: string;
  language: string;
  category: string;
  keywords: string[];
  department: string;
  location: Location;
  status: string;
  petition?: string;
  audioUrl?: string;
  clusterCount?: number;
  createdAt?: string | { seconds: number; nanoseconds: number } | any;
  updatedAt?: string | { seconds: number; nanoseconds: number } | any;
};

type BackendWikiEntry = {
  id?: string;
  transcription: string;
  language: string;
  english: string;
  hindi: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  elderName?: string;
  village?: string;
  audioUrl?: string;
  createdAt?: string | { seconds: number; nanoseconds: number } | any;
};

// ── Mapping helpers between backend and frontend types ──

function toFrontendComplaintCategory(category: string): ComplaintCategory {
  const normalized = category.toLowerCase().replace(/\s+/g, "_");
  const allowed: ComplaintCategory[] = [
    "infrastructure",
    "health",
    "agriculture",
    "water",
    "education",
    "corruption",
    "other",
  ];

  if (allowed.includes(normalized as ComplaintCategory)) {
    return normalized as ComplaintCategory;
  }
  return "other";
}

function toBackendComplaintCategory(category: ComplaintCategory): string {
  const map: Record<ComplaintCategory, string> = {
    infrastructure: "Infrastructure",
    health: "Health",
    agriculture: "Agriculture",
    water: "Water",
    education: "Education",
    corruption: "Corruption",
    other: "Other",
  };
  return map[category] || "Other";
}

function toFrontendWikiCategory(category: string): WikiCategory {
  const normalized = category.toLowerCase().replace(/\s+/g, "_");
  const allowed: WikiCategory[] = [
    "farming",
    "water_management",
    "natural_remedies",
    "history",
    "festivals",
    "crafts",
    "other",
  ];

  if (allowed.includes(normalized as WikiCategory)) {
    return normalized as WikiCategory;
  }
  return "other";
}

function toBackendWikiCategory(category: WikiCategory): string {
  const map: Record<WikiCategory, string> = {
    farming: "Farming",
    water_management: "Water Management",
    natural_remedies: "Natural Remedies",
    history: "History",
    festivals: "Festivals",
    crafts: "Crafts",
    other: "Other",
  };
  return map[category] || "Other";
}

function mapBackendComplaintToFrontend(c: BackendComplaint): Complaint {
  let createdAt = new Date().toISOString();
  if (c.createdAt) {
    if (typeof c.createdAt === 'string') createdAt = c.createdAt;
    else if (c.createdAt.seconds) createdAt = new Date(c.createdAt.seconds * 1000).toISOString();
  }

  return {
    id: c.id ?? "",
    transcription: c.text,
    translatedText: c.text,
    language: c.language,
    category: toFrontendComplaintCategory(c.category),
    department: c.department,
    location: c.location,
    status: c.status as any,
    upvotes: c.clusterCount ?? 0,
    keywords: c.keywords ?? [],
    petitionText: c.petition ?? "",
    magicLinks: [],
    createdAt,
    clusterCount: c.clusterCount ?? 0,
  };
}

function mapBackendWikiEntryToFrontend(entry: BackendWikiEntry): WikiEntry {
  let createdAt = new Date().toISOString();
  if (entry.createdAt) {
    if (typeof entry.createdAt === 'string') createdAt = entry.createdAt;
    else if (entry.createdAt.seconds) createdAt = new Date(entry.createdAt.seconds * 1000).toISOString();
  }

  return {
    id: entry.id ?? "",
    elderName: entry.elderName ?? "",
    title: entry.title,
    category: toFrontendWikiCategory(entry.category),
    description: entry.description,
    transcriptionOriginal: entry.transcription,
    transcriptionEnglish: entry.english,
    transcriptionHindi: entry.hindi,
    language: entry.language,
    location: {
      village: entry.village ?? "",
      district: "",
      state: "",
    },
    tags: entry.tags ?? [],
    createdAt,
  };
}

// ── Wiki creation API ──

export async function createWikiEntry(data: {
  transcriptionOriginal: string;
  transcriptionEnglish: string;
  transcriptionHindi: string;
  language: string;
  title: string;
  category: WikiCategory;
  tags: string[];
  description: string;
  elderName: string;
  location: { village: string; district: string; state: string };
}): Promise<WikiEntry> {
  const backend = await apiCall<BackendWikiEntry>("/wiki", {
    method: "POST",
    body: JSON.stringify({
      transcription: data.transcriptionOriginal,
      language: data.language,
      english: data.transcriptionEnglish,
      hindi: data.transcriptionHindi,
      title: data.title,
      category: toBackendWikiCategory(data.category),
      tags: data.tags,
      description: data.description,
      elderName: data.elderName,
      village: data.location.village,
      audioUrl: undefined,
    }),
  });

  return mapBackendWikiEntryToFrontend(backend);
}

// ── Complaint APIs ──

export async function fetchComplaints(filters?: {
  category?: ComplaintCategory;
  status?: string;
  search?: string;
}): Promise<Complaint[]> {
  const queryParams = new URLSearchParams();
  if (filters?.category) queryParams.append('category', toBackendComplaintCategory(filters.category));
  if (filters?.status) queryParams.append('status', filters.status);

  const endpoint = `/complaints${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const backendResult = await apiCall<BackendComplaint[]>(endpoint, {
    method: "GET",
  });

  let mapped = backendResult.map(mapBackendComplaintToFrontend);

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    mapped = mapped.filter(
      (c) =>
        c.transcription.toLowerCase().includes(q) ||
        c.location.village.toLowerCase().includes(q) ||
        c.location.district.toLowerCase().includes(q) ||
        c.location.state.toLowerCase().includes(q)
    );
  }

  return mapped;
}

export async function fetchComplaintById(
  id: string
): Promise<Complaint | null> {
  try {
    const backendResult = await apiCall<BackendComplaint>(`/complaints/${id}`, {
      method: "GET",
    });
    return mapBackendComplaintToFrontend(backendResult);
  } catch (error) {
    console.error("fetchComplaintById failed:", error);
    return null;
  }
}

export async function submitComplaint(data: {
  transcription: string;
  translatedText: string;
  language: string;
  category: ComplaintCategory;
  department: string;
  keywords: string[];
  location: { village: string; district: string; state: string };
  petitionText: string;
  magicLinks: MagicLink[];
  clusterCount: number;
}): Promise<Complaint> {
  const backend = await apiCall<BackendComplaint>("/complaints", {
    method: "POST",
    body: JSON.stringify({
      text: data.transcription,
      language: data.language,
      category: toBackendComplaintCategory(data.category),
      keywords: data.keywords,
      department: data.department,
      location: data.location,
      status: "pending",
      petition: data.petitionText,
      audioUrl: undefined,
      clusterCount: data.clusterCount,
    }),
  });

  const saved = mapBackendComplaintToFrontend(backend);

  return {
    ...saved,
    magicLinks: data.magicLinks,
  };
}

export async function upvoteComplaint(id: string): Promise<number> {
  try {
    const res = await apiCall<{ clusterCount: number }>(`/complaints/${id}/upvote`, {
      method: "POST",
    });
    return res.clusterCount ?? 1;
  } catch {
    await delay(300);
    const complaint = MOCK_COMPLAINTS.find((c) => c.id === id);
    return (complaint?.upvotes ?? 0) + 1;
  }
}

// ── Sarvam AI APIs (with mock fallback for demo/resilience) ──

export async function transcribeAudio(
  audioBlob: Blob,
  language: string
): Promise<{
  transcription: string;
  detectedLanguage: string;
}> {
  const mock = async () => {
    await delay(2000);
    return {
      transcription: "नल लगातार पानी नहीं आ रहा। हमारे गाँव में पानी नहीं आया है।",
      detectedLanguage: "hi",
    };
  };

  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.webm");
    formData.append("language", normalizeLanguageCode(language) || "auto");

    const result = await apiCall<{ text: string; language: string }>(
      "/sarvam/stt",
      {
        method: "POST",
        body: formData,
      }
    );

    return {
      transcription: result.text,
      detectedLanguage: result.language,
    };
  } catch {
    return mock();
  }
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  try {
    const result = await apiCall<{ translatedText: string }>(
      "/sarvam/translate",
      {
        method: "POST",
        body: JSON.stringify({
          text,
          sourceLang: normalizeLanguageCode(sourceLang),
          targetLang: normalizeLanguageCode(targetLang),
        }),
      }
    );
    return result.translatedText;
  } catch {
    return text; // Fallback to original text
  }
}

export async function categorizeComplaint(text: string): Promise<{
  category: ComplaintCategory;
  department: string;
  keywords: string[];
}> {
  try {
    const result = await apiCall<{
      category: string;
      department: string;
      keywords: string[];
    }>("/sarvam/categorize", {
      method: "POST",
      body: JSON.stringify({ text }),
    });

    return {
      category: toFrontendComplaintCategory(result.category),
      department: result.department,
      keywords: result.keywords ?? [],
    };
  } catch {
    return {
      category: "other",
      department: "District Administration",
      keywords: [],
    };
  }
}

export async function draftPetition(
  text: string,
  category: ComplaintCategory,
  location: { village: string; district: string; state: string }
): Promise<{ petition: string; contact?: any }> {
  try {
    const result = await apiCall<{ petition: string; contact?: any }>(
      "/sarvam/petition",
      {
        method: "POST",
        body: JSON.stringify({
          complaint: text,
          category: toBackendComplaintCategory(category),
          department: CATEGORY_DEPARTMENT_MAP[category],
          location,
        }),
      }
    );
    return result;
  } catch {
    return { petition: "Dear Authority,\n\nWe are facing issues with " + text };
  }
}

export async function findMagicLinks(
  text: string,
  _category: ComplaintCategory,
  location: { village: string; district: string; state: string }
): Promise<Complaint["magicLinks"]> {
  try {
    const result = await apiCall<{
      matches: { wikiId: string; score: number; title: string }[];
    }>("/sarvam/magic-link", {
      method: "POST",
      body: JSON.stringify({ complaintText: text }),
    });

    return result.matches.map((m) => ({
      wikiEntryId: m.wikiId,
      title: m.title,
      elderName: "",
      location,
      relevance: `Similar story found in Wiki (${Math.round(m.score * 100)}% match)`,
    }));
  } catch {
    return [];
  }
}

export async function textToSpeech(
  text: string,
  language: string
): Promise<string> {
  try {
    const result = await apiCall<{ audioBase64: string }>("/sarvam/tts", {
      method: "POST",
      body: JSON.stringify({ text, language: normalizeLanguageCode(language) }),
    });
    return `data:audio/wav;base64,${result.audioBase64}`;
  } catch {
    return "";
  }
}

// ── Wiki APIs ──

export async function fetchWikiEntries(filters?: {
  category?: WikiCategory;
  search?: string;
}): Promise<WikiEntry[]> {
  const queryParams = new URLSearchParams();
  if (filters?.category) queryParams.append('category', toBackendWikiCategory(filters.category));

  const endpoint = `/wiki${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  try {
    const backendResult = await apiCall<BackendWikiEntry[]>(endpoint);
    let mapped = backendResult.map(mapBackendWikiEntryToFrontend);

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      mapped = mapped.filter(w =>
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.elderName.toLowerCase().includes(q)
      );
    }
    return mapped;
  } catch {
    return [];
  }
}

export async function fetchWikiEntryById(id: string): Promise<WikiEntry | null> {
  try {
    const backendResult = await apiCall<BackendWikiEntry>(`/wiki/${id}`);
    return mapBackendWikiEntryToFrontend(backendResult);
  } catch {
    return null;
  }
}

export async function processWikiEntry(data: {
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
  try {
    let transcription = "";
    let detectedLanguage = normalizeLanguageCode(data.language);

    if (data.audioBlob) {
      const sttResult = await transcribeAudio(data.audioBlob, data.language);
      transcription = sttResult.transcription;
      detectedLanguage = sttResult.detectedLanguage;
    }

    const result = await apiCall<{
      english: string;
      hindi: string;
      title: string;
      category: string;
      tags: string[];
      description: string;
    }>("/sarvam/process-wiki", {
      method: "POST",
      body: JSON.stringify({ transcription, language: detectedLanguage }),
    });

    return {
      transcriptionOriginal: transcription,
      transcriptionEnglish: result.english,
      transcriptionHindi: result.hindi,
      suggestedTitle: result.title,
      suggestedCategory: toFrontendWikiCategory(result.category),
      suggestedTags: result.tags ?? [],
      suggestedDescription: result.description,
    };
  } catch {
    return {
      transcriptionOriginal: "",
      transcriptionEnglish: "",
      transcriptionHindi: "",
      suggestedTitle: "New Wiki Entry",
      suggestedCategory: "other",
      suggestedTags: [],
      suggestedDescription: "",
    };
  }
}

export async function fetchStats(): Promise<typeof MOCK_STATS> {
  try {
    const result = await apiCall<{ byCategory: Record<string, number> }>("/complaints/analytics");
    const counts = result.byCategory;
    const totalComplaints = Object.values(counts).reduce((s, n) => s + n, 0);

    return {
      ...MOCK_STATS,
      totalComplaints,
      // Map backend capitalized categories back to frontend keys for the stats
      categoryCounts: Object.entries(counts).reduce((acc, [k, v]) => {
        acc[toFrontendComplaintCategory(k)] = v;
        return acc;
      }, {} as Record<string, number>),
    };
  } catch {
    return MOCK_STATS;
  }
}

