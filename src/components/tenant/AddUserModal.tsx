import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Stepper } from "../ui/Stepper";
import { useUsersStore } from "../../stores/users.store";
import { useAuthStore } from "../../stores/auth.store";
import {
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Shield,
  CheckCircle,
} from "lucide-react";
import type { UserRole, UserStatus } from "../../types";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const USER_ROLES: { value: UserRole; label: string; description: string }[] = [
  {
    value: "owner",
    label: "Owner",
    description: "Full access to all features",
  },
  {
    value: "cashier",
    label: "Cashier",
    description: "POS access and basic order history",
  },
];

const USER_STATUSES: { value: UserStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const STEPS = [
  { id: 1, title: "Personal Info", description: "Basic details" },
  { id: 2, title: "Security", description: "Password setup" },
  { id: 3, title: "Role & Status", description: "Permissions" },
  { id: 4, title: "Review", description: "Confirm details" },
];

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const { addTenantUser, tenantUsers } = useUsersStore();
  const { activeTenantId } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "cashier" as UserRole,
    status: "active" as UserStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "cashier",
      status: "active",
    });
    setErrors({});
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailUniqueness = (email: string): boolean => {
    return !tenantUsers.some(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.tenant_id === activeTenantId,
    );
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      } else if (!checkEmailUniqueness(formData.email)) {
        newErrors.email = "This email is already in use";
      }
    }

    if (step === 2) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!activeTenantId) return;

    const fullName =
      `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

    addTenantUser({
      id: `user-${Date.now()}`,
      tenant_id: activeTenantId,
      name: fullName,
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
      status: formData.status,
      avatarUrl: null,
    });

    handleClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Personal Information
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter the team member's basic details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <Label>First Name *</Label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                />
              </div>

              <div className="lg:col-span-2">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="user@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Account Security
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Set up a secure password for the account
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Minimum 8 characters"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <Label>Confirm Password *</Label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Password requirements:</strong>
              </p>
              <ul className="mt-2 text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>At least 8 characters long</li>
                <li>Mix of letters and numbers recommended</li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Role & Permissions
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Define access level and account status
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <Label>Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.label}</span>
                          <span className="text-xs text-gray-500">
                            {role.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  {
                    USER_ROLES.find((r) => r.value === formData.role)
                      ?.description
                  }
                </p>
              </div>

              <div className="lg:col-span-2">
                <Label>Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Review & Confirm
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please review the information before adding the user
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Personal Information
                </h6>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Name:
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {formData.firstName}{" "}
                      {formData.lastName || "(No last name)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Email:
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {formData.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Role & Permissions
                </h6>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Role:
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90 capitalize">
                      {formData.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Status:
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90 capitalize">
                      {formData.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[800px] m-4">
      <div className="relative w-full max-w-[800px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-10 max-h-[90vh]">
        {/* Header */}
        <div className="mb-8">
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Add Team Member
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Follow the steps to add a new user to your team
          </p>
        </div>

        {/* Stepper */}
        <Stepper steps={STEPS} currentStep={currentStep} />

        {/* Step Content */}
        <div className="mt-8 min-h-[300px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={handleNext} className="gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Add User
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
