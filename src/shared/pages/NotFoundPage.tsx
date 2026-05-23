import { Link } from "react-router-dom";
import { Home } from "lucide-react";

/**
 * Friendly 404 page mounted on the router's `path: "*"` catch-all so
 * unknown URLs (typos, stale bookmarks, deleted routes) get a designed
 * response instead of React Router's default dev-facing "Hey developer 👋"
 * message. See `.claude/rules/error-handling.md` — users see messages,
 * developers see crashes.
 */
export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-24 dark:bg-gray-900">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
