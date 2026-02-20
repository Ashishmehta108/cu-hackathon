import { Link } from "react-router-dom";
import {
  Mic,
  BookOpen,
  FileText,
  Users,
  ArrowRight,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { MOCK_STATS } from "@/lib/mock-data";

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary px-4 py-20 md:py-28">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">
              AI-Powered Community Intelligence
            </span>
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
            What if your village{" "}
            <span className="text-primary">could speak?</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg text-pretty">
            Awaaz transforms spoken complaints into formal petitions, connects
            local wisdom with government action, and amplifies the voice of
            every community.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/record-complaint"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg transition-colors duration-200"
            >
              <Mic className="h-4 w-4" />
              Report a Problem
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/record-wiki"
              className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-primary/20 bg-background px-6 text-sm font-semibold text-foreground transition-colors duration-200"
            >
              <BookOpen className="h-4 w-4" />
              Share Wisdom
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-border bg-card px-4 py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          <StatItem
            icon={<Megaphone className="h-5 w-5 text-primary" />}
            value={MOCK_STATS.totalComplaints}
            label="Complaints Filed"
          />
          <StatItem
            icon={<BookOpen className="h-5 w-5 text-green-600" />}
            value={MOCK_STATS.totalWikiEntries}
            label="Wiki Entries"
          />
          <StatItem
            icon={<FileText className="h-5 w-5 text-secondary" />}
            value={MOCK_STATS.totalPetitions}
            label="Petitions Drafted"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-serif text-2xl font-bold text-foreground text-center mb-10 md:text-3xl">
            How Awaaz Works
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StepCard
              step={1}
              title="Speak Your Issue"
              description="Record your complaint in any Indian language. Our AI transcribes and translates it instantly."
              icon={<Mic className="h-6 w-6" />}
            />
            <StepCard
              step={2}
              title="AI Drafts Petition"
              description="The system categorizes your issue, identifies the right department, and drafts a formal petition."
              icon={<FileText className="h-6 w-6" />}
            />
            <StepCard
              step={3}
              title="Community Connects"
              description="Magic Links connect your issue with local wisdom. Similar complaints cluster for stronger impact."
              icon={<Users className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* CTA Feature Cards */}
      <section className="px-4 pb-16 md:pb-20">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <FeatureCard
            href="/record-complaint"
            title="Report a Problem"
            description="Voice your community's issues in your own language. Awaaz turns your words into action."
            icon={<Mic className="h-8 w-8 text-primary" />}
            accentClass="border-primary/20"
          />
          <FeatureCard
            href="/record-wiki"
            title="Share Wisdom"
            description="Preserve indigenous knowledge for future generations. Record stories from your community's elders."
            icon={<BookOpen className="h-8 w-8 text-green-600" />}
            accentClass="border-green-500/20"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <span className="font-serif text-sm font-semibold text-secondary">
            Awaaz
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Voice of the Community
        </p>
      </footer>
    </div>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 justify-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center transition-shadow duration-200">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
        Step {step}
      </span>
      <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  href,
  title,
  description,
  icon,
  accentClass,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentClass: string;
}) {
  return (
    <Link
      to={href}
      className={`group flex flex-col rounded-xl border-2 bg-card p-6 transition-all duration-200 ${accentClass}`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground flex-1">
        {description}
      </p>
      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
        Get Started
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
