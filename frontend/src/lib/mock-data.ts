import type { Complaint, WikiEntry } from "./types";

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "c1",
    transcription:
      "नल लगातार पानी नहीं आ रहा। हमारे गाँव में पिछले दो हफ्ते से पानी नहीं आया है। बोरवेल भी सूख गई है। हम लोग बहुत परेशान हैं।",
    translatedText:
      "Water has not been coming through the tap for a long time. Our village has had no water supply for the past two weeks. Even the borewell has dried up. We are very distressed.",
    language: "hi",
    category: "water",
    department: "Jal Shakti / Water Resources Department",
    location: { village: "Penukonda", district: "Anantapur", state: "Andhra Pradesh" },
    status: "petition_drafted",
    upvotes: 34,
    keywords: ["water shortage", "borewell", "supply", "drought"],
    petitionText: `To,
The Head of Jal Shakti / Water Resources Department,
District: Anantapur, Andhra Pradesh

Subject: Urgent — Water Supply Disruption in Penukonda Village

Respected Sir/Madam,

We, the residents of Penukonda village, Anantapur district, Andhra Pradesh, wish to bring to your urgent attention a severe water supply crisis affecting our community.

For the past two weeks, our village has received no water through the municipal pipeline. The community borewell, which served as our backup source, has also dried up. Families are walking over 3 kilometers to fetch water from a neighboring village. Children and elderly members are the most affected.

We humbly request your immediate intervention to restore the water supply and investigate the borewell failure. The situation is critical and worsening by the day.

Yours faithfully,
The Residents of Penukonda Village`,
    magicLinks: [
      {
        wikiEntryId: "w1",
        title: "Banda Rainwater Harvesting Technique",
        elderName: "Ramappa",
        location: { village: "Penukonda", district: "Anantapur", state: "Andhra Pradesh" },
        relevance: "Traditional water conservation method used in this exact region for generations",
      },
    ],
    createdAt: "2026-02-18T10:30:00Z",
    clusterCount: 12,
  },
  {
    id: "c2",
    transcription:
      "हमार गाँव की सड़क बहुत खराब हालत में है। बरसात में पानी भर जाता है और गाड़ियाँ चल नहीं सकतीं। दो महीने से शिकायत की है लेकिन कोई नहीं आया।",
    translatedText:
      "Our village road is in very poor condition. It fills with water during the rains and vehicles cannot pass. We have been complaining for two months but no one has come.",
    language: "hi",
    category: "infrastructure",
    department: "Public Works Department (PWD)",
    location: { village: "Saraiya", district: "Muzaffarpur", state: "Bihar" },
    status: "sent",
    upvotes: 22,
    keywords: ["road", "potholes", "flooding", "infrastructure"],
    petitionText: `To,
The Head of Public Works Department (PWD),
District: Muzaffarpur, Bihar

Subject: Urgent — Severely Damaged Road in Saraiya Village

Respected Sir/Madam,

We, the residents of Saraiya village, Muzaffarpur district, Bihar, are writing to report the severely deteriorated condition of the main road connecting our village.

The road has been riddled with large potholes and during the monsoon season it becomes completely waterlogged, rendering it impassable. Vehicles, including ambulances and school buses, are unable to use the route. Despite multiple verbal complaints over the past two months, no repair work has been initiated.

We urge your department to survey the road immediately and commence repair work before the next monsoon season.

Yours faithfully,
The Residents of Saraiya Village`,
    magicLinks: [],
    createdAt: "2026-02-16T14:00:00Z",
    clusterCount: 8,
  },
  {
    id: "c3",
    transcription:
      "बिजली रोज आठ से दस घंटे कटती है। बच्चों की पढ़ाई प्रभावित हो रही है। किसानों के सिंचाई पंप भी नहीं चल रहे।",
    translatedText:
      "Electricity cuts happen for 8 to 10 hours every day. Children's studies are being affected. Farmers' irrigation pumps are also not working.",
    language: "hi",
    category: "infrastructure",
    department: "Public Works Department (PWD)",
    location: { village: "Barua Sagar", district: "Jhansi", state: "Uttar Pradesh" },
    status: "submitted",
    upvotes: 45,
    keywords: ["power cuts", "electricity", "irrigation", "education"],
    petitionText: `To,
The Head of UP Power Corporation / District Energy Office,
District: Jhansi, Uttar Pradesh

Subject: Urgent — Chronic Power Outages in Barua Sagar Village

Respected Sir/Madam,

We are writing to bring to your notice the persistent and debilitating power outages in Barua Sagar village. Electricity supply is being cut for 8 to 10 hours daily, severely impacting everyday life.

Children are unable to study after dark, farmers cannot run irrigation pumps for their crops, and small businesses are suffering losses. This has been an ongoing issue for several weeks.

We request immediate restoration of stable electricity supply to our village.

Yours faithfully,
The Residents of Barua Sagar Village`,
    magicLinks: [],
    createdAt: "2026-02-15T08:45:00Z",
    clusterCount: 19,
  },
];

export const MOCK_WIKI_ENTRIES: WikiEntry[] = [
  {
    id: "w1",
    elderName: "Ramappa",
    title: "Banda Rainwater Harvesting Technique",
    category: "water_management",
    description:
      "A centuries-old rainwater collection method using stone bunds and earthen channels, perfected by farming communities in the semi-arid Rayalaseema region. This technique allows even dry-season cultivation.",
    transcriptionOriginal:
      "మా తాతలు ఈ పద్ధతిని తరతరాలుగా ఉపయోగించారు. వర్షాకాలంలో నీటిని రాళ్ళతో రోక్కి మట్టి కాలువల్లో నిల్వ చేస్తారు. నీరు పొడి నెలలు వరకు వ్యవసాయానికి ఉపయోగపడుతుంది.",
    transcriptionEnglish:
      "Our ancestors used this method for generations. During the monsoon, they would block rainwater with stone bunds and store it in earthen channels. The water would last through the dry months for farming.",
    transcriptionHindi:
      "हमारे पूर्वज इस विधि को पीढ़ियों से उपयोग करते थे। बरसात में पानी को पत्थरों से रोकते थे और मिट्टी की नहरों में संग्रहित करते थे।",
    language: "te",
    location: { village: "Penukonda", district: "Anantapur", state: "Andhra Pradesh" },
    tags: ["rainwater", "harvesting", "bunds", "drought", "traditional"],
    createdAt: "2026-01-20T09:00:00Z",
  },
  {
    id: "w2",
    elderName: "Lakshmi",
    title: "Neem Leaf Natural Remedies",
    category: "natural_remedies",
    description:
      "Traditional uses of neem leaves as antiseptic, anti-inflammatory, and pest repellent known to tribal communities in Bastar for centuries.",
    transcriptionOriginal:
      "नीम के पत्ते हमारे लिए दवाई का काम करते हैं। जख्म हो तो नीम का पेस्ट लगाओ, बुखार हो तो नीम के पत्ते उबालो।",
    transcriptionEnglish:
      "Neem leaves serve as medicine for us. For wounds, we apply a neem paste. For fever, we boil neem leaves and drink the water. It also keeps insects away from stored grain.",
    transcriptionHindi:
      "नीम के पत्ते हमारे लिए दवाई का काम करते हैं। जख्म हो तो नीम का पेस्ट लगाओ, बुखार हो तो नीम के पत्ते उबालो।",
    language: "hi",
    location: { village: "Darbha", district: "Bastar", state: "Chhattisgarh" },
    tags: ["neem", "antiseptic", "traditional medicine", "pest control"],
    createdAt: "2026-01-15T14:30:00Z",
  },
];

export const MOCK_STATS = {
  totalComplaints: 127,
  totalWikiEntries: 43,
  totalPetitions: 89,
  categoryCounts: {
    infrastructure: 38,
    health: 24,
    water: 22,
    agriculture: 19,
    corruption: 14,
    education: 7,
    other: 3,
  } as Record<string, number>,
};
