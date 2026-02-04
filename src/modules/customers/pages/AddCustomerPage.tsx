import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useCreateCustomer } from "../api/queries";
import { useAuthStore } from "@/modules/auth";

export default function AddCustomerPage() {
  const navigate = useNavigate();
  const createMutation = useCreateCustomer();
  const { activeTenantId } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError(null);
  };

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Phone is optional
    // Basic phone validation
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!activeTenantId) {
      setFormError("Session expired. Please reload the page.");
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      setFormError("Please enter a customer name");
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      setFormError("Please enter a valid phone number");
      return;
    }

    // Create customer via API
    createMutation.mutate(
      {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigate("/tenant/customers");
        },
        onError: (error) => {
          console.error("Failed to create customer:", error);
          setFormError("Failed to create customer. Please try again.");
        },
      },
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add Customer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Add a new customer to your database
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400 rounded-lg">
              {formError}
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Customer Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Customer Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <Label>Email (Optional)</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <Label>Phone (Optional)</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/tenant/customers")}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Add Customer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
