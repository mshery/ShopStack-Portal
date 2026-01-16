import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomersStore } from "@/stores/customers.store";
import { useAuthStore } from "@/stores/auth.store";

export default function AddCustomerPage() {
  const navigate = useNavigate();
  const { addCustomer } = useCustomersStore();
  const { activeTenantId } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Phone is optional
    // Basic phone validation (10+ digits)
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeTenantId) return;

    // Validation
    if (!formData.name.trim()) {
      alert("Please enter a customer name");
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      alert("Please enter a valid phone number");
      return;
    }

    // Create customer
    addCustomer({
      id: `cust-${Date.now()}`,
      tenant_id: activeTenantId,
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      isDefault: false,
      createdAt: new Date().toISOString(),
    });

    // Navigate back to customers page
    navigate("/tenant/customers");
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
                {formData.email && !validateEmail(formData.email) && (
                  <p className="text-sm text-red-600 mt-1">
                    Please enter a valid email address
                  </p>
                )}
              </div>

              <div>
                <Label>Phone (Optional)</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                {formData.phone && !validatePhone(formData.phone) && (
                  <p className="text-sm text-red-600 mt-1">
                    Please enter a valid phone number
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/tenant/customers")}
            >
              Cancel
            </Button>
            <Button type="submit">Add Customer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
