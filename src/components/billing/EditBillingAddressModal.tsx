import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BillingAddress } from "@/types";

interface EditBillingAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    address: BillingAddress | null;
    onSave: (address: BillingAddress) => void;
}

export function EditBillingAddressModal({
    isOpen,
    onClose,
    address,
    onSave,
}: EditBillingAddressModalProps) {
    const [formData, setFormData] = useState<BillingAddress>(
        address || {
            name: "",
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
            vatNumber: null,
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {address ? "Edit Billing Address" : "Add Billing Address"}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name / Company
                        </label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe or Company Inc."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Street Address
                        </label>
                        <Input
                            value={formData.street}
                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                            placeholder="123 Main Street"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                City
                            </label>
                            <Input
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="New York"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                State
                            </label>
                            <Input
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                placeholder="NY"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                ZIP/Postal Code
                            </label>
                            <Input
                                value={formData.zipCode}
                                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                placeholder="10001"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Country
                            </label>
                            <Input
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                placeholder="United States"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            VAT Number (Optional)
                        </label>
                        <Input
                            value={formData.vatNumber ?? ""}
                            onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value || null })}
                            placeholder="VAT123456789"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <Button variant="outline" type="button" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-brand-500 hover:bg-brand-600">
                        Save Address
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
