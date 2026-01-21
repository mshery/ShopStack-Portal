import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useVendorsStore } from "@/modules/vendors";
import type { Vendor } from "@/shared/types/models";

interface EditVendorModalProps {
  vendor: Vendor;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditVendorModal({
  vendor,
  isOpen,
  onClose,
}: EditVendorModalProps) {
  const { updateVendor } = useVendorsStore();
  const [formData, setFormData] = useState({
    name: vendor.name,
    contactPerson: vendor.contactPerson,
    email: vendor.email || "",
    phone: vendor.phone || "",
    address: vendor.address,
    paymentTerms: vendor.paymentTerms,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (
      !formData.name ||
      !formData.contactPerson ||
      !formData.address ||
      !formData.paymentTerms
    ) {
      alert("Please fill in all required fields");
      return;
    }

    updateVendor(vendor.id, {
      name: formData.name,
      contactPerson: formData.contactPerson,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address,
      paymentTerms: formData.paymentTerms,
      updatedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Vendor
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update vendor information.
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
              Vendor Information
            </h5>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>Vendor Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Contact Person *</Label>
                <Input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    handleChange("contactPerson", e.target.value)
                  }
                  required
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Phone</Label>
                <Input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <Label>Address *</Label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label>Payment Terms *</Label>
                <Input
                  type="text"
                  value={formData.paymentTerms}
                  onChange={(e) => handleChange("paymentTerms", e.target.value)}
                  placeholder="e.g., Net 30, Net 60, COD"
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
