import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "@/shared/icons";

/**
 * ResetPasswordPage — informational only.
 *
 * Like `ForgotPasswordPage`, this route used to render a stub form
 * that pretended to reset the password and redirected to `/login`
 * without actually changing anything. Until the backend `/auth/reset-password`
 * endpoint and email-delivered reset tokens land (see auth.routes.ts),
 * the page shows a clear explanation instead.
 *
 * If a real reset-token URL eventually points here, this page should
 * be replaced with a form that posts the token + new password to the
 * backend.
 */
export default function ResetPasswordPage() {
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
              Reset password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Self-serve password reset isn&apos;t available yet.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/5">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If you arrived here from a password-reset email, that
              link is no longer valid. Please contact your workspace
              owner (or platform support if you are the owner) to
              have your password reset.
            </p>
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
