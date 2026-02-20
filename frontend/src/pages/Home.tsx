import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Microphone2,
  Story,
  DocumentText,
  People,
  ArrowRight,
  Speaker,
  SearchNormal1,
  Link2,
  Star1,
  Map1,
} from "iconsax-react";
import { MOCK_STATS } from "@/lib/mock-data";

// ─── Font Loader ────────────────────────────────────────────────────────────────
function FontLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Instrument+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
}

// ─── SVG Noise texture ──────────────────────────────────────────────────────────
function Noise({ opacity = 0.025 }: { opacity?: number }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
      style={{ opacity }}
    >
      <filter id="noise-filter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.72"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-filter)" />
    </svg>
  );
}

// ─── Animated waveform bars ─────────────────────────────────────────────────────
function VoiceWave({ color = "#C4874F", size = "sm" }: { color?: string; size?: "sm" | "md" | "lg" }) {
  const bars = size === "lg" ? 18 : size === "md" ? 12 : 7;
  const heights = Array.from({ length: bars }, (_, i) => {
    const mid = (bars - 1) / 2;
    const dist = Math.abs(i - mid) / mid;
    return 0.3 + (1 - dist * dist) * 0.7;
  });

  return (
    <div className="flex items-center gap-[3px]" aria-hidden="true">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          style={{
            backgroundColor: color,
            width: size === "lg" ? 3 : 2,
            borderRadius: 9999,
          }}
          animate={{
            height: [
              `${h * (size === "lg" ? 32 : size === "md" ? 24 : 16)}px`,
              `${(0.2 + Math.random() * 0.6) * (size === "lg" ? 32 : size === "md" ? 24 : 16)}px`,
              `${h * (size === "lg" ? 32 : size === "md" ? 24 : 16)}px`,
            ],
          }}
          transition={{
            duration: 1.2 + Math.random() * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.08,
          }}
        />
      ))}
    </div>
  );
}

// ─── Multilingual marquee ticker ─────────────────────────────────────────────────
const TICKER_ITEMS = [
  { text: "हर आवाज़ मायने रखती है", script: "devanagari" },
  { text: "Every Voice Matters", script: "latin" },
  { text: "ప్రతి గొంతు లెక్కించబడుతుంది", script: "telugu" },
  { text: "ಪ್ರತಿ ಧ್ವನಿ ಮುಖ್ಯ", script: "kannada" },
  { text: "प्रत्येक आवाज महत्त्वाची", script: "devanagari" },
  { text: "প্রতিটি কণ্ঠস্বর গুরুত্বপূর্ণ", script: "bengali" },
  { text: "ஒவ்வொரு குரலும் முக்கியம்", script: "tamil" },
];

function MarqueeTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-y border-[#E8E0D4] py-3.5 bg-[#FAF7F2]">
      <motion.div
        className="flex gap-14 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-4 text-[11.5px] font-medium tracking-[0.16em] text-[#8B7355] uppercase"
            style={{
              fontFamily:
                item.script === "latin"
                  ? "'Instrument Sans', sans-serif"
                  : "'Noto Sans Devanagari', 'Instrument Sans', sans-serif",
            }}
          >
            <span className="h-1 w-1 rounded-full bg-[#C4874F]/40 flex-shrink-0" />
            {item.text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Animated stat counter ───────────────────────────────────────────────────────
function StatNumber({
  value,
  label,
  suffix = "+",
  delay = 0,
}: {
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-1.5"
    >
      <span
        className="text-[3rem] leading-none tracking-[-0.04em] text-[#1C1714]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {value.toLocaleString()}
        <span className="text-[#C4874F]">{suffix}</span>
      </span>
      <span
        className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#8B7355]"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      >
        {label}
      </span>
    </motion.div>
  );
}

// ─── Feature steps data ──────────────────────────────────────────────────────────
const PROCESS_STEPS = [
  {
    numeral: "I",
    title: "Speak in\nyour tongue",
    body: "Record in any of 22+ Indian languages. Bhojpuri, Tulu, Gondi — every language is equal here.",
    icon: <Microphone2 size={17} variant="Linear" color="currentColor" />,
    color: "#C4874F",
  },
  {
    numeral: "II",
    title: "AI drafts\nthe petition",
    body: "Sarvam AI converts spoken words into formal administrative documents, properly categorized.",
    icon: <DocumentText size={17} variant="Linear" color="currentColor" />,
    color: "#C4874F",
  },
  {
    numeral: "III",
    title: "Collective\nmovement",
    body: "Clustered with similar complaints from neighbors — your voice becomes a petition too strong to ignore.",
    icon: <People size={17} variant="Linear" color="currentColor" />,
    color: "#C4874F",
  },
];

// ─── Bento cards for features ────────────────────────────────────────────────────
const FEATURE_PILLS = [
  "हिन्दी", "বাংলা", "తెలుగు", "मराठी",
  "தமிழ்", "ಕನ್ನಡ", "ਪੰਜਾਬੀ", "ગુજરાતી",
];

// ─── Magic Link preview data ─────────────────────────────────────────────────────
const MAGIC_LINK_DEMO = {
  complaint: "No water supply for 3 months in our village",
  match: "Elder Ramappa's Banda Rainwater Technique",
  score: 94,
  category: "Water",
};

// ─── Main Home Component ──────────────────────────────────────────────────────────
export function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [waveActive, setWaveActive] = useState(true);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 55]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 35,
        y: (e.clientY / window.innerHeight - 0.5) * 25,
      });
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  // Pulse wave active state
  useEffect(() => {
    const t = setInterval(() => setWaveActive((p) => !p), 4000);
    return () => clearInterval(t);
  }, []);

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
    show: {
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <>
      <FontLoader />
      <div
        className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#1C1714] overflow-x-hidden"
        style={{
          "--serif": "'Playfair Display', Georgia, serif",
          "--sans": "'Instrument Sans', sans-serif",
        } as React.CSSProperties}
      >

        {/* ═══════════════════════════════════════════════════════════════
            NAV
        ═══════════════════════════════════════════════════════════════ */}
        <header className="fixed top-0 inset-x-0 z-50">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
            <Link to="/" className="flex items-center gap-2.5 group" id="nav-logo">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C1714] text-[#FAF7F2] overflow-hidden transition-all duration-300 group-hover:scale-105">
                <Speaker size={15} variant="Bold" color="currentColor" />
                <div className="absolute inset-0 bg-[#C4874F] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>
              <span
                className="text-[1.05rem] font-medium tracking-tight text-[#1C1714]"
                style={{ fontFamily: "var(--serif)" }}
              >
                Awaaz
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8" style={{ fontFamily: "var(--sans)" }}>
              {[
                { label: "About", href: "#about" },
                { label: "Issues", href: "/dashboard" },
                { label: "Wiki", href: "/wiki" },
              ].map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  className="text-[0.8rem] font-medium text-[#5C5040] hover:text-[#1C1714] transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-0 after:bg-[#C4874F] after:transition-all hover:after:w-full"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <Link
              to="/record-complaint"
              id="nav-cta"
              className="flex h-9 items-center gap-2 rounded-full bg-[#1C1714] px-5 text-[0.75rem] font-semibold text-[#FAF7F2] tracking-wide transition-all duration-300 hover:bg-[#C4874F] hover:shadow-lg hover:shadow-[#C4874F]/20 hover:-translate-y-px"
              style={{ fontFamily: "var(--sans)" }}
            >
              <Microphone2 size={13} variant="Bold" color="currentColor" />
              Report Issue
            </Link>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════
            HERO — Full viewport, editorial layout
        ═══════════════════════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          id="hero"
          className="relative flex min-h-screen flex-col justify-end overflow-hidden pb-20 pt-28 px-6 md:px-10"
          aria-label="Hero section"
        >
          {/* Background layers */}
          <div className="absolute inset-0 bg-[#FAF7F2]" />
          <Noise opacity={0.02} />

          {/* Cursor-reactive amber orb */}
          <motion.div
            className="pointer-events-none absolute top-[10%] right-[5%] h-[520px] w-[520px] rounded-full opacity-70"
            style={{
              background:
                "radial-gradient(circle at 38% 38%, #E8C49A 0%, #D4956A30 42%, transparent 68%)",
              x: mousePos.x,
              y: mousePos.y,
              transition: "transform 1s cubic-bezier(0.22,1,0.36,1)",
            }}
          />

          {/* Sage secondary orb */}
          <div className="pointer-events-none absolute top-[45%] left-[3%] h-72 w-72 rounded-full bg-[#8B9D5E]/8 blur-[80px]" />

          {/* Editorial horizontal rule */}
          <div className="absolute top-[46%] inset-x-0 h-px bg-gradient-to-r from-transparent via-[#1C1714]/5 to-transparent" />

          {/* Giant background letterform */}
          <div
            className="pointer-events-none absolute bottom-[-5%] right-[-2%] text-[30vw] leading-none font-black text-[#1C1714]/[0.022] select-none"
            style={{ fontFamily: "var(--serif)" }}
            aria-hidden="true"
          >
            A
          </div>

          {/* Hero content */}
          <motion.div
            className="relative mx-auto w-full max-w-6xl"
            variants={stagger}
            initial="hidden"
            animate="show"
            style={{ y: heroY, opacity: heroOpacity }}
          >

            {/* Live badge */}
            <motion.div variants={fadeUp} className="mb-8 flex items-center gap-3">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-[#C4874F]/22 bg-[#C4874F]/7 px-4 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C4874F] opacity-55" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#C4874F]" />
                </span>
                <span
                  className="text-[0.63rem] font-semibold uppercase tracking-[0.22em] text-[#C4874F]"
                  style={{ fontFamily: "var(--sans)" }}
                >
                  {MOCK_STATS.totalComplaints.toLocaleString()} issues recorded this month
                </span>
              </span>
              <VoiceWave color="#C4874F" size="sm" />
            </motion.div>

            {/* 12-col headline grid */}
            <div className="grid grid-cols-12 gap-4 items-end">
              <motion.h1
                variants={fadeUp}
                className="col-span-12 md:col-span-9 text-[clamp(3.2rem,8vw,7rem)] leading-[0.95] tracking-[-0.03em] font-normal"
                style={{ fontFamily: "var(--serif)" }}
              >
                Giving rural India
                <br />
                <em className="not-italic text-[#C4874F]">a formal voice</em>
                <br />
                in governance
              </motion.h1>

              {/* Right aside — desktop only */}
              <motion.div
                variants={fadeUp}
                className="col-span-12 md:col-span-3 hidden md:flex flex-col justify-end pb-2 gap-5 border-l border-[#E8E0D4] pl-7"
              >
                <p
                  className="text-[0.8rem] leading-[1.85] text-[#7A6D5E]"
                  style={{ fontFamily: "var(--sans)" }}
                >
                  Awaaz transcribes spoken concerns into formal petitions and preserves local wisdom — in every Indian language.
                </p>
                <Link
                  to="/record-complaint"
                  className="group inline-flex items-center gap-2 text-[0.73rem] font-semibold text-[#1C1714]"
                  style={{ fontFamily: "var(--sans)" }}
                >
                  <span className="underline underline-offset-4 decoration-[#C4874F]/45 group-hover:decoration-[#C4874F] transition-all">
                    Start recording
                  </span>
                  <ArrowRight
                    size={12}
                    variant="Linear"
                    color="currentColor"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>
            </div>

            {/* Stats + CTA bottom row */}
            <motion.div
              variants={fadeUp}
              className="mt-14 flex flex-wrap items-end justify-between gap-8 border-t border-[#E8E0D4] pt-10"
            >
              <div className="flex flex-wrap gap-10 md:gap-14">
                <StatNumber value={MOCK_STATS.totalComplaints} label="Complaints filed" delay={0} />
                <StatNumber value={MOCK_STATS.totalWikiEntries} label="Wiki entries" delay={0.08} />
                <StatNumber value={MOCK_STATS.totalPetitions} label="Petitions drafted" delay={0.16} />
              </div>

              <div
                className="flex items-center gap-3"
                style={{ fontFamily: "var(--sans)" }}
              >
                <Link
                  to="/record-complaint"
                  id="hero-cta-primary"
                  className="group relative flex h-12 items-center gap-2.5 overflow-hidden rounded-xl bg-[#1C1714] px-7 text-[0.8rem] font-semibold text-[#FAF7F2] transition-all duration-300 hover:bg-[#2D2520] hover:shadow-2xl hover:shadow-[#1C1714]/12 hover:-translate-y-0.5"
                >
                  <Microphone2 size={15} variant="Bold" color="currentColor" className="opacity-75" />
                  Report an Issue
                  <ArrowRight
                    size={13}
                    variant="Linear"
                    color="currentColor"
                    className="opacity-35 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  to="/record-wiki"
                  id="hero-cta-secondary"
                  className="flex h-12 items-center gap-2.5 rounded-xl border border-[#1C1714]/14 bg-transparent px-7 text-[0.8rem] font-semibold text-[#1C1714] hover:border-[#1C1714]/28 hover:bg-white/55 transition-all"
                >
                  <Story size={15} variant="Linear" color="currentColor" />
                  Share Wisdom
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            TICKER
        ═══════════════════════════════════════════════════════════════ */}
        <MarqueeTicker />

        {/* ═══════════════════════════════════════════════════════════════
            HOW IT WORKS — dark editorial section
        ═══════════════════════════════════════════════════════════════ */}
        <section
          id="about"
          className="relative overflow-hidden bg-[#1C1714] px-6 py-24 md:px-10 md:py-36 text-[#FAF7F2]"
          aria-label="How Awaaz works"
        >
          <Noise opacity={0.032} />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C4874F]/28 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C4874F]/14 to-transparent" />

          <div className="relative mx-auto max-w-6xl">
            {/* Section label */}
            <div className="mb-3 flex items-center gap-3">
              <span
                className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#7A6D5E]"
                style={{ fontFamily: "var(--sans)" }}
              >
                The Process
              </span>
              <div className="h-px flex-1 bg-[#FAF7F2]/6 max-w-[60px]" />
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mb-16 text-[clamp(2rem,4.5vw,3.5rem)] font-normal leading-[1.1] tracking-[-0.025em]"
              style={{ fontFamily: "var(--serif)" }}
            >
              Three steps from
              <br />
              <em className="not-italic text-[#C4874F]">silence to change</em>
            </motion.h2>

            {/* Steps grid */}
            <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
              {PROCESS_STEPS.map((step, i) => (
                <motion.div
                  key={step.numeral}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="text-[0.58rem] font-semibold tracking-[0.28em] text-[#5C5040] uppercase"
                      style={{ fontFamily: "var(--sans)" }}
                    >
                      {step.numeral}
                    </span>
                    <div className="flex-1 h-px bg-[#FAF7F2]/7" />
                    <div className="text-[#C4874F]/55">{step.icon}</div>
                  </div>

                  <h3
                    className="text-[1.65rem] font-normal leading-[1.15] tracking-[-0.02em] whitespace-pre-line"
                    style={{ fontFamily: "var(--serif)" }}
                  >
                    {step.title}
                  </h3>

                  <p
                    className="text-[0.83rem] leading-[1.85] text-[#A89880]"
                    style={{ fontFamily: "var(--sans)" }}
                  >
                    {step.body}
                  </p>

                  {/* Subtle waveform decoration */}
                  {i === 0 && (
                    <div className="mt-2">
                      <VoiceWave color="#C4874F" size="md" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            BENTO FEATURES GRID
        ═══════════════════════════════════════════════════════════════ */}
        <section
          className="relative bg-[#FAF7F2] px-6 py-24 md:px-10 md:py-36"
          aria-label="Key features"
        >
          <Noise opacity={0.018} />
          <div className="relative mx-auto max-w-6xl">

            {/* Section label */}
            <div className="mb-3 flex items-center gap-3">
              <span
                className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#8B7355]"
                style={{ fontFamily: "var(--sans)" }}
              >
                Platform Features
              </span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mb-12 text-[clamp(1.8rem,4vw,3rem)] font-normal leading-[1.1] tracking-[-0.02em]"
              style={{ fontFamily: "var(--serif)" }}
            >
              Two superpowers,
              <br />
              <em className="not-italic text-[#C4874F]">one platform</em>
            </motion.h2>

            {/* Bento grid */}
            <div className="grid grid-cols-12 gap-4 items-stretch">

              {/* ── Large LEFT card: Complaint Portal ── */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="col-span-12 md:col-span-7"
              >
                <Link
                  to="/record-complaint"
                  id="feature-complaint-card"
                  className="group relative flex flex-col h-full min-h-[440px] overflow-hidden rounded-2xl bg-[#1C1714] p-9 text-[#FAF7F2] transition-all duration-500"
                >
                  {/* Ambient orb */}
                  <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#C4874F]/22 blur-[60px] transition-all duration-700 group-hover:scale-150 group-hover:opacity-70" />
                  <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C4874F]/18 to-transparent" />
                  <Noise opacity={0.036} />

                  {/* Decorative character */}
                  <div
                    className="absolute bottom-3 right-5 text-[9rem] leading-none font-black text-[#FAF7F2]/[0.022] select-none pointer-events-none"
                    style={{ fontFamily: "var(--serif)" }}
                    aria-hidden="true"
                  >
                    ✦
                  </div>

                  <div className="relative flex flex-col h-full">
                    {/* Top: icon + badge */}
                    <div className="mb-auto">
                      <div className="mb-6 flex items-center gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#C4874F]/14 text-[#C4874F]">
                          <Microphone2 size={20} variant="Bulk" color="currentColor" />
                        </div>
                        <span
                          className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#5C5040]"
                          style={{ fontFamily: "var(--sans)" }}
                        >
                          Voice Complaint
                        </span>
                      </div>

                      <h3
                        className="mb-4 text-[2rem] font-normal leading-[1.1] tracking-[-0.025em]"
                        style={{ fontFamily: "var(--serif)" }}
                      >
                        Citizen Complaint
                        <br />
                        <em className="not-italic text-[#C4874F]">Portal</em>
                      </h3>

                      <p
                        className="max-w-sm text-[0.83rem] leading-[1.9] text-[#FAF7F2]/40"
                        style={{ fontFamily: "var(--sans)" }}
                      >
                        Lodge formal complaints and track their progress through the administrative hierarchy. Powered by Sarvam AI for precise multilingual transcription.
                      </p>
                    </div>

                    {/* Waveform preview card */}
                    <div className="mt-8 rounded-xl bg-[#FAF7F2]/5 border border-[#FAF7F2]/8 px-5 py-4 flex items-center gap-4">
                      <div className="h-9 w-9 rounded-lg bg-[#C4874F]/15 flex items-center justify-center flex-shrink-0">
                        <Microphone2 size={15} variant="Bold" color="#C4874F" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[0.65rem] text-[#FAF7F2]/35 mb-1.5 uppercase tracking-widest"
                          style={{ fontFamily: "var(--sans)" }}
                        >
                          Recording preview
                        </p>
                        <VoiceWave color="#C4874F" size="md" />
                      </div>
                      <span
                        className="text-[0.62rem] text-[#C4874F]/60 font-medium"
                        style={{ fontFamily: "var(--sans)" }}
                      >
                        00:12
                      </span>
                    </div>

                    {/* CTA label */}
                    <div
                      className="mt-7 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#C4874F]"
                      style={{ fontFamily: "var(--sans)" }}
                    >
                      Get started
                      <ArrowRight
                        size={12}
                        variant="Linear"
                        color="currentColor"
                        className="transition-transform duration-300 group-hover:translate-x-1.5"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* ── RIGHT column: 3 stacked cards ── */}
              <div className="col-span-12 md:col-span-5 flex flex-col gap-4">

                {/* Wiki / Heritage card */}
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1"
                >
                  <Link
                    to="/record-wiki"
                    id="feature-wiki-card"
                    className="group relative flex flex-col h-full min-h-[200px] overflow-hidden rounded-2xl border border-[#E8E0D4] bg-[#F3EDE3] p-7 hover:border-[#D4B896] hover:shadow-xl hover:shadow-[#1C1714]/5 transition-all duration-500"
                  >
                    <div className="absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-[#8B9D5E]/14 blur-[50px]" />
                    <Noise opacity={0.02} />

                    <div className="relative flex flex-col h-full">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B9D5E]/12 text-[#5E7A2A]">
                          <Story size={17} variant="Bulk" color="currentColor" />
                        </div>
                        <span
                          className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#6B8040]"
                          style={{ fontFamily: "var(--sans)" }}
                        >
                          Elder Knowledge
                        </span>
                      </div>

                      <h3
                        className="mb-2.5 text-[1.5rem] font-normal leading-[1.15] tracking-[-0.015em]"
                        style={{ fontFamily: "var(--serif)" }}
                      >
                        Heritage
                        <br />
                        Knowledge Base
                      </h3>

                      <p
                        className="text-[0.8rem] leading-[1.8] text-[#7A6D5E] flex-1"
                        style={{ fontFamily: "var(--sans)" }}
                      >
                        Preserve oral traditions and indigenous wisdom for the generations that follow.
                      </p>

                      <div
                        className="mt-5 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#5E7A2A]"
                        style={{ fontFamily: "var(--sans)" }}
                      >
                        Contribute
                        <ArrowRight
                          size={11}
                          variant="Linear"
                          color="currentColor"
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* Magic Link preview card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="relative overflow-hidden rounded-2xl border border-[#F5A623]/25 bg-[#FEF9EE] px-6 py-5">
                    <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-[#F5A623]/14 blur-3xl" />
                    <div className="relative">
                      <div className="mb-3 flex items-center gap-2">
                        <Link2 size={13} variant="Linear" color="#C4874F" />
                        <span
                          className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#C4874F]"
                          style={{ fontFamily: "var(--sans)" }}
                        >
                          ✨ Magic Link Found
                        </span>
                      </div>
                      <p
                        className="text-[0.72rem] text-[#7A6D5E] mb-2.5 line-clamp-1"
                        style={{ fontFamily: "var(--sans)" }}
                      >
                        "{MAGIC_LINK_DEMO.complaint}"
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 px-3 py-2">
                          <p
                            className="text-[0.7rem] font-medium text-[#8B5A00] line-clamp-1"
                            style={{ fontFamily: "var(--sans)" }}
                          >
                            {MAGIC_LINK_DEMO.match}
                          </p>
                        </div>
                        <span
                          className="flex-shrink-0 rounded-full bg-[#F5A623]/20 px-2.5 py-1 text-[0.62rem] font-bold text-[#8B5A00]"
                          style={{ fontFamily: "var(--sans)" }}
                        >
                          {MAGIC_LINK_DEMO.score}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Language pills card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="rounded-2xl border border-[#E8E0D4] bg-white/55 px-6 py-5">
                    <p
                      className="mb-3 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#8B7355]"
                      style={{ fontFamily: "var(--sans)" }}
                    >
                      Supported languages
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {FEATURE_PILLS.map((lang) => (
                        <span
                          key={lang}
                          className="rounded-full border border-[#E8E0D4] bg-[#FAF7F2] px-3 py-1 text-[0.7rem] text-[#5C5040]"
                          style={{ fontFamily: "'Noto Sans Devanagari', inherit" }}
                        >
                          {lang}
                        </span>
                      ))}
                      <span
                        className="rounded-full border border-[#E8E0D4] bg-[#1C1714] px-3 py-1 text-[0.7rem] text-[#FAF7F2]"
                        style={{ fontFamily: "var(--sans)" }}
                      >
                        +14 more
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* ── Second row: 3 small capability cards ── */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  icon: <SearchNormal1 size={16} variant="Linear" color="currentColor" />,
                  title: "Multilingual Search",
                  body: "Search the entire wiki in any language — Hindi, Tamil, Telugu, English — and find relevant wisdom instantly.",
                  color: "#3B82F6",
                  bgColor: "#EFF6FF",
                  borderColor: "#BFDBFE",
                },
                {
                  icon: <Map1 size={16} variant="Linear" color="currentColor" />,
                  title: "Complaint Clustering",
                  body: "47 people report the same water shortage? Your complaint is automatically grouped for amplified impact.",
                  color: "#10B981",
                  bgColor: "#F0FDF4",
                  borderColor: "#BBF7D0",
                },
                {
                  icon: <Star1 size={16} variant="Linear" color="currentColor" />,
                  title: "Auto Petition Drafting",
                  body: "Sarvam-M AI turns your spoken complaint into a formal petition, correctly addressed to the right department.",
                  color: "#8B5CF6",
                  bgColor: "#F5F3FF",
                  borderColor: "#DDD6FE",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl border px-6 py-5"
                  style={{
                    backgroundColor: card.bgColor,
                    borderColor: card.borderColor,
                  }}
                >
                  <div
                    className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${card.color}15`, color: card.color }}
                  >
                    {card.icon}
                  </div>
                  <h4
                    className="mb-2 text-[0.95rem] font-medium tracking-[-0.01em] text-[#1C1714]"
                    style={{ fontFamily: "var(--serif)" }}
                  >
                    {card.title}
                  </h4>
                  <p
                    className="text-[0.78rem] leading-[1.8] text-[#5C5040]"
                    style={{ fontFamily: "var(--sans)" }}
                  >
                    {card.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            TESTIMONIAL / PULL QUOTE
        ═══════════════════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden border-t border-[#E8E0D4] bg-[#F3EDE3] px-6 py-20 md:px-10 md:py-28"
          aria-label="Community testimonial"
        >
          <Noise opacity={0.02} />

          {/* Background orb */}
          <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-[#C4874F]/8 blur-[100px]" />

          <div className="relative mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Large quote mark */}
              <div
                className="mb-5 text-[5.5rem] leading-none text-[#C4874F]/22"
                style={{ fontFamily: "var(--serif)" }}
                aria-hidden="true"
              >
                "
              </div>

              <blockquote
                className="text-[clamp(1.35rem,3.2vw,2.3rem)] font-normal leading-[1.45] tracking-[-0.02em] text-[#2D2520]"
                style={{ fontFamily: "var(--serif)" }}
              >
                When the Sarpanch ignored our water problem for three years,
                Awaaz helped us file a formal petition in Bhojpuri. The work
                started{" "}
                <em className="not-italic text-[#C4874F]">within six weeks.</em>
              </blockquote>

              <div className="mt-7 flex items-center gap-4">
                <div className="h-px flex-1 max-w-[40px] bg-[#C4874F]/30" />
                <p
                  className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#8B7355]"
                  style={{ fontFamily: "var(--sans)" }}
                >
                  Kamla Devi — Varanasi district
                </p>
              </div>
            </motion.div>

            {/* Category stat chips below quote */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 flex flex-wrap gap-3"
            >
              {[
                { label: "Infrastructure", color: "#3B82F6", count: 1842 },
                { label: "Water", color: "#06B6D4", count: 976 },
                { label: "Education", color: "#8B5CF6", count: 654 },
                { label: "Health", color: "#EF4444", count: 521 },
                { label: "Agriculture", color: "#10B981", count: 438 },
              ].map((cat) => (
                <span
                  key={cat.label}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
                  style={{
                    borderColor: `${cat.color}30`,
                    backgroundColor: `${cat.color}08`,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span
                    className="text-[0.68rem] font-medium text-[#5C5040]"
                    style={{ fontFamily: "var(--sans)" }}
                  >
                    {cat.label}
                  </span>
                  <span
                    className="text-[0.62rem] font-semibold"
                    style={{ color: cat.color, fontFamily: "var(--sans)" }}
                  >
                    {cat.count.toLocaleString()}
                  </span>
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            CTA BANNER — dark, full-width
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#1C1714] px-6 py-20 md:px-10" aria-label="Call to action">
          <Noise opacity={0.03} />
          <div className="absolute inset-0 bg-gradient-to-br from-[#C4874F]/8 via-transparent to-transparent pointer-events-none" />

          {/* Large animated waveform BG */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <VoiceWave color="#C4874F" size="lg" />
          </div>

          <div className="relative mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-10"
            >
              <div>
                <p
                  className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#7A6D5E]"
                  style={{ fontFamily: "var(--sans)" }}
                >
                  Get involved
                </p>
                <h2
                  className="text-[clamp(1.8rem,4vw,3.2rem)] font-normal leading-[1.1] tracking-[-0.025em] text-[#FAF7F2]"
                  style={{ fontFamily: "var(--serif)" }}
                >
                  Before we ask the
                  <br />
                  government —{" "}
                  <em className="not-italic text-[#C4874F]">ask your elders</em>
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3" style={{ fontFamily: "var(--sans)" }}>
                <Link
                  to="/record-complaint"
                  id="cta-report-btn"
                  className="group flex h-12 items-center gap-2.5 rounded-xl bg-[#C4874F] px-7 text-[0.8rem] font-semibold text-white transition-all duration-300 hover:bg-[#D4956A] hover:shadow-lg hover:shadow-[#C4874F]/25 hover:-translate-y-0.5"
                >
                  <Microphone2 size={14} variant="Bold" color="currentColor" />
                  Report an Issue
                  <ArrowRight
                    size={13}
                    variant="Linear"
                    color="currentColor"
                    className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                  />
                </Link>
                <Link
                  to="/wiki"
                  id="cta-wiki-btn"
                  className="flex h-12 items-center gap-2.5 rounded-xl border border-[#FAF7F2]/15 px-7 text-[0.8rem] font-semibold text-[#FAF7F2] hover:bg-white/8 transition-all"
                >
                  <SearchNormal1 size={14} variant="Linear" color="currentColor" />
                  Browse Wiki
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════════════════ */}
        <footer className="border-t border-[#E8E0D4] bg-[#FAF7F2] px-6 py-10 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              {/* Logo + tagline */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C1714] text-[#FAF7F2]">
                  <Speaker size={14} variant="Bold" color="currentColor" />
                </div>
                <div>
                  <span
                    className="block text-[1rem] font-normal text-[#1C1714]"
                    style={{ fontFamily: "var(--serif)" }}
                  >
                    Awaaz
                  </span>
                  <span
                    className="block text-[0.62rem] text-[#8B7355] tracking-wide"
                    style={{ fontFamily: "var(--sans)" }}
                  >
                    Voice of the Community
                  </span>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex flex-wrap gap-6" style={{ fontFamily: "var(--sans)" }}>
                {["About", "Dashboard", "Wiki", "Privacy", "GitHub"].map((l) => (
                  <a
                    key={l}
                    href="#"
                    className="text-[0.73rem] font-medium text-[#8B7355] hover:text-[#1C1714] transition-colors"
                  >
                    {l}
                  </a>
                ))}
              </nav>

              {/* Badge */}
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[#E8E0D4] bg-[#F3EDE3] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-[#8B7355]"
                  style={{ fontFamily: "var(--sans)" }}>
                  PROTOWAR 1.0
                </span>
              </div>
            </div>

            <div className="mt-8 border-t border-[#E8E0D4] pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <p className="text-[0.68rem] text-[#B8A898] italic" style={{ fontFamily: "var(--sans)" }}>
                Empowering the silent, one voice at a time.
              </p>
              <p className="text-[0.65rem] text-[#B8A898]" style={{ fontFamily: "var(--sans)" }}>
                Built with Sarvam AI · Firebase · React · TypeScript
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}