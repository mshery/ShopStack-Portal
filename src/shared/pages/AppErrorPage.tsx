import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

/**
 * Root-level error boundary mounted as `errorElement` on the router.
 * Catches everything React Router would otherwise surface as its default
 * dev page (the "Hey developer 👋" message): route-level 404s, loader/
 * action throws, and runtime render errors inside a route element.
 *
 * Two branches:
 *   - 404 / Route-level errors  → render a friendly "not found" panel.
 *   - All other thrown errors    → render a generic apology panel with
 *                                  Reload + Go home actions.
 *
 * Per `.claude/rules/error-handling.md`: users see messages, developers
 * see crashes. The actual error / stack is logged to the console but
 * never displayed to the user.
 */
export default function AppErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPanel />;
  }

  // Anything else is treated as an app-level crash. Log for the dev /
  // error monitor, show a generic message to the user. The `no-console`
  // rule allows `console.error` so this is intentional and untyped.
  console.error("AppErrorPage caught:", error);

  return <CrashedPanel />;
}

function NotFoundPanel() {
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

function CrashedPanel() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-24 dark:bg-gray-900">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
          We hit a snag rendering this page. Try reloading, or head back home —
          if it keeps happening, our team has been notified.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-800 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
            Reload
          </button>
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
