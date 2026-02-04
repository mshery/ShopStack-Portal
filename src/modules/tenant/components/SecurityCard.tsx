import { useState } from "react";
import { useModal } from "@/shared/hooks/useModal";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useProfileScreen } from "../hooks/useProfileScreen";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function SecurityCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { vm, actions } = useProfileScreen();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Local validation state
  // Using vm.errorMessage for API errors, but we can add local validation if needed

  const resetForm = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    actions.clearMessages();
  };

  const handleOpenModal = () => {
    resetForm();
    openModal();
  };

  const handleCloseModal = () => {
    resetForm();
    closeModal();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      // Create a temporary error message in the VM or just alert
      // Since we don't have a specific local error field in VM, we can use a local state or just return
      // But better to use the vm.errorMessage if possible, but that's managed by the hook based on API
      // Since we can't easily inject error into VM, let's just use the api error handling or browser validation
      // For now, simple check:
      alert("New passwords do not match!");
      return;
    }

    const result = await actions.changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });

    if (result.success) {
      // Don't close immediately to show success message?
      // The hook handles success message.
      // But if we close, we won't see it in the modal.
      // Maybe we want to close and show success toast?
      // The hook sets successMessage which is displayed in the modal.
      // Let's clear form and wait a bit or let user close?
      // Current pattern in UserMetaCard closes immediately.
      // But for password, maybe keep it open to show "Password Changed"?
      // Or close and rely on toast (if global toast exists).
      // The hook has: setTimeout(() => setSuccessMessage(null), 3000);
      // Let's close modal on success for now, assuming global toast or just done.
      // Actually, looking at UserMetaCard:
      // if (result.success) { closeModal(); }
      // So let's follow that.
      resetForm();
      closeModal();
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Security
              </h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your password and security preferences
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleOpenModal}
            className="w-full lg:w-auto mt-4 lg:mt-0"
          >
            Change Password
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-[500px] m-4"
      >
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="mb-6">
            <h4 className="mb-1 text-xl font-semibold text-gray-800 dark:text-white/90">
              Change Password
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your current password to set a new one.
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSave}>
            {vm.errorMessage && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
                {vm.errorMessage}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    className="pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Minimum 8 characters</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={vm.isChangingPassword}>
                {vm.isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
