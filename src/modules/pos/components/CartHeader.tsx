import { useRef } from "react";
import { Input } from "@/shared/components/ui/input";
import { Search, LayoutGrid, List, Store } from "lucide-react";

interface CartHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

/**
 * CartHeader - Premium POS header with floating card design
 */
export function CartHeader({
  search,
  onSearchChange,
  viewMode = "grid",
  onViewModeChange,
}: CartHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="px-4 md:px-6 pt-4">
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
        {/* Left: Branding */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/25">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
              QuickSale
            </h1>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Point of Sale
            </p>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            placeholder="Search products..."
            className="h-11 pl-11 pr-10 text-sm bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-gray-700 rounded-xl transition-all placeholder:text-gray-400"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
          />

          {/* Clear button */}
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 flex items-center justify-center transition-colors"
            >
              <span className="text-white text-xs leading-none">×</span>
            </button>
          )}
        </div>

        {/* Right: View Toggle */}
        <div className="flex items-center gap-1 p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <button
            onClick={() => onViewModeChange?.("grid")}
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => onViewModeChange?.("list")}
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
              viewMode === "list"
                ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
            title="List view"
          >
            <List className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
