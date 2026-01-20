import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";

// Auth Module
import {
    ProtectedRoute,
    LoginPage,
    SignUpPage,
    ForgotPasswordPage,
    ResetPasswordPage,
} from "@/modules/auth";

// Platform Module
import {
    PlatformDashboardPage,
    TenantsListPage,
    CreateTenantPage,
    TenantDetailPage,
    PlatformLogsPage,
    PlatformSettingsPage,
} from "@/modules/platform";

// Tenant Module
import {
    TenantDashboardPage,
    TenantSettingsPage,
    TenantUsersPage,
    AddTenantUserPage,
    ProfilePage,
} from "@/modules/tenant";

// Products Module
import {
    ProductsPage,
    ProductDetailsPage,
    AddProductPage,
} from "@/modules/products";

// Catalog Module
import { CategoriesPage, BrandsPage } from "@/modules/catalog";

// Customers Module
import { CustomersPage, AddCustomerPage } from "@/modules/customers";

// Vendors Module
import { VendorsPage } from "@/modules/vendors";

// Purchases Module
import { PurchasesPage, PurchaseDetailsPage } from "@/modules/purchases";

// Inventory Module
import { InventoryPage } from "@/modules/inventory";

// Expenses Module
import { ExpensesPage } from "@/modules/expenses";

// POS Module
import { CartPage, SalesHistoryPage } from "@/modules/pos";

// Billing Module
import { BillingPage } from "@/modules/billing";

// Reports Module
import { ReportsPage } from "@/modules/reports";

// Demo pages
import IconDemoPage from "@/shared/pages/IconDemoPage";

export const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <Navigate to="/login" replace />,
        },
        {
            path: "/login",
            element: <AuthLayout />,
            children: [
                {
                    index: true,
                    element: <LoginPage />,
                },
            ],
        },
        {
            path: "/signup",
            element: <AuthLayout />,
            children: [
                {
                    index: true,
                    element: <SignUpPage />,
                },
            ],
        },
        {
            path: "/forgot-password",
            element: <AuthLayout />,
            children: [
                {
                    index: true,
                    element: <ForgotPasswordPage />,
                },
            ],
        },
        {
            path: "/reset-password",
            element: <AuthLayout />,
            children: [
                {
                    index: true,
                    element: <ResetPasswordPage />,
                },
            ],
        },
        {
            path: "/icon-demo",
            element: <IconDemoPage />,
        },
        {
            path: "/platform",
            element: <AppLayout />,
            children: [
                {
                    index: true,
                    element: <PlatformDashboardPage />,
                },
                {
                    path: "tenants",
                    element: <TenantsListPage />,
                },
                {
                    path: "tenants/new",
                    element: <CreateTenantPage />,
                },
                {
                    path: "tenants/:tenantId",
                    element: <TenantDetailPage />,
                },
                {
                    path: "logs",
                    element: <PlatformLogsPage />,
                },
                {
                    path: "settings",
                    element: <PlatformSettingsPage />,
                },
            ],
        },
        {
            path: "/tenant",
            element: <AppLayout />,
            children: [
                {
                    index: true,
                    element: (
                        <ProtectedRoute requiredPermission="dashboard:view">
                            <TenantDashboardPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "users",
                    element: (
                        <ProtectedRoute requiredPermission="users:view">
                            <TenantUsersPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "users/new",
                    element: (
                        <ProtectedRoute requiredPermission="users:create">
                            <AddTenantUserPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "products",
                    element: (
                        <ProtectedRoute requiredPermission="products:view">
                            <ProductsPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "products/:id",
                    element: (
                        <ProtectedRoute requiredPermission="products:view">
                            <ProductDetailsPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "products/new",
                    element: (
                        <ProtectedRoute requiredPermission="products:create">
                            <AddProductPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "categories",
                    element: (
                        <ProtectedRoute requiredPermission="settings:view">
                            <CategoriesPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "brands",
                    element: (
                        <ProtectedRoute requiredPermission="settings:view">
                            <BrandsPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "customers",
                    element: (
                        <ProtectedRoute requiredPermission="customers:view">
                            <CustomersPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "customers/new",
                    element: (
                        <ProtectedRoute requiredPermission="customers:create">
                            <AddCustomerPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "settings",
                    element: (
                        <ProtectedRoute requiredPermission="settings:view">
                            <TenantSettingsPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "profile",
                    element: <ProfilePage />,
                },
                {
                    path: "pos/sell",
                    element: (
                        <ProtectedRoute requiredPermission="pos:access">
                            <CartPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "pos/sales",
                    element: (
                        <ProtectedRoute requiredPermission="sales:view">
                            <SalesHistoryPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "expenses",
                    element: (
                        <ProtectedRoute requiredPermission="expenses:view">
                            <ExpensesPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "inventory",
                    element: (
                        <ProtectedRoute requiredPermission="inventory:view">
                            <InventoryPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "vendors",
                    element: (
                        <ProtectedRoute requiredPermission="vendors:view">
                            <VendorsPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "purchases",
                    element: (
                        <ProtectedRoute requiredPermission="purchases:view">
                            <PurchasesPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "purchases/:id",
                    element: (
                        <ProtectedRoute requiredPermission="purchases:view">
                            <PurchaseDetailsPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "reports",
                    element: (
                        <ProtectedRoute requiredPermission="reports:view">
                            <ReportsPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "billing",
                    element: (
                        <ProtectedRoute requiredPermission="billing:view">
                            <BillingPage />
                        </ProtectedRoute>
                    ),
                },
            ],
        },
    ],
    {
        future: {
            v7_relativeSplatPath: true,
        },
    },
);
