import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Book1, Add } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { WikiEntryCard } from "@/components/wiki-entry-card";
import { SearchBar } from "@/components/search-bar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { fetchWikiEntries } from "@/lib/api";
import { WIKI_CATEGORY_LABELS } from "@/lib/types";
import type { WikiEntry, WikiCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const WIKI_CATEGORIES: (WikiCategory | "all")[] = [
  "all",
  "farming",
  "water_management",
  "natural_remedies",
  "history",
  "festivals",
  "crafts",
  "other",
];

export function Wiki() {
  const [entries, setEntries] = useState<WikiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<WikiCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchWikiEntries({
      category: categoryFilter === "all" ? undefined : categoryFilter,
      search: searchQuery || undefined,
    }).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [categoryFilter, searchQuery]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Book1 className="h-5 w-5 text-primary/60" variant="Linear" />
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Community Wiki
            </h1>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Indigenous knowledge preserved for future generations
          </p>
        </div>
        <Link to="/record-wiki">
          <Button className="gap-1.5 h-9 rounded-full px-5 text-xs font-bold transition-all hover:shadow-md">
            <Add className="h-4 w-4" variant="Linear" />
            Share Wisdom
          </Button>
        </Link>
      </div>

      {/* Search */}
      <SearchBar
        placeholder="Search by title, elder name, or tag..."
        onChange={handleSearch}
        resultCount={entries.length}
        className="mb-4"
      />

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        {WIKI_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border",
              categoryFilter === cat
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground border-border hover:border-muted-foreground/30 hover:bg-muted/30"
            )}
          >
            {cat === "all"
              ? "All"
              : WIKI_CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Wiki entries grid */}
      {loading ? (
        <LoadingSpinner message="Loading wiki entries..." />
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            No wiki entries match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <WikiEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
