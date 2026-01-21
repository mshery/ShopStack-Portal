import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                        : isCurrent
                          ? "bg-brand-500 text-white ring-4 ring-brand-100 dark:ring-brand-900/30 shadow-lg shadow-brand-500/30"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-medium transition-colors ${
                      isCurrent
                        ? "text-brand-600 dark:text-brand-400"
                        : isCompleted
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 -mt-12">
                  <div
                    className={`h-full transition-all duration-500 ${
                      currentStep > step.id
                        ? "bg-brand-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
