import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/modules/auth";
import { useTenantsStore } from "@/modules/platform";
import { AlertTriangle, ShieldOff } from "lucide-react";
import { motion } from "motion/react";

interface TenantStatusGuardProps {
    children: React.ReactNode;
}

/**
 * TenantStatusGuard - Blocks access for inactive/suspended tenants
 *
 * This component checks if the current tenant is active.
 * If the tenant is inactive or suspended, it shows a blocked screen
 * and prevents access to the system.
 */
export function TenantStatusGuard({ children }: TenantStatusGuardProps) {
    const navigate = useNavigate();
    const { activeTenantId, userType } = useAuthStore();
    const { tenants } = useTenantsStore();

    const currentTenant = tenants.find((t) => t.id === activeTenantId);

    useEffect(() => {
        // Only check for tenant users, not platform users
        if (
            userType === "tenant" &&
            currentTenant &&
            currentTenant.status !== "active"
        ) {
            // Tenant is blocked, stay on this guard screen
            console.warn(
                `Tenant ${currentTenant.companyName} is ${currentTenant.status}`,
            );
        }
    }, [currentTenant, userType]);

    // Platform users bypass the guard
    if (userType === "platform") {
        return <>{children}</>;
    }

    // No tenant found or tenant is active - allow access
    if (!currentTenant || currentTenant.status === "active") {
        return <>{children}</>;
    }

    // Tenant is inactive or suspended - show blocked screen
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/20 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-2xl">
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/30">
                            <ShieldOff className="h-10 w-10 text-white" strokeWidth={2} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Access Restricted
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Your organization's account is currently{" "}
                            <span className="font-semibold text-red-600">
                                {currentTenant.status}
                            </span>
                            .
                        </p>
                    </div>

                    {/* Warning Box */}
                    <div className="mt-6 rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
                        <div className="flex gap-3">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-orange-600" />
                            <div className="text-sm text-orange-900">
                                <p className="font-semibold">What does this mean?</p>
                                <p className="mt-1">
                                    You cannot access the system or perform any actions until your
                                    account status is changed to <strong>active</strong> by the
                                    platform administrator.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="mt-6 space-y-2 text-center text-sm text-gray-600">
                        <p>
                            <strong>Organization:</strong> {currentTenant.companyName}
                        </p>
                        <p>
                            <strong>Status:</strong>{" "}
                            <span
                                className={`font-semibold ${currentTenant.status === "inactive"
                                        ? "text-red-600"
                                        : "text-orange-600"
                                    }`}
                            >
                                {currentTenant.status}
                            </span>
                        </p>
                    </div>

                    {/* Action */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Please contact your platform administrator for assistance.
                        </p>
                        <button
                            onClick={() => {
                                // Log out the user
                                navigate("/login");
                            }}
                            className="mt-4 w-full rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 px-4 py-2.5 font-semibold text-white transition-all hover:from-gray-700 hover:to-gray-800"
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
