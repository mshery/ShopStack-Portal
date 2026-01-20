import { useImpersonation } from "@/hooks/useImpersonation";
import { ArrowLeft, UserCircle } from "lucide-react";

/**
 * ImpersonationBanner - Shows when admin is impersonating a tenant
 *
 * Displays at top of page with "Return to Platform" button
 */
export function ImpersonationBanner() {
    const { vm, actions } = useImpersonation();

    if (!vm.isImpersonating) return null;

    return (
        <div className="bg-warning-500 text-white px-4 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <UserCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                        Viewing as tenant user • Impersonation mode active
                    </span>
                </div>
                <button
                    onClick={actions.returnToPlatform}
                    className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/30"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Return to Platform
                </button>
            </div>
        </div>
    );
}
