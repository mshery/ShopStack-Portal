import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, ScanBarcode, LayoutGrid, List } from "lucide-react";

interface CartHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  registerId: string;
  shiftId: string;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

/**
 * CartHeader - Clean search bar with action buttons
 */
export function CartHeader({
  search,
  onSearchChange,
  viewMode = "grid",
  onViewModeChange,
}: CartHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleBarcodeClick = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  };

  return (
    <div className="px-4 md:px-6 pt-4 md:pt-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-lg bg-brand-500">
            <Search className="h-4 w-4 text-white" />
          </div>
          <Input
            ref={searchInputRef}
            placeholder="Search products or scan barcode..."
            className="h-12 md:h-14 pl-14 pr-4 text-base border border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 rounded-xl bg-white dark:bg-gray-800 dark:text-white transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
          />

          {/* Search hint */}
          {!search && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">
                /
              </kbd>
              <span>to focus</span>
            </div>
          )}

          {/* Clear button */}
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <span className="text-gray-500 dark:text-gray-400 text-sm leading-none">×</span>
            </button>
          )}
        </div>

        {/* Scan Barcode Button */}
        <button
          onClick={handleBarcodeClick}
          className="flex h-12 md:h-14 w-12 md:w-14 items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all"
          title="Scan barcode"
        >
          <ScanBarcode className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* View Mode Toggle */}
        <div className="flex h-12 md:h-14 items-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={() => onViewModeChange?.("grid")}
            className={`flex h-full items-center justify-center px-3 md:px-4 rounded-lg transition-all ${viewMode === "grid"
                ? "bg-brand-500 text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            title="Grid view"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => onViewModeChange?.("list")}
            className={`flex h-full items-center justify-center px-3 md:px-4 rounded-lg transition-all ${viewMode === "list"
                ? "bg-brand-500 text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            title="List view"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
