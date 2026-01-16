import { cn } from "@/utils/cn";
import { Check } from "lucide-react";
import { motion } from "motion/react";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepperProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div className="mb-8 w-full">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-brand-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>
            Step {currentStep + 1} of {steps.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      <nav aria-label="Progress">
        <ol className="flex items-start justify-between gap-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = onStepClick && index <= currentStep;

            return (
              <li key={step.id} className="relative flex-1">
                {/* Connector line */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-[calc(50%+24px)] right-[calc(-50%+24px)] top-6 -z-10 hidden h-0.5 md:block">
                    <div className="h-full w-full bg-gray-200">
                      <motion.div
                        className="h-full bg-brand-600"
                        initial={{ width: 0 }}
                        animate={{ width: isCompleted ? "100%" : "0%" }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={cn(
                    "group relative flex w-full flex-col items-center transition-all",
                    isClickable && "cursor-pointer hover:scale-105",
                  )}
                >
                  {/* Step circle */}
                  <motion.span
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      boxShadow: isCurrent
                        ? "0 0 0 4px rgba(70, 95, 255, 0.1)"
                        : "0 0 0 0px rgba(70, 95, 255, 0)",
                    }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold transition-all",
                      isCompleted && "bg-brand-600 text-white shadow-lg",
                      isCurrent &&
                        "border-2 border-brand-600 bg-white text-brand-600 shadow-lg",
                      !isCompleted &&
                        !isCurrent &&
                        "border-2 border-gray-300 bg-white text-gray-400",
                    )}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Check className="h-6 w-6" strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </motion.span>

                  {/* Step label */}
                  <motion.span
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.05 : 1,
                    }}
                    className={cn(
                      "mt-3 text-center text-sm font-semibold transition-colors",
                      isCurrent
                        ? "text-brand-600"
                        : isCompleted
                          ? "text-gray-900"
                          : "text-gray-400",
                    )}
                  >
                    {step.title}
                  </motion.span>

                  {/* Step description */}
                  {step.description && (
                    <span className="mt-1 hidden text-center text-xs text-gray-500 md:block">
                      {step.description}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
