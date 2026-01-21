import {
  AlertIcon,
  CheckCircleIcon,
  UserCircleIcon,
  LockIcon,
  EnvelopeSvgIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CalendarIcon,
  DollarLineIcon,
  Icon,
} from "@/shared/icons";

/**
 * Icon Demo Page - Testing SVG Icon Imports
 * This page demonstrates that all SVG icons are properly imported and working
 */
export default function IconDemoPage() {
  const iconSize = 32;
  const iconClass = "text-brand-500 hover:text-brand-600 transition-colors";

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          SVG Icon System Demo
        </h1>

        <div className="p-6 mb-8 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            Direct SVG Component Imports
          </h2>
          <div className="grid grid-cols-6 gap-6 sm:grid-cols-8 md:grid-cols-10">
            <div className="flex flex-col items-center gap-2">
              <AlertIcon
                className={iconClass}
                width={iconSize}
                height={iconSize}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Alert
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <CheckCircleIcon
                className={iconClass}
                width={iconSize}
                height={iconSize}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Check
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <UserCircleIcon
                className={iconClass}
                width={iconSize}
                height={iconSize}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                User
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <LockIcon
                className={iconClass}
                width={iconSize}
                height={iconSize}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Lock
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <EnvelopeSvgIcon
                className={iconClass}
                width={iconSize}
                height={iconSize}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Mail
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <PlusIcon
                className={iconClass}
                width={iconSize}
                height={iconSize}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Plus
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <TrashIcon
                className={iconClass}
                width={iconSize}
                height={iconSize}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Trash
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <PencilIcon
                className={iconClass}
                width={iconSize}
                height={iconSize}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Edit
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <CalendarIcon
                className={iconClass}
                width={iconSize}
                height={iconSize}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Calendar
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <DollarLineIcon
                className={iconClass}
                width={iconSize}
                height={iconSize}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Dollar
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            Using Icon Wrapper Component
          </h2>
          <div className="grid grid-cols-6 gap-6 sm:grid-cols-8 md:grid-cols-10">
            <div className="flex flex-col items-center gap-2">
              <Icon
                component={AlertIcon}
                className={iconClass}
                size={iconSize}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Alert
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Icon
                component={CheckCircleIcon}
                className={iconClass}
                size={iconSize}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Check
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Icon
                component={UserCircleIcon}
                className={iconClass}
                size={iconSize}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                User
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 mt-8 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <h3 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-300">
            ✅ SVG Icon System Working!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-400">
            All 57 SVG icons are now available for import. You can use them
            directly as React components or through the Icon wrapper component
            for consistent sizing and styling.
          </p>
        </div>
      </div>
    </div>
  );
}
