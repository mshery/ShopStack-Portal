import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "@/shared/icons";

/**
 * ForgotPasswordPage — informational only.
 *
 * The backend has no self-serve password-reset endpoint yet (see
 * `auth.routes.ts` — the rate limiter is exported, the controller is
 * a TODO). Until that lands, render a clear "contact your admin"
 * message instead of a stub form that pretends to send an email and
 * silently drops the request on the floor.
 *
 * The recovery path for now:
 *   - Tenant user (owner / cashier) → ask the workspace owner to
 *     reset their password from `/tenant/users`.
 *   - Workspace owner / super-admin → contact platform support.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to sign in
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Forgot your password?
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ShopStack doesn&apos;t support self-serve password reset
              yet. Here&apos;s how to get back in:
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/5">
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Tenant user?
                </span>{" "}
                Ask your workspace owner to reset your password from
                the Users page inside ShopStack.
              </li>
              <li>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Workspace owner or super-admin?
                </span>{" "}
                Contact platform support to have your password
                manually reset.
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronLeftIcon className="size-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
