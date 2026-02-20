import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Add } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { ComplaintCard } from "@/components/complaint-card";
import { SearchBar } from "@/components/search-bar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { fetchComplaints, fetchStats } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/types";
import type { Complaint, ComplaintCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Map, RowVertical } from "iconsax-react";
import { MapView } from "@/components/map-view";

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
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

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
          <Button className="gap-1.5 h-9 rounded-full px-5 text-xs font-bold transition-all hover:shadow-md">
            <Add className="h-4 w-4" variant="Linear" color="currentColor" />
            Report Issue
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/50 bg-card p-5 transition-colors hover:bg-accent/5">
            <p className="text-2xl font-black text-foreground tabular-nums tracking-tight">{stats.totalComplaints}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-1">Total Complaints</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5 transition-colors hover:bg-accent/5">
            <p className="text-2xl font-black text-foreground tabular-nums tracking-tight">{stats.totalPetitions}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-1">Petitions Drafted</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5 transition-colors hover:bg-accent/5">
            <p className="text-2xl font-black text-foreground tabular-nums tracking-tight">{stats.totalWikiEntries}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-1">Wiki Entries</p>
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

      {/* Category filter pills and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 border",
                categoryFilter === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-muted-foreground/30 hover:bg-muted/30"
              )}
            >
              {cat === "all" ? "All" : CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>

        <div className="flex rounded-full border border-border p-1 bg-muted/20">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200",
              viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <RowVertical className="h-4 w-4" variant="Linear" color="currentColor" />
            List
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200",
              viewMode === "map" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Map className="h-4 w-4" variant="Linear" color="currentColor" />
            Map
          </button>
        </div>
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
      ) : viewMode === "map" ? (
        <MapView complaints={complaints} />
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
