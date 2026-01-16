import { useRef, useState, useEffect } from "react";
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
  type LucideIcon,
} from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
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

const getCategoryIcon = (category: string): LucideIcon => {
  const key = category.toLowerCase();
  return categoryIcons[key] || Package;
};

/**
 * CategoryFilter - Clean category pills with mobile scroll support
 */
export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft <
        container.scrollWidth - container.clientWidth - 10,
      );
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [categories]);

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

  return (
    <div className="relative px-4 md:px-6 pb-3 bg-gray-50 dark:bg-gray-900">
      {/* Left scroll button */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* All Products Button */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${selectedCategory === null
              ? "bg-brand-500 text-white"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>All Products</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

        {/* Category Buttons */}
        {categories.map((category) => {
          const Icon = getCategoryIcon(category);
          const isSelected = selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${isSelected
                  ? "bg-brand-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category}</span>
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      )}
    </div>
  );
}
