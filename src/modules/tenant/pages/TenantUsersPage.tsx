import { useState } from "react";
import PageBreadcrumb from "@/shared/components/feedback/PageBreadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Link } from "react-router-dom";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useTenantUsersScreen } from "../hooks/useTenantUsersScreen";
import { UserCircleIcon } from "@/shared/components/ui/Icons";
import EditUserModal from "../components/EditUserModal";
import DeleteConfirmationModal from "@/shared/components/feedback/DeleteConfirmationModal";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { TeamMember } from "../api/tenantApi";
import type { TenantUser } from "@/shared/types/models";

export default function TenantUsersPage() {
  const { status, vm, actions } = useTenantUsersScreen();
  const { can } = usePermissions();
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
  const [userToDelete, setUserToDelete] = useState<TeamMember | null>(null);

  if (status === "error") return <div>Error: Tenant context not found.</div>;

  return (
    <>
      <PageBreadcrumb pageTitle="Users" />

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            value={vm.search}
            onChange={(e) => actions.setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Usage
            </span>
            <span
              className={`text-sm font-bold ${
                !vm.canAddMore ? "text-red-500" : "text-gray-700"
              }`}
            >
              {vm.currentCount} / {vm.maxUsers}
            </span>
          </div>

          {can("users:create") && (
            <Link
              to={vm.canAddMore ? "/tenant/users/new" : "#"}
              className={!vm.canAddMore ? "cursor-not-allowed opacity-50" : ""}
              onClick={(e) => !vm.canAddMore && e.preventDefault()}
            >
              <Button
                disabled={!vm.canAddMore}
                title={!vm.canAddMore ? "User limit reached for your plan" : ""}
              >
                Add New User
              </Button>
            </Link>
          )}
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
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created At
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
              {vm.users.map((user: TeamMember) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.01]"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 dark:text-white/90 text-theme-sm">
                          {user.name}
                        </span>
                        <span className="block text-gray-500 dark:text-gray-400 text-theme-xs">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge color="info" variant="light" size="sm">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      color={user.status === "active" ? "success" : "error"}
                      variant="light"
                      size="sm"
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400 text-theme-sm text-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                        title="Edit user"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {(vm.isOwner || user.createdBy === "tenant") && (
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {vm.users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {vm.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {vm.pagination.currentPage} of {vm.pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={actions.prevPage}
                disabled={vm.pagination.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={actions.nextPage}
                disabled={
                  vm.pagination.currentPage === vm.pagination.totalPages
                }
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <EditUserModal
          user={selectedUser as unknown as TenantUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={async (id, data) => {
            const result = await actions.updateUser(id, {
              name: data.name,
              email: data.email,
              role: data.role,
              status: data.status,
              phone: data.phone || undefined,
            });
            if (result.success) {
              setSelectedUser(null);
            }
            return result;
          }}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={async () => {
          if (userToDelete) {
            const result = await actions.deleteUser(userToDelete.id);
            if (result.success) {
              setUserToDelete(null);
            }
          }
        }}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        itemName={userToDelete?.name}
      />
    </>
  );
}
