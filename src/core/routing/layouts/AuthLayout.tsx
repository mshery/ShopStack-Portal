import { Outlet, Link } from "react-router-dom";
import GridShape from "@/shared/components/feedback/GridShape";

export function AuthLayout() {
    return (
        <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
            <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
                {/* Form Side */}
                <Outlet />

                {/* Branding Side */}
                <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
                    <div className="relative flex items-center justify-center z-1">
                        <GridShape />
                        <div className="flex flex-col items-center max-w-xs">
                            <Link to="/" className="block mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">
                                        S
                                    </div>
                                    <span className="text-xl font-bold text-white">
                                        ShopStack
                                    </span>
                                </div>
                            </Link>
                            <p className="text-center text-gray-400 dark:text-white/60">
                                Multi-tenant SaaS Admin Dashboard
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
