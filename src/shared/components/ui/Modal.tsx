import { useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  title,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";

      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  // When a title is passed we render a proper header bar with a
  // border separator. When no title is passed (the AddPurchaseModal /
  // AddVendorModal pattern where the consumer renders its own h4
  // inside), skip the header bar entirely — drawing an empty bar
  // with a divider line above the consumer's own heading was the
  // "redundant line" UX bug. The close button stays, just floated
  // absolutely over the top-right corner of the panel.
  const hasHeader = Boolean(title);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-y-auto z-[9999]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full rounded-2xl bg-white shadow-xl
          dark:bg-gray-900 dark:border dark:border-gray-800
          animate-in fade-in zoom-in-95 duration-200
          ${className ?? ""}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {hasHeader && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3
              id="modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {title}
            </h3>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {!hasHeader && showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-800/70 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {children}
      </div>
    </div>
  );
};
