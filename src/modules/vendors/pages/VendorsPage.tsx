import { useVendorsScreen } from "@/modules/vendors/hooks/useVendorsScreen";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
import {
  Plus,
  User,
  Mail,
  Phone,
  MapPin,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Input } from "@/shared/components/ui/input";
import { formatDateTime } from "@/shared/utils/format";
import AddVendorModal from "../components/AddVendorModal";
import EditVendorModal from "../components/EditVendorModal";
import DeleteConfirmationModal from "@/shared/components/feedback/DeleteConfirmationModal";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function VendorsPage() {
  const { status, vm, actions } = useVendorsScreen();

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-8">
        <EmptyState
          title="Something went wrong"
          description="Failed to load vendors. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Vendors
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your suppliers and contacts
          </p>
        </div>
        <Button
          className="gap-2 rounded-xl bg-brand-600 hover:bg-brand-700"
          onClick={() => actions.setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search vendors..."
          className="h-10 pl-9 rounded-xl border-gray-200 dark:border-gray-800"
          value={vm.search}
          onChange={(e) => actions.setSearch(e.target.value)}
        />
      </div>

      <Card className="rounded-2xl border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <CardContent className="p-0">
          {vm.isEmpty && !vm.search ? (
            <div className="p-8">
              <EmptyState
                title="No vendors found"
                description="Start by adding your first supplier"
              />
            </div>
          ) : (
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                  >
                    Vendor Info
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                  >
                    Contact
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                  >
                    Address
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                  >
                    Terms
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                  >
                    Added On
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-end text-xs uppercase tracking-wider"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.vendors.map((vendor) => (
                  <TableRow
                    key={vendor.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {vendor.name}
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          {vendor.contactPerson}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        {vendor.email && (
                          <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                            <Mail className="h-3 w-3" />
                            {vendor.email}
                          </div>
                        )}
                        {vendor.phone && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Phone className="h-3 w-3" />
                            {vendor.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 max-w-[200px]">
                      <div className="flex items-start gap-1.5 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{vendor.address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="text-xs font-semibold px-2 py-1 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 inline-block">
                        {vendor.paymentTerms}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs text-gray-500">
                      {formatDateTime(vendor.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => actions.setSelectedVendor(vendor)}
                          className="p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                          title="Edit vendor"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => actions.setVendorToDelete(vendor)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete vendor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Vendor Modal */}
      <AddVendorModal
        isOpen={vm.isAddModalOpen}
        onClose={() => actions.setIsAddModalOpen(false)}
        onCreate={actions.createVendor}
      />

      {/* Edit Vendor Modal */}
      {vm.selectedVendor && (
        <EditVendorModal
          vendor={vm.selectedVendor}
          isOpen={!!vm.selectedVendor}
          onClose={() => actions.setSelectedVendor(null)}
          onUpdate={actions.updateVendor}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!vm.vendorToDelete}
        onClose={() => actions.setVendorToDelete(null)}
        onConfirm={actions.deleteVendor}
        title="Delete Vendor"
        message="Are you sure you want to delete this vendor? This action cannot be undone."
        itemName={vm.vendorToDelete?.name}
      />
    </div>
  );
}
