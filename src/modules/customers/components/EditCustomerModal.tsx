import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useUpdateCustomer } from "../api/queries";
import type { Customer } from "@/shared/types/models";

interface EditCustomerModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditCustomerModal({
  customer,
  isOpen,
  onClose,
}: EditCustomerModalProps) {
  const updateMutation = useUpdateCustomer();
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email || "",
    phone: customer.phone || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(
      {
        id: customer.id,
        data: {
          ...formData,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Customer
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update customer details to keep your records up-to-date.
          </p>
        </div>
        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="px-2 pb-3">
            <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
              Customer Information
            </h5>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2">
                <Label>Customer Name</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1-555-0123"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Close
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
