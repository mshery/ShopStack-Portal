import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, EnvelopeSvgIcon } from "@/shared/icons";
import Label from "@/shared/components/form/Label";
import InputField from "@/shared/components/form/InputField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo, just show success message
    setIsSubmitted(true);
  };

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
              Forgot Password?
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-6 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40">
                  <EnvelopeSvgIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-semibold text-green-800 dark:text-green-300">
                    Check your email
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    We sent a password reset link to{" "}
                    <span className="font-medium">{email}</span>
                  </p>
                  <p className="mt-3 text-sm text-green-600 dark:text-green-500">
                    Didn't receive the email?{" "}
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="font-medium underline hover:no-underline"
                    >
                      Click to resend
                    </button>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <InputField
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <span className="absolute z-30 -translate-y-1/2 pointer-events-none right-4 top-1/2">
                      <EnvelopeSvgIcon className="fill-gray-400 dark:fill-gray-500 size-5" />
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </form>
          )}

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
