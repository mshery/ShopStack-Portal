import { Modal } from "../ui/Modal";
import { Button } from "../ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>

          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {message}
            {itemName && (
              <span className="block mt-2 font-semibold text-gray-900 dark:text-white">
                "{itemName}"
              </span>
            )}
          </p>

          <div className="flex w-full gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
