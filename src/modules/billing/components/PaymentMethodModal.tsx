import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import type { BillingPaymentMethod, BillingPaymentMethodType, CardBrand } from "@/shared/types/models";

interface PaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    method: BillingPaymentMethod | null;
    onSave: (method: Partial<BillingPaymentMethod>) => void;
}

export function PaymentMethodModal({
    isOpen,
    onClose,
    method,
    onSave,
}: PaymentMethodModalProps) {
    const [type, setType] = useState<BillingPaymentMethodType>(method?.type || "card");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryMonth, setExpiryMonth] = useState(method?.expiryMonth ? String(method.expiryMonth) : "");
    const [expiryYear, setExpiryYear] = useState(method?.expiryYear ? String(method.expiryYear) : "");
    const [brand, setBrand] = useState<CardBrand>(method?.brand || "visa");
    const [email, setEmail] = useState(method?.email || "");
    const [isDefault, setIsDefault] = useState(method?.isDefault || false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data: Partial<BillingPaymentMethod> = {
            type,
            isDefault,
        };

        if (type === "card") {
            data.last4 = cardNumber.slice(-4) || method?.last4;
            data.expiryMonth = parseInt(expiryMonth) || undefined;
            data.expiryYear = parseInt(expiryYear) || undefined;
            data.brand = brand;
        } else {
            data.email = email;
        }

        onSave(data);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {method ? "Edit Payment Method" : "Add Payment Method"}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Payment Type
                        </label>
                        <Select value={type} onValueChange={(v) => setType(v as BillingPaymentMethodType)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="card">Credit/Debit Card</SelectItem>
                                <SelectItem value="paypal">PayPal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {type === "card" ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Card Brand
                                </label>
                                <Select value={brand} onValueChange={(v) => setBrand(v as CardBrand)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="visa">Visa</SelectItem>
                                        <SelectItem value="mastercard">Mastercard</SelectItem>
                                        <SelectItem value="amex">American Express</SelectItem>
                                        <SelectItem value="discover">Discover</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Card Number
                                </label>
                                <Input
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                                    placeholder={method?.last4 ? `**** **** **** ${method.last4}` : "1234 5678 9012 3456"}
                                    maxLength={19}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {method ? "Leave empty to keep existing number" : ""}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Expiry Month
                                    </label>
                                    <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="MM" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                                <SelectItem key={m} value={String(m)}>
                                                    {String(m).padStart(2, "0")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Expiry Year
                                    </label>
                                    <Select value={expiryYear} onValueChange={setExpiryYear}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="YYYY" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                                                <SelectItem key={y} value={String(y)}>
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                PayPal Email
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isDefault"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300">
                            Set as default payment method
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <Button variant="outline" type="button" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-brand-500 hover:bg-brand-600">
                        {method ? "Save Changes" : "Add Payment Method"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

