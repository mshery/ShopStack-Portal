import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    SlidersHorizontal,
    X,
    ChevronDown,
    Check,
    DollarSign,
    Package,
    ArrowUpDown,
    Tag,
    AlertCircle,
} from "lucide-react";
import type { ProductFilters } from "@/hooks/useProductFilters";

interface ProductFiltersBarProps {
    filters: ProductFilters;
    brands: string[];
    priceBounds: { min: number; max: number };
    activeFiltersCount: number;
    onBrandChange: (brand: string | null) => void;
    onPriceRangeChange: (range: [number, number] | null) => void;
    onStockStatusChange: (status: ProductFilters["stockStatus"]) => void;
    onSortByChange: (sort: ProductFilters["sortBy"]) => void;
    onResetFilters: () => void;
}

const STOCK_STATUS_OPTIONS: {
    value: ProductFilters["stockStatus"];
    label: string;
    icon: React.ReactNode;
}[] = [
        { value: "all", label: "All Stock", icon: <Package className="w-4 h-4" /> },
        {
            value: "in_stock",
            label: "In Stock",
            icon: <Check className="w-4 h-4 text-emerald-500" />,
        },
        {
            value: "low_stock",
            label: "Low Stock",
            icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
        },
        {
            value: "out_of_stock",
            label: "Out of Stock",
            icon: <X className="w-4 h-4 text-red-500" />,
        },
    ];

const SORT_OPTIONS: { value: ProductFilters["sortBy"]; label: string }[] = [
    { value: "name", label: "Name (A-Z)" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "stock", label: "Stock Level" },
    { value: "newest", label: "Newest First" },
];

/**
 * ProductFiltersBar - Advanced filtering controls for POS product search
 */
export function ProductFiltersBar({
    filters,
    brands,
    priceBounds,
    activeFiltersCount,
    onBrandChange,
    onPriceRangeChange,
    onStockStatusChange,
    onSortByChange,
    onResetFilters,
}: ProductFiltersBarProps) {
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Local price range state (only used while dropdown is open)
    const [localPriceRange, setLocalPriceRange] = useState<[number, number] | null>(null);

    // Effective price range to display in the inputs
    const effectivePriceRange = useMemo<[number, number]>(
        () =>
            localPriceRange ?? [
                filters.priceRange?.[0] ?? priceBounds.min,
                filters.priceRange?.[1] ?? priceBounds.max,
            ],
        [localPriceRange, filters.priceRange, priceBounds.min, priceBounds.max]
    );

    const closeDropdowns = useCallback(() => {
        setActiveDropdown(null);
        setLocalPriceRange(null);
    }, []);

    const toggleDropdown = useCallback(
        (dropdown: string) => {
            if (activeDropdown === dropdown) {
                closeDropdowns();
            } else {
                setActiveDropdown(dropdown);
                // Initialize price range when opening price dropdown
                if (dropdown === "price") {
                    setLocalPriceRange([
                        filters.priceRange?.[0] ?? priceBounds.min,
                        filters.priceRange?.[1] ?? priceBounds.max,
                    ]);
                }
            }
        },
        [activeDropdown, closeDropdowns, filters.priceRange, priceBounds.min, priceBounds.max]
    );

    const handlePriceRangeApply = useCallback(() => {
        if (localPriceRange) {
            onPriceRangeChange(localPriceRange);
        }
        closeDropdowns();
    }, [localPriceRange, onPriceRangeChange, closeDropdowns]);

    const handlePriceRangeReset = useCallback(() => {
        setLocalPriceRange([priceBounds.min, priceBounds.max]);
        onPriceRangeChange(null);
        closeDropdowns();
    }, [priceBounds, onPriceRangeChange, closeDropdowns]);

    const handleMinChange = useCallback(
        (value: number) => {
            const newMin = Math.max(priceBounds.min, Math.min(value, effectivePriceRange[1] - 1));
            setLocalPriceRange([newMin, effectivePriceRange[1]]);
        },
        [priceBounds.min, effectivePriceRange]
    );

    const handleMaxChange = useCallback(
        (value: number) => {
            const newMax = Math.min(priceBounds.max, Math.max(value, effectivePriceRange[0] + 1));
            setLocalPriceRange([effectivePriceRange[0], newMax]);
        },
        [priceBounds.max, effectivePriceRange]
    );

    // Memoized current sort label
    const currentSortLabel = useMemo(() => {
        return SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label || "Sort";
    }, [filters.sortBy]);

    // Memoized current stock status label
    const currentStockLabel = useMemo(() => {
        return (
            STOCK_STATUS_OPTIONS.find((o) => o.value === filters.stockStatus)?.label ||
            "All Stock"
        );
    }, [filters.stockStatus]);

    return (
        <div className="px-4 md:px-6 pb-2 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${showFiltersPanel || activeFiltersCount > 0
                        ? "bg-brand-500 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                        }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFiltersCount > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

                {/* Brand Dropdown */}
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => toggleDropdown("brand")}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filters.brand
                            ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                            }`}
                    >
                        <Tag className="w-4 h-4" />
                        <span>{filters.brand || "Brand"}</span>
                        <ChevronDown
                            className={`w-3 h-3 transition-transform ${activeDropdown === "brand" ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    <AnimatePresence>
                        {activeDropdown === "brand" && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 mt-2 z-50 min-w-[180px] max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
                            >
                                <div className="p-1">
                                    <button
                                        onClick={() => {
                                            onBrandChange(null);
                                            closeDropdowns();
                                        }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${!filters.brand
                                            ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                            }`}
                                    >
                                        All Brands
                                        {!filters.brand && <Check className="w-4 h-4 ml-auto" />}
                                    </button>
                                    {brands.map((brand) => (
                                        <button
                                            key={brand}
                                            onClick={() => {
                                                onBrandChange(brand);
                                                closeDropdowns();
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${filters.brand === brand
                                                ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                                                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                }`}
                                        >
                                            {brand}
                                            {filters.brand === brand && <Check className="w-4 h-4 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Price Range Dropdown */}
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => toggleDropdown("price")}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filters.priceRange
                            ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                            }`}
                    >
                        <DollarSign className="w-4 h-4" />
                        <span>
                            {filters.priceRange
                                ? `$${filters.priceRange[0]} - $${filters.priceRange[1]}`
                                : "Price"}
                        </span>
                        <ChevronDown
                            className={`w-3 h-3 transition-transform ${activeDropdown === "price" ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    <AnimatePresence>
                        {activeDropdown === "price" && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 mt-2 z-50 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4"
                            >
                                <div className="space-y-4">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Price Range
                                    </div>

                                    {/* Min/Max inputs */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                                Min
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                                    $
                                                </span>
                                                <input
                                                    type="number"
                                                    value={effectivePriceRange[0]}
                                                    onChange={(e) => handleMinChange(Number(e.target.value))}
                                                    min={priceBounds.min}
                                                    max={effectivePriceRange[1]}
                                                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                                />
                                            </div>
                                        </div>
                                        <span className="text-gray-400 pt-5">—</span>
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                                Max
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                                    $
                                                </span>
                                                <input
                                                    type="number"
                                                    value={effectivePriceRange[1]}
                                                    onChange={(e) => handleMaxChange(Number(e.target.value))}
                                                    min={effectivePriceRange[0]}
                                                    max={priceBounds.max}
                                                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Range sliders */}
                                    <div className="pt-2">
                                        <input
                                            type="range"
                                            min={priceBounds.min}
                                            max={priceBounds.max}
                                            value={effectivePriceRange[0]}
                                            onChange={(e) => handleMinChange(Number(e.target.value))}
                                            className="w-full accent-brand-500"
                                        />
                                        <input
                                            type="range"
                                            min={priceBounds.min}
                                            max={priceBounds.max}
                                            value={effectivePriceRange[1]}
                                            onChange={(e) => handleMaxChange(Number(e.target.value))}
                                            className="w-full accent-brand-500 -mt-1"
                                        />
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={handlePriceRangeReset}
                                            className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={handlePriceRangeApply}
                                            className="flex-1 px-3 py-2 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Stock Status Dropdown */}
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => toggleDropdown("stock")}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filters.stockStatus !== "all"
                            ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                            }`}
                    >
                        <Package className="w-4 h-4" />
                        <span>{currentStockLabel}</span>
                        <ChevronDown
                            className={`w-3 h-3 transition-transform ${activeDropdown === "stock" ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    <AnimatePresence>
                        {activeDropdown === "stock" && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 mt-2 z-50 min-w-[160px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
                            >
                                <div className="p-1">
                                    {STOCK_STATUS_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                onStockStatusChange(option.value);
                                                closeDropdowns();
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${filters.stockStatus === option.value
                                                ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                                                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                }`}
                                        >
                                            {option.icon}
                                            <span>{option.label}</span>
                                            {filters.stockStatus === option.value && (
                                                <Check className="w-4 h-4 ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sort Dropdown */}
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => toggleDropdown("sort")}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        <span className="hidden sm:inline">{currentSortLabel}</span>
                        <ChevronDown
                            className={`w-3 h-3 transition-transform ${activeDropdown === "sort" ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    <AnimatePresence>
                        {activeDropdown === "sort" && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full right-0 mt-2 z-50 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
                            >
                                <div className="p-1">
                                    {SORT_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                onSortByChange(option.value);
                                                closeDropdowns();
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${filters.sortBy === option.value
                                                ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                                                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                }`}
                                        >
                                            {option.label}
                                            {filters.sortBy === option.value && (
                                                <Check className="w-4 h-4 ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Clear All Filters */}
                {activeFiltersCount > 0 && (
                    <button
                        onClick={onResetFilters}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                    >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Clear All</span>
                    </button>
                )}
            </div>

            {/* Click outside handler */}
            {activeDropdown && (
                <div className="fixed inset-0 z-40" onClick={closeDropdowns} />
            )}
        </div>
    );
}
