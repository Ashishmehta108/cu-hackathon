import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({
  placeholder = "Search...",
  onChange,
  resultCount,
  className,
}: {
  placeholder?: string;
  onChange: (value: string) => void;
  resultCount?: number;
  className?: string;
}) {
  const [value, setValue] = useState("");

  // Debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value, onChange]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-16 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow duration-200"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {resultCount !== undefined && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {resultCount}
        </span>
      )}
    </div>
  );
}
