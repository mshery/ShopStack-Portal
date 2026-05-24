import { useRef } from "react";
import { Input } from "@/shared/components/ui/input";
import { LayoutGrid, List, Search } from "lucide-react";

interface CartHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

/**
 * Compact POS top bar. Search + view toggle. Drops the previous
 * "QuickSale / Point of Sale" branding block — the sidebar already
 * marks the page; the bar should give all its width to the search.
 */
export function CartHeader({
  search,
  onSearchChange,
  viewMode = "grid",
  onViewModeChange,
}: CartHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 md:px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-2xl">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={searchInputRef}
          placeholder="Search products by name or SKU…"
          className="h-10 pl-10 pr-9 text-sm bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-brand-500/20 rounded-lg transition-all placeholder:text-gray-400 dark:bg-gray-800 dark:border-gray-800 dark:focus:bg-gray-900"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-gray-300 text-white transition-colors hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
            aria-label="Clear search"
          >
            <span className="text-xs leading-none">×</span>
          </button>
        )}
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => onViewModeChange?.("grid")}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
            viewMode === "grid"
              ? "bg-white text-brand-600 shadow-sm dark:bg-gray-700 dark:text-brand-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
          title="Grid view"
          aria-label="Grid view"
          aria-pressed={viewMode === "grid"}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange?.("list")}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
            viewMode === "list"
              ? "bg-white text-brand-600 shadow-sm dark:bg-gray-700 dark:text-brand-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
          title="List view"
          aria-label="List view"
          aria-pressed={viewMode === "list"}
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
