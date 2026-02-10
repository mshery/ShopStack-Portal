import type React from "react";
import type { FC } from "react";
import { cn } from "@/shared/utils/cn";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  label?: string;
  required?: boolean;
}

const InputField: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  label,
  required = false,
}) => {
  const inputId = id || name;

  const baseStyles = cn(
    "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm",
    "shadow-theme-xs placeholder:text-gray-400",
    "transition-all duration-150",
    "focus:outline-none focus:ring-2",
    "dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30",
  );

  const stateStyles = cn(
    disabled && [
      "text-gray-500 border-gray-300 bg-gray-100 cursor-not-allowed opacity-60",
      "dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    ],
    error &&
      !disabled && [
        "border-error-500 bg-error-50/50",
        "focus:border-error-500 focus:ring-error-500/20",
        "dark:bg-error-900/10 dark:border-error-500 dark:focus:border-error-500",
      ],
    success &&
      !disabled && [
        "border-success-500 bg-success-50/50",
        "focus:border-success-500 focus:ring-success-500/20",
        "dark:bg-success-900/10 dark:border-success-500 dark:focus:border-success-500",
      ],
    !disabled &&
      !error &&
      !success && [
        "bg-transparent text-gray-800 border-gray-300",
        "focus:border-brand-500 focus:ring-brand-500/20",
        "dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-400",
      ],
  );

  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={hint ? `${inputId}-hint` : undefined}
        className={cn(baseStyles, stateStyles, className)}
      />
      {hint && (
        <p
          id={`${inputId}-hint`}
          className={cn(
            "mt-1.5 text-xs",
            error && "text-error-500",
            success && "text-success-500",
            !error && !success && "text-gray-500 dark:text-gray-400",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default InputField;
