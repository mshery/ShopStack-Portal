import { Link } from "react-router-dom";
import { useState } from "react";
import PageBreadcrumb from "@/shared/components/feedback/PageBreadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useCustomersScreen } from "../hooks/useCustomersScreen";
import { UserCircleIcon } from "@/shared/components/ui/Icons";
import EditCustomerModal from "../components/EditCustomerModal";
import DeleteConfirmationModal from "@/shared/components/feedback/DeleteConfirmationModal";
import Pagination from "@/shared/components/feedback/Pagination";
import { Pencil, Trash2, Search } from "lucide-react";
import type { Customer } from "@/shared/types/models";

export default function CustomersPage() {
  const { status, vm, actions } = useCustomersScreen();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );

  // If initial load error (e.g. lost context)
  if (status === "error" && !vm.customers.length)
    return (
      <div className="p-6 text-center text-red-500">
        Error loading customers. Please try refreshing.
      </div>
    );

  return (
    <>
      <PageBreadcrumb pageTitle="Customers" />

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transaction-colors"
            value={vm.search}
            onChange={(e) => actions.setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => actions.refetch()}
            className="hidden sm:flex"
          >
            Refresh
          </Button>
          <Link to="/tenant/customers/new">
            <Button variant="primary">Add New Customer</Button>
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Customer
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Contact
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Type
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Joined
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {status === "loading" ? (
                // Loading Skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="space-y-2 animate-pulse">
                        <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </TableCell>
                    <TableCell colSpan={3} className="px-6 py-4">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : vm.isEmpty ? (
                // Empty State
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-6 py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    <UserCircleIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="font-medium">No customers found</p>
                    <p className="text-sm mt-1">
                      {vm.search
                        ? `No results for "${vm.search}"`
                        : "Get started by adding your first customer"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                // Data
                vm.customers.map((customer: Customer) => (
                  <TableRow
                    key={customer.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.01]"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <UserCircleIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="block font-medium text-gray-800 dark:text-white/90 text-theme-sm">
                          {customer.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="text-gray-500 dark:text-gray-400 text-theme-sm">
                        <div className="font-medium">
                          {customer.email || "No email"}
                        </div>
                        <div className="text-xs">
                          {customer.phone || "No phone"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        color={customer.isDefault ? "info" : "light"}
                        variant="light"
                        size="sm"
                      >
                        {customer.isDefault ? "Walk-in" : "Standard"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400 text-theme-sm text-nowrap">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                          title="Edit customer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {!customer.isDefault && (
                          <button
                            onClick={() => setCustomerToDelete(customer)}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination - Always show if items exist to confirm count to user */}
        {vm.totalItems > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <Pagination
              currentPage={vm.currentPage}
              totalPages={vm.totalPages}
              totalItems={vm.totalItems}
              itemsPerPage={vm.itemsPerPage}
              onPageChange={actions.setPage}
            />
          </div>
        )}
      </div>

      {selectedCustomer && (
        <EditCustomerModal
          key={selectedCustomer.id}
          customer={selectedCustomer}
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={() => {
          if (customerToDelete) {
            actions.deleteCustomer(customerToDelete.id);
            setCustomerToDelete(null);
          }
        }}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? Customers with purchase history will be anonymized instead of fully deleted."
        itemName={customerToDelete?.name}
      />
    </>
  );
}
