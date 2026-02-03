import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutGrid,
  Headphones,
  Volume2,
  Camera,
  Laptop,
  Smartphone,
  Watch,
  Shirt,
  Cpu,
  Monitor,
  Gamepad2,
  Home,
  UtensilsCrossed,
  Package,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  type LucideIcon,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

// Map category names to icons
const categoryIcons: Record<string, LucideIcon> = {
  accessories: Headphones,
  audio: Volume2,
  cameras: Camera,
  laptops: Laptop,
  phones: Smartphone,
  watches: Watch,
  clothing: Shirt,
  electronics: Cpu,
  monitors: Monitor,
  gaming: Gamepad2,
  home: Home,
  food: UtensilsCrossed,
};

const getCategoryIcon = (categoryName: string): LucideIcon => {
  const key = categoryName.toLowerCase();
  return categoryIcons[key] || Package;
};

/**
 * CategoryFilter - Responsive category filter
 * Desktop: Horizontal scrollable pills
 * Mobile: Tap to open modal
 */
export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);

  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10,
      );
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();

    container.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  useEffect(() => {
    checkScrollPosition();
  }, [categories, checkScrollPosition]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Find selected category name for display
  const selectedCategoryName = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.name || "Category"
    : "All";

  const handleCategorySelect = (categoryId: string | null) => {
    onCategoryChange(categoryId);
    setShowMobileModal(false);
  };

  return (
    <>
      {/* Mobile: Category button that opens modal */}
      <div className="md:hidden">
        <button
          onClick={() => setShowMobileModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium"
        >
          <Filter className="w-4 h-4" />
          <span>{selectedCategoryName}</span>
        </button>
      </div>

      {/* Desktop: Horizontal scroll */}
      <div className="hidden md:block relative flex-1 min-w-0">
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 py-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* All Products Button */}
          <button
            onClick={() => onCategoryChange(null)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              selectedCategory === null
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>All</span>
          </button>

          {/* Category Buttons */}
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  isSelected
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        )}
      </div>

      {/* Mobile Modal */}
      <AnimatePresence>
        {showMobileModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileModal(false)}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 max-h-[70vh] overflow-hidden md:hidden"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Categories
                </h3>
                <button
                  onClick={() => setShowMobileModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Category Grid */}
              <div className="px-5 pb-8 overflow-y-auto max-h-[calc(70vh-80px)]">
                <div className="grid grid-cols-3 gap-3">
                  {/* All Products */}
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                      selectedCategory === null
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <LayoutGrid className="w-6 h-6" />
                    <span className="text-xs font-medium">All</span>
                  </button>

                  {/* Categories */}
                  {categories.map((category) => {
                    const Icon = getCategoryIcon(category.name);
                    const isSelected = selectedCategory === category.id;

                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                          isSelected
                            ? "bg-brand-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium text-center line-clamp-1">
                          {category.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
