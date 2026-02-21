import { config } from "./config";
import type {
  Complaint,
  ComplaintCategory,
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
    department: c.department || "",
    location: c.location || { village: "", district: "", state: "" },
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
  try {
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
          (c.transcription || "").toLowerCase().includes(q) ||
          (c.location?.village || "").toLowerCase().includes(q) ||
          (c.location?.district || "").toLowerCase().includes(q) ||
          (c.location?.state || "").toLowerCase().includes(q)
      );
    }

    return mapped;
  } catch (error) {
    console.error("fetchComplaints failed:", error);
    return [];
  }
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
  image?: File;
}): Promise<Complaint> {
  const formData = new FormData();

  if (data.image) {
    formData.append('image', data.image);
  }

  formData.append('text', data.transcription);
  formData.append('language', data.language);
  formData.append('category', toBackendComplaintCategory(data.category));

  // ✅ Append each keyword as a separate field instead of JSON.stringify
  const safeKeywords = Array.isArray(data.keywords) ? data.keywords : [];
  safeKeywords.forEach((kw) => formData.append('keywords[]', kw));

  formData.append('department', data.department);
  formData.append('location', JSON.stringify(data.location));
  formData.append('status', 'pending');
  formData.append('petition', data.petitionText);
  formData.append('clusterCount', data.clusterCount.toString());

  const backend = await apiCall<BackendComplaint>("/complaints", {
    method: "POST",
    body: formData,
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
    return 1;
  }
}

/** Get count of complaints in same cluster (same category + location). */
export async function getClusterCount(
  category: ComplaintCategory,
  location: { village: string; district: string; state: string }
): Promise<number> {
  try {
    const params = new URLSearchParams({
      category: toBackendComplaintCategory(category),
      village: location.village ?? "",
      district: location.district ?? "",
      state: location.state ?? "",
    });
    const res = await apiCall<{ clusterCount: number }>(
      `/complaints/cluster-count?${params}`
    );
    return res.clusterCount ?? 0;
  } catch {
    return 0;
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
  location: { village: string; district: string; state: string },
  clusterCount?: number
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
          clusterCount: clusterCount ?? 0,
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
      matches: { wikiId: string; score: number; title: string, elderName?: string, village?: string }[];
    }>("/sarvam/magic-link", {
      method: "POST",
      body: JSON.stringify({ complaintText: text }),
    });

    return result.matches.map((m) => ({
      wikiEntryId: m.wikiId,
      title: m.title,
      elderName: m.elderName && m.elderName.trim() !== "" ? m.elderName : "Unknown Elder",
      location: { ...location, village: m.village && m.village.trim() !== "" ? m.village : location.village },
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
        (w.title || "").toLowerCase().includes(q) ||
        (w.description || "").toLowerCase().includes(q) ||
        (w.elderName || "").toLowerCase().includes(q)
      );
    }
    return mapped;
  } catch (error) {
    console.error("fetchWikiEntries failed:", error);
    return [];
  }
}

export async function fetchWikiEntryById(id: string): Promise<WikiEntry | null> {
  try {
    const backendResult = await apiCall<BackendWikiEntry>(`/wiki/${id}`);
    return mapBackendWikiEntryToFrontend(backendResult);
  } catch (error) {
    console.error("fetchWikiEntryById failed:", error);
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
  language: string;
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
      language: detectedLanguage,
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
      language: "auto",
    };
  }
}

export async function fetchStats(): Promise<{ totalComplaints: number; totalPetitions: number; totalWikiEntries: number; categoryCounts: Record<string, number> }> {
  try {
    const result = await apiCall<{ byCategory: Record<string, number> }>("/complaints/analytics");
    const counts = result.byCategory;
    const totalComplaints = Object.values(counts).reduce((s, n) => s + n, 0);

    return {
      totalComplaints,
      totalPetitions: totalComplaints, // approximation: every complaint has a petition
      totalWikiEntries: 0,
      categoryCounts: Object.entries(counts).reduce((acc, [k, v]) => {
        acc[toFrontendComplaintCategory(k)] = v;
        return acc;
      }, {} as Record<string, number>),
    };
  } catch {
    return { totalComplaints: 0, totalPetitions: 0, totalWikiEntries: 0, categoryCounts: {} };
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    return await apiCall<{ success: boolean; data?: any; error?: any }>("/email/send", {
      method: "POST",
      body: JSON.stringify({ to, subject, text, html }),
    });
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return { success: false, error: error.message };
  }
}
