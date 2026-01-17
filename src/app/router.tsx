import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "./layouts/AuthLayout";
import AppLayout from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import SignUpPage from "@/pages/auth/SignUpPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

// Platform pages
import PlatformDashboardPage from "@/pages/platform/PlatformDashboardPage";
import TenantsListPage from "@/pages/platform/TenantsListPage";
import CreateTenantPage from "@/pages/platform/CreateTenantPage";
import TenantDetailPage from "@/pages/platform/TenantDetailPage";
import PlatformLogsPage from "@/pages/platform/PlatformLogsPage";
import PlatformSettingsPage from "@/pages/platform/PlatformSettingsPage";

// Tenant pages
import TenantDashboardPage from "@/pages/tenant/TenantDashboardPage";
import TenantUsersPage from "@/pages/tenant/TenantUsersPage";
import AddTenantUserPage from "@/pages/tenant/AddTenantUserPage";
import ProductsPage from "@/pages/tenant/ProductsPage";
import ProductDetailsPage from "@/pages/tenant/ProductDetailsPage";
import AddProductPage from "@/pages/tenant/AddProductPage";
import CategoriesPage from "@/pages/tenant/CategoriesPage";
import BrandsPage from "@/pages/tenant/BrandsPage";
import CustomersPage from "@/pages/tenant/CustomersPage";
import AddCustomerPage from "@/pages/tenant/AddCustomerPage";
import TenantSettingsPage from "@/pages/tenant/TenantSettingsPage";
import ProfilePage from "@/pages/tenant/ProfilePage";
import VendorsPage from "@/pages/tenant/VendorsPage";
import PurchasesPage from "@/pages/tenant/PurchasesPage";
import PurchaseDetailsPage from "@/pages/tenant/PurchaseDetailsPage";
import ReportsPage from "@/pages/tenant/ReportsPage";
import ExpensesPage from "@/pages/tenant/ExpensesPage";
import InventoryPage from "@/pages/tenant/InventoryPage";

// POS pages
import CartPage from "../pages/pos/CartPage";
import SalesHistoryPage from "@/pages/pos/SalesHistoryPage";

// Demo pages
import IconDemoPage from "@/pages/IconDemoPage";

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
          element: <ProfilePage />, // Profile is accessible to all
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
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
);
