import { useState } from "react";
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
  Search,
  Pencil,
  Trash2,
  Tag,
  X,
  Check,
  LayoutGrid,
  List,
} from "lucide-react";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Input } from "@/shared/components/ui/input";
import { formatDateTime } from "@/shared/utils/format";
import DeleteConfirmationModal from "@/shared/components/feedback/DeleteConfirmationModal";
import Pagination from "@/shared/components/feedback/Pagination";
import { PageSkeleton } from "@/shared/components/skeletons/PageSkeleton";
import { useCategoriesScreen } from "../hooks/useCategoriesScreen";
import type { Category } from "../api/catalogApi";

const ITEMS_PER_PAGE = 10;

export default function CategoriesPage() {
  const { status, vm, actions } = useCategoriesScreen();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    actions.create(newCategoryName.trim());
    setNewCategoryName("");
    setIsAddingNew(false);
  };

  if (status === "loading") {
    return <PageSkeleton />;
  }

  if (status === "error") {
    return (
      <div className="space-y-6 p-6">
        <Card className="rounded-2xl border-red-200 dark:border-red-800">
          <CardContent className="p-8 text-center">
            <EmptyState
              title="Failed to load categories"
              description="Please try again later"
            />
            <Button onClick={() => actions.refresh()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              Categories
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage product categories for your store
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800/50 rounded-full">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {vm.totalCategories}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              total
            </span>
          </div>
        </div>
        <Button
          className="gap-2 rounded-xl bg-brand-600 hover:bg-brand-700"
          onClick={() => setIsAddingNew(true)}
          disabled={vm.isCreating}
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search categories..."
            className="h-10 pl-9 rounded-xl border-gray-200 dark:border-gray-800"
            value={vm.search}
            onChange={(e) => actions.setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "table"
                ? "bg-white dark:bg-gray-700 shadow-sm text-brand-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-white dark:bg-gray-700 shadow-sm text-brand-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add New Form */}
      {isAddingNew && (
        <Card className="rounded-2xl border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
                <Tag className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1">
                <Input
                  autoFocus
                  placeholder="Enter category name..."
                  className="h-10 border-brand-200 dark:border-brand-800"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                />
              </div>
              <Button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || vm.isCreating}
                className="h-10 px-4 bg-brand-600 hover:bg-brand-700"
              >
                <Check className="h-4 w-4 mr-1" />
                {vm.isCreating ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewCategoryName("");
                }}
                className="h-10 px-4"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {status === "empty" && !isAddingNew ? (
        <Card className="rounded-2xl border-gray-200 dark:border-gray-800">
          <CardContent className="p-8">
            <EmptyState
              title="No categories found"
              description="Start by adding your first product category"
            />
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card className="rounded-2xl border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                  >
                    Category
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                  >
                    Products
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                  >
                    Created On
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-end text-xs uppercase tracking-wider w-32"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.categories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]"
                  >
                    <TableCell className="px-6 py-4">
                      {vm.editingId === category.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            autoFocus
                            value={vm.editingName}
                            onChange={(e) =>
                              actions.setEditingName(e.target.value)
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" && actions.saveEdit()
                            }
                            className="h-9 max-w-xs"
                          />
                          <button
                            onClick={actions.saveEdit}
                            disabled={vm.isUpdating}
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={actions.cancelEdit}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
                            <Tag className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {category.name}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-500">
                      {category._count?.products ?? 0} products
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-500">
                      {formatDateTime(category.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-end">
                      {vm.editingId !== category.id && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => actions.startEdit(category)}
                            className="p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setCategoryToDelete(category)}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              currentPage={vm.currentPage}
              totalPages={vm.totalPages}
              totalItems={vm.totalCategories}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={actions.setCurrentPage}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vm.categories.map((category) => (
              <Card
                key={category.id}
                className="rounded-2xl border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow group"
              >
                <CardContent className="p-5">
                  {vm.editingId === category.id ? (
                    <div className="space-y-3">
                      <Input
                        autoFocus
                        value={vm.editingName}
                        onChange={(e) => actions.setEditingName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && actions.saveEdit()
                        }
                        className="h-10"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={actions.saveEdit}
                          size="sm"
                          disabled={vm.isUpdating}
                          className="flex-1 bg-brand-600 hover:bg-brand-700"
                        >
                          {vm.isUpdating ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          onClick={actions.cancelEdit}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
                          <Tag className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => actions.startEdit(category)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setCategoryToDelete(category)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {category._count?.products ?? 0} products
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Added {formatDateTime(category.createdAt)}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {vm.totalPages > 1 && (
            <Card className="rounded-2xl border-gray-200 dark:border-gray-800">
              <Pagination
                currentPage={vm.currentPage}
                totalPages={vm.totalPages}
                totalItems={vm.totalCategories}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={actions.setCurrentPage}
              />
            </Card>
          )}
        </>
      )}

      <DeleteConfirmationModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            actions.delete(categoryToDelete.id);
            setCategoryToDelete(null);
          }
        }}
        title="Delete Category"
        message="Are you sure you want to delete this category? Categories with products cannot be deleted."
        itemName={categoryToDelete?.name}
      />
    </div>
  );
}
