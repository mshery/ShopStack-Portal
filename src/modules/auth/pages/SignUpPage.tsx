import { Link } from "react-router-dom";

/**
 * SignUpPage — informational only.
 *
 * ShopStack is a B2B multi-tenant SaaS: new organizations are provisioned
 * by a platform super-admin via the Create Tenant flow, and individual
 * users are added by the tenant owner from inside the workspace. There is
 * no public self-signup path. This page exists so any stale bookmark,
 * email link, or "Sign up" CTA shows a friendly explanation instead of a
 * 404 or a dead stub form.
 */
export default function SignUpPage() {
  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ShopStack accounts are created by your organization
              administrator — not through self-signup.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/5">
            <h2 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              How do I get access?
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  New to ShopStack?
                </span>{" "}
                Contact our sales team to provision a workspace for your
                organization.
              </li>
              <li>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Joining an existing workspace?
                </span>{" "}
                Ask your organization owner to invite you from the Users
                page inside ShopStack.
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
