// ── Awaaz Type Definitions ──

export type ComplaintCategory =
  | "infrastructure"
  | "health"
  | "agriculture"
  | "water"
  | "education"
  | "corruption"
  | "other";

export type ComplaintStatus =
  | "submitted"
  | "processing"
  | "petition_drafted"
  | "sent"
  | "acknowledged"
  | "resolved";

export type WikiCategory =
  | "farming"
  | "water_management"
  | "natural_remedies"
  | "history"
  | "festivals"
  | "crafts"
  | "other";

export interface Location {
  village: string;
  district: string;
  state: string;
}

export interface MagicLink {
  wikiEntryId: string;
  title: string;
  elderName: string;
  location: Location;
  relevance: string;
}

export interface Complaint {
  id: string;
  transcription: string;
  translatedText: string;
  language: string;
  category: ComplaintCategory;
  department: string;
  location: Location;
  status: ComplaintStatus;
  upvotes: number;
  keywords: string[];
  petitionText: string;
  magicLinks: MagicLink[];
  createdAt: string;
  clusterCount: number;
}

export interface WikiEntry {
  id: string;
  elderName: string;
  title: string;
  category: WikiCategory;
  description: string;
  transcriptionOriginal: string;
  transcriptionEnglish: string;
  transcriptionHindi: string;
  language: string;
  location: Location;
  tags: string[];
  createdAt: string;
}

export const LANGUAGES = [
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "en", label: "English", native: "English" },
] as const;

export const CATEGORY_DEPARTMENT_MAP: Record<ComplaintCategory, string> = {
  infrastructure: "Public Works Department (PWD)",
  health: "District Health Office",
  agriculture: "Department of Agriculture",
  water: "Jal Shakti / Water Resources Department",
  education: "Department of School Education",
  corruption: "District Collector / Anti-Corruption Bureau",
  other: "District Administration",
};

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  infrastructure: "Infrastructure",
  health: "Health",
  agriculture: "Agriculture",
  water: "Water",
  education: "Education",
  corruption: "Corruption",
  other: "Other",
};

export const WIKI_CATEGORY_LABELS: Record<WikiCategory, string> = {
  farming: "Farming",
  water_management: "Water Management",
  natural_remedies: "Natural Remedies",
  history: "History",
  festivals: "Festivals",
  crafts: "Crafts",
  other: "Other",
};
