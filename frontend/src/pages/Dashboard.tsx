import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComplaintCard } from "@/components/complaint-card";
import { SearchBar } from "@/components/search-bar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { fetchComplaints, fetchStats } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/types";
import type { Complaint, ComplaintCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORIES: (ComplaintCategory | "all")[] = [
  "all",
  "infrastructure",
  "health",
  "agriculture",
  "water",
  "education",
  "corruption",
  "other",
];

export function Dashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchComplaints({
        category: categoryFilter === "all" ? undefined : categoryFilter,
        search: searchQuery || undefined,
      }),
      fetchStats(),
    ]).then(([complaintsData, statsData]) => {
      setComplaints(complaintsData);
      setStats(statsData);
      setLoading(false);
    });
  }, [categoryFilter, searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-1">
            Community Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Track complaints and community action
          </p>
        </div>
        <Link to="/record-complaint">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            Report Issue
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground">{stats.totalComplaints}</p>
            <p className="text-sm text-muted-foreground">Total Complaints</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground">{stats.totalPetitions}</p>
            <p className="text-sm text-muted-foreground">Petitions Drafted</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground">{stats.totalWikiEntries}</p>
            <p className="text-sm text-muted-foreground">Wiki Entries</p>
          </div>
        </div>
      )}

      {/* Search */}
      <SearchBar
        placeholder="Search complaints by text, village, or district..."
        onChange={handleSearch}
        resultCount={complaints.length}
        className="mb-4"
      />

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200",
              categoryFilter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {cat === "all" ? "All" : CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Complaints list */}
      {loading ? (
        <LoadingSpinner message="Loading complaints..." />
      ) : complaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            No complaints match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
}
