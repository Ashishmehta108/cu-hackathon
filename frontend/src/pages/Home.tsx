import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Microphone2,
  Story,
  DocumentText,
  People,
  ArrowRight,
  Speaker,
} from "iconsax-react";
import { MOCK_STATS } from "@/lib/mock-data";

// ─── Google Font loader ───────────────────────────────────────────────────────
function FontLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Instrument+Sans:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
}

// ─── Marquee ticker ───────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "हर आवाज़ मायने रखती है",
  "Every Voice Matters",
  "ప్రతి గొంతు లెక్కించబడుతుంది",
  "ಪ್ರತಿ ಧ್ವನಿ ಮುಖ್ಯ",
  "Every Voice Matters",
  "প্রতিটি কণ্ঠস্বর গুরুত্বপূর্ণ",
  "Every Voice Matters",
];

function Marquee() {
  return (
    <div className="overflow-hidden border-y border-[#E8E0D4] py-3 bg-[#FAF7F2]">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span
            key={i}
            className="text-[11px] font-medium tracking-[0.18em] text-[#8B7355] uppercase"
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}
          >
            {item}
            <span className="mx-6 opacity-30">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Noise texture ────────────────────────────────────────────────────────────
function Noise({ opacity = 0.025 }: { opacity?: number }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
      style={{ opacity }}
    >
      <filter id="n">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.75"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#n)" />
    </svg>
  );
}

// ─── Animated stat ────────────────────────────────────────────────────────────
function Stat({
  value,
  label,
  suffix = "+",
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-1"
    >
      <span
        className="text-[3.2rem] leading-none tracking-[-0.04em] text-[#1C1714]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {value.toLocaleString()}
        <span className="text-[#C4874F]">{suffix}</span>
      </span>
      <span
        className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#8B7355]"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      >
        {label}
      </span>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);



  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const stagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.09, delayChildren: 0.15 },
    },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 22, filter: "blur(3px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <>
      <FontLoader />
      <div
        className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#1C1714]"
        style={
          {
            "--serif": "'Playfair Display', Georgia, serif",
            "--sans": "'Instrument Sans', sans-serif",
          } as React.CSSProperties
        }
      >
        {/* ── Nav ──────────────────────────────────────────────── */}
        <header className="fixed top-0 inset-x-0 z-50 mix-blend-normal">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C1714] text-[#FAF7F2] transition-transform duration-300 group-hover:rotate-6">
                <Speaker size={15} variant="Bold" color="currentColor" />
              </div>
              <span
                className="text-[1.05rem] font-medium tracking-tight"
                style={{ fontFamily: "var(--serif)" }}
              >
                Awaaz
              </span>
            </Link>

            {/* Nav links */}
            <nav
              className="hidden md:flex items-center gap-8"
              style={{ fontFamily: "var(--sans)" }}
            >
              {["About", "Issues", "Wiki"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-[0.8rem] font-medium text-[#5C5040] hover:text-[#1C1714] transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-0 after:bg-[#C4874F] after:transition-all hover:after:w-full"
                >
                  {l}
                </a>
              ))}
            </nav>

            <Link
              to="/record-complaint"
              className="flex h-9 items-center gap-2 rounded-full bg-[#1C1714] px-5 text-[0.75rem] font-semibold text-[#FAF7F2] tracking-wide transition-all duration-300 hover:bg-[#C4874F] hover:shadow-lg hover:shadow-[#C4874F]/20"
              style={{ fontFamily: "var(--sans)" }}
            >
              <Microphone2 size={13} variant="Bold" color="currentColor" />
              Report Issue
            </Link>
          </div>
        </header>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="relative flex min-h-screen flex-col justify-end overflow-hidden pb-24 pt-32 px-6 md:px-10"
        >
          {/* Background layers */}
          <div className="absolute inset-0 bg-[#FAF7F2]" />
          <Noise opacity={0.022} />

          {/* Floating orb — cursor reactive */}
          <motion.div
            className="pointer-events-none absolute top-[15%] right-[8%] h-[480px] w-[480px] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 40% 40%, #E8C49A 0%, #D4956A44 40%, transparent 70%)",
              x: mousePos.x,
              y: mousePos.y,
              transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1)",
            }}
          />

          {/* Small accent circle */}
          <div className="pointer-events-none absolute top-[42%] left-[5%] h-64 w-64 rounded-full bg-[#8B9D5E]/10 blur-3xl" />

          {/* Thin horizontal rule — editorial detail */}
          <div className="absolute top-[44%] inset-x-0 h-px bg-gradient-to-r from-transparent via-[#1C1714]/6 to-transparent" />

          {/* Large background letterform — purely decorative */}
          <div
            className="pointer-events-none absolute bottom-[-4%] right-[-2%] text-[28vw] leading-none font-black text-[#1C1714]/[0.028] select-none"
            style={{ fontFamily: "var(--serif)" }}
            aria-hidden="true"
          >
            A
          </div>

          <motion.div
            className="relative mx-auto w-full max-w-6xl"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Issue count chip */}
            <motion.p

              className="mb-7 flex items-center gap-3"
              style={{ fontFamily: "var(--sans)" }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#C4874F]/25 bg-[#C4874F]/8 px-3.5 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C4874F] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#C4874F]" />
                </span>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#C4874F]">
                  {MOCK_STATS.totalComplaints.toLocaleString()} issues recorded today
                </span>
              </span>
            </motion.p>

            {/* Headline — intentionally asymmetric layout */}
            <div className="grid grid-cols-12 gap-4">
              <motion.h1
                variants={fadeUp}
                className="col-span-12 md:col-span-9 text-[clamp(3.4rem,8.5vw,7.5rem)] leading-[0.96] tracking-[-0.03em] font-normal"
                style={{ fontFamily: "var(--serif)" }}
              >
                Giving rural India
                <br />
                <em className="not-italic text-[#C4874F]">a formal voice</em>
                <br />
                in governance
              </motion.h1>

              {/* Aside copy — right column, desktop only */}
              <motion.div
                variants={fadeUp}
                className="col-span-12 md:col-span-3 hidden md:flex flex-col justify-end pb-3 gap-4 border-l border-[#E8E0D4] pl-6"
              >
                <p
                  className="text-[0.82rem] leading-[1.8] text-[#7A6D5E]"
                  style={{ fontFamily: "var(--sans)" }}
                >
                  Awaaz transcribes spoken concerns into formal petitions,
                  and preserves local wisdom — in every Indian language.
                </p>
                <Link
                  to="/record-complaint"
                  className="group inline-flex items-center gap-2 text-[0.75rem] font-semibold text-[#1C1714]"
                  style={{ fontFamily: "var(--sans)" }}
                >
                  <span className="underline underline-offset-4 decoration-[#C4874F]/50 group-hover:decoration-[#C4874F] transition-all">
                    Start now
                  </span>
                  <ArrowRight
                    size={13}
                    variant="Linear"
                    color="currentColor"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>
            </div>

            {/* Bottom row — stats + CTA */}
            <motion.div
              variants={fadeUp}
              className="mt-14 flex flex-wrap items-end justify-between gap-8 border-t border-[#E8E0D4] pt-10"
            >
              <div className="flex flex-wrap gap-12">
                <Stat value={MOCK_STATS.totalComplaints} label="Complaints filed" />
                <Stat value={MOCK_STATS.totalWikiEntries} label="Wiki entries" />
                <Stat value={MOCK_STATS.totalPetitions} label="Petitions drafted" />
              </div>

              <div
                className="flex items-center gap-4"
                style={{ fontFamily: "var(--sans)" }}
              >
                <Link
                  to="/record-complaint"
                  className="group relative flex h-12 items-center gap-3 overflow-hidden rounded-xl bg-[#1C1714] px-7 text-[0.82rem] font-semibold text-[#FAF7F2] transition-all duration-400 hover:bg-[#2D2520] hover:shadow-2xl hover:shadow-[#1C1714]/15 hover:-translate-y-0.5"
                >
                  <Microphone2 size={15} variant="Bold" color="currentColor" className="opacity-70" />
                  Report an Issue
                  <ArrowRight
                    size={14}
                    variant="Linear"
                    color="currentColor"
                    className="opacity-40 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  to="/record-wiki"
                  className="flex h-12 items-center gap-2 rounded-xl border border-[#1C1714]/12 bg-transparent px-7 text-[0.82rem] font-semibold text-[#1C1714] hover:border-[#1C1714]/25 hover:bg-white/60 transition-all"
                >
                  <Story size={15} variant="Linear" color="currentColor" />
                  Share Wisdom
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Ticker ───────────────────────────────────────────── */}
        <Marquee />

        {/* ── How it works — editorial layout ─────────────────── */}
        <section className="relative overflow-hidden bg-[#1C1714] px-6 py-24 md:px-10 md:py-36 text-[#FAF7F2]">
          <Noise opacity={0.03} />

          {/* Decorative top rule */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C4874F]/30 to-transparent" />

          <div className="relative mx-auto max-w-6xl">
            {/* Section label */}
            <p
              className="mb-14 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#7A6D5E]"
              style={{ fontFamily: "var(--sans)" }}
            >
              The process
            </p>

            {/* Three steps — horizontal rule connecting them */}
            <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
              {[
                {
                  n: "I",
                  title: "Speak in\nyour tongue",
                  body: "Record in any of 100+ Indian dialects. Bhojpuri, Tulu, Gondi — every language is equal here.",
                  icon: <Microphone2 size={18} variant="Linear" color="currentColor" />,
                },
                {
                  n: "II",
                  title: "AI drafts\nthe petition",
                  body: "Sarvam AI converts your spoken words into formal administrative documents, properly categorized.",
                  icon: <DocumentText size={18} variant="Linear" color="currentColor" />,
                },
                {
                  n: "III",
                  title: "Collective\nmovement",
                  body: "Clustered with similar complaints from neighbors, your voice becomes a petition too strong to ignore.",
                  icon: <People size={18} variant="Linear" color="currentColor" />,
                },
              ].map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex flex-col gap-6"
                >
                  {/* Roman numeral */}
                  <div className="flex items-center gap-4">
                    <span
                      className="text-[0.6rem] font-semibold tracking-[0.25em] text-[#5C5040] uppercase"
                      style={{ fontFamily: "var(--sans)" }}
                    >
                      {step.n}
                    </span>
                    <div className="flex-1 h-px bg-[#FAF7F2]/8" />
                    <div className="text-[#C4874F]/60">{step.icon}</div>
                  </div>

                  <h3
                    className="text-[1.7rem] font-normal leading-[1.15] tracking-[-0.02em] whitespace-pre-line"
                    style={{ fontFamily: "var(--serif)" }}
                  >
                    {step.title}
                  </h3>

                  <p
                    className="text-[0.85rem] leading-[1.8] text-[#A89880]"
                    style={{ fontFamily: "var(--sans)" }}
                  >
                    {step.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features — asymmetric layout ─────────────────────── */}
        <section className="relative bg-[#FAF7F2] px-6 py-24 md:px-10 md:py-36">
          <Noise opacity={0.018} />

          <div className="relative mx-auto max-w-6xl">
            <div className="grid grid-cols-12 gap-5 items-stretch">

              {/* Large left card — complaint portal */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="col-span-12 md:col-span-7"
              >
                <Link
                  to="/record-complaint"
                  className="group relative flex flex-col h-full min-h-[420px] overflow-hidden rounded-2xl bg-[#1C1714] p-10 text-[#FAF7F2]"
                >
                  {/* Ambient warm light */}
                  <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#C4874F]/25 blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-60" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C4874F]/20 to-transparent" />
                  <Noise opacity={0.035} />

                  {/* Decorative large type */}
                  <div
                    className="absolute bottom-4 right-6 text-[10rem] leading-none font-black text-[#FAF7F2]/[0.025] select-none pointer-events-none"
                    style={{ fontFamily: "var(--serif)" }}
                    aria-hidden="true"
                  >
                    ✦
                  </div>

                  <div className="relative flex flex-col h-full">
                    <div className="mb-auto">
                      <div
                        className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#C4874F]/15 text-[#C4874F]"
                      >
                        <Microphone2 size={20} variant="Bulk" color="currentColor" />
                      </div>

                      <h3
                        className="mb-4 text-[2rem] font-normal leading-[1.1] tracking-[-0.02em]"
                        style={{ fontFamily: "var(--serif)" }}
                      >
                        Citizen Complaint
                        <br />
                        <em className="not-italic text-[#C4874F]">Portal</em>
                      </h3>

                      <p
                        className="max-w-sm text-[0.85rem] leading-[1.85] text-[#FAF7F2]/45"
                        style={{ fontFamily: "var(--sans)" }}
                      >
                        Lodge formal complaints and track their progress through the
                        administrative hierarchy. Powered by Sarvam AI for
                        precise multilingual transcription.
                      </p>
                    </div>

                    <div
                      className="mt-10 flex items-center gap-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#C4874F]"
                      style={{ fontFamily: "var(--sans)" }}
                    >
                      Get started
                      <ArrowRight
                        size={13}
                        variant="Linear"
                        color="currentColor"
                        className="transition-transform duration-300 group-hover:translate-x-1.5"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Right column — wiki + small infocard */}
              <div className="col-span-12 md:col-span-5 flex flex-col gap-5">
                {/* Wiki card */}
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1"
                >
                  <Link
                    to="/record-wiki"
                    className="group relative flex flex-col h-full min-h-[260px] overflow-hidden rounded-2xl border border-[#E8E0D4] bg-[#F3EDE3] p-8 hover:border-[#D4B896] hover:shadow-xl hover:shadow-[#1C1714]/5 transition-all duration-500"
                  >
                    <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#8B9D5E]/15 blur-3xl" />
                    <Noise opacity={0.02} />

                    <div className="relative flex flex-col h-full">
                      <div
                        className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B9D5E]/12 text-[#5E7A2A]"
                      >
                        <Story size={18} variant="Bulk" color="currentColor" />
                      </div>

                      <h3
                        className="mb-3 text-[1.55rem] font-normal leading-[1.15] tracking-[-0.015em]"
                        style={{ fontFamily: "var(--serif)" }}
                      >
                        Heritage
                        <br />
                        Knowledge Base
                      </h3>

                      <p
                        className="text-[0.82rem] leading-[1.8] text-[#7A6D5E] flex-1"
                        style={{ fontFamily: "var(--sans)" }}
                      >
                        Preserve oral traditions and indigenous wisdom for the generations that follow.
                      </p>

                      <div
                        className="mt-6 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#5E7A2A]"
                        style={{ fontFamily: "var(--sans)" }}
                      >
                        Contribute
                        <ArrowRight
                          size={12}
                          variant="Linear"
                          color="currentColor"
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* Small language card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl border border-[#E8E0D4] bg-white/50 px-7 py-5"
                >
                  <p
                    className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#8B7355]"
                    style={{ fontFamily: "var(--sans)" }}
                  >
                    Supported languages
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "हिन्दी", "বাংলা", "తెలుగు", "मराठी", " తమిళం",
                      "ಕನ್ನಡ", "ਪੰਜਾਬੀ", "ગુજરાતી", "+92 more",
                    ].map((lang) => (
                      <span
                        key={lang}
                        className="rounded-full border border-[#E8E0D4] bg-[#FAF7F2] px-3 py-1 text-[0.72rem] text-[#5C5040]"
                        style={{ fontFamily: lang.includes("+") ? "var(--sans)" : "inherit" }}
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonial / pull-quote ──────────────────────────── */}
        <section className="relative overflow-hidden border-t border-[#E8E0D4] bg-[#F3EDE3] px-6 py-20 md:px-10">
          <Noise opacity={0.02} />
          <div className="relative mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Quote mark */}
              <div
                className="mb-6 text-[5rem] leading-none text-[#C4874F]/25 font-normal"
                style={{ fontFamily: "var(--serif)" }}
                aria-hidden="true"
              >
                "
              </div>
              <blockquote
                className="text-[clamp(1.4rem,3.5vw,2.4rem)] font-normal leading-[1.45] tracking-[-0.02em] text-[#2D2520]"
                style={{ fontFamily: "var(--serif)" }}
              >
                When the Sarpanch ignored our water problem for three years,
                Awaaz helped us file a formal petition in Bhojpuri. The work
                started{" "}
                <em className="not-italic text-[#C4874F]">within six weeks.</em>
              </blockquote>
              <p
                className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#8B7355]"
                style={{ fontFamily: "var(--sans)" }}
              >
                — Kamla Devi, Varanasi district
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="border-t border-[#E8E0D4] bg-[#FAF7F2] px-6 py-12 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C1714] text-[#FAF7F2]">
                  <Speaker size={14} variant="Bold" color="currentColor" />
                </div>
                <span
                  className="text-[1rem] font-normal"
                  style={{ fontFamily: "var(--serif)" }}
                >
                  Awaaz
                </span>
              </div>

              <nav
                className="flex gap-7"
                style={{ fontFamily: "var(--sans)" }}
              >
                {["About", "Privacy", "Contact", "GitHub"].map((l) => (
                  <a
                    key={l}
                    href="#"
                    className="text-[0.75rem] font-medium text-[#8B7355] hover:text-[#1C1714] transition-colors"
                  >
                    {l}
                  </a>
                ))}
              </nav>

              <p
                className="text-[0.72rem] text-[#B8A898] italic"
                style={{ fontFamily: "var(--sans)" }}
              >
                Empowering the silent, one voice at a time.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}