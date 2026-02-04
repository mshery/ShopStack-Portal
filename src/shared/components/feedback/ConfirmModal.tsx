import { Modal } from "../ui/Modal";
import { Button } from "../ui/button";
import { AlertTriangle, HelpCircle } from "lucide-react";

type ConfirmModalVariant = "warning" | "info" | "danger";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  isLoading?: boolean;
}

const variantStyles: Record<
  ConfirmModalVariant,
  {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    buttonBg: string;
  }
> = {
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    buttonBg: "bg-amber-600 hover:bg-amber-700",
  },
  info: {
    icon: HelpCircle,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    buttonBg: "bg-blue-600 hover:bg-blue-700",
  },
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    buttonBg: "bg-red-600 hover:bg-red-700",
  },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  isLoading = false,
}: ConfirmModalProps) {
  const styles = variantStyles[variant];
  const IconComponent = styles.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${styles.iconBg}`}
          >
            <IconComponent className={`h-8 w-8 ${styles.iconColor}`} />
          </div>

          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>

          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>

          <div className="flex w-full gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className={`flex-1 ${styles.buttonBg} text-white`}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
