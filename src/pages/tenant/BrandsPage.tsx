import { useMemo, useState } from "react";
import { useBrandsStore } from "@/stores/brands.store";
import { useAuthStore } from "@/stores/auth.store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Package,
    X,
    Check,
    LayoutGrid,
    List,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/utils/format";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Pagination from "@/components/common/Pagination";
import type { ProductBrand } from "@/types";

const ITEMS_PER_PAGE = 10;

export default function BrandsPage() {
    const { brands, addBrand, updateBrand, removeBrand } = useBrandsStore();
    const { activeTenantId } = useAuthStore();
    const [search, setSearch] = useState("");
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newBrandName, setNewBrandName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [brandToDelete, setBrandToDelete] = useState<ProductBrand | null>(null);
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [currentPage, setCurrentPage] = useState(1);

    const tenantBrands = useMemo(() => {
        const list = brands.filter((b) => b.tenant_id === activeTenantId);
        if (!search) return list;
        return list.filter((b) =>
            b.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [brands, activeTenantId, search]);

    const totalPages = Math.ceil(tenantBrands.length / ITEMS_PER_PAGE);
    const paginatedBrands = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return tenantBrands.slice(start, start + ITEMS_PER_PAGE);
    }, [tenantBrands, currentPage]);

    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleAddBrand = () => {
        if (!newBrandName.trim() || !activeTenantId) return;
        const newBr: ProductBrand = {
            id: `brand-${Date.now()}`,
            tenant_id: activeTenantId,
            name: newBrandName.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        addBrand(newBr);
        setNewBrandName("");
        setIsAddingNew(false);
    };

    const handleStartEdit = (brand: ProductBrand) => {
        setEditingId(brand.id);
        setEditingName(brand.name);
    };

    const handleSaveEdit = () => {
        if (!editingId || !editingName.trim()) return;
        updateBrand(editingId, { name: editingName.trim() });
        setEditingId(null);
        setEditingName("");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header with Stats */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                            Brands
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage product brands for your store
                        </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800/50 rounded-full">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {tenantBrands.length}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            total
                        </span>
                    </div>
                </div>
                <Button
                    className="gap-2 rounded-xl bg-brand-600 hover:bg-brand-700"
                    onClick={() => setIsAddingNew(true)}
                >
                    <Plus className="h-4 w-4" />
                    Add Brand
                </Button>
            </div>

            {/* Search & View Toggle */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search brands..."
                        className="h-10 pl-9 rounded-xl border-gray-200 dark:border-gray-800"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <button
                        onClick={() => setViewMode("table")}
                        className={`p-2 rounded-lg transition-colors ${viewMode === "table"
                            ? "bg-white dark:bg-gray-700 shadow-sm text-brand-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <List className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-colors ${viewMode === "grid"
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
                                <Package className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                            </div>
                            <div className="flex-1">
                                <Input
                                    autoFocus
                                    placeholder="Enter brand name..."
                                    className="h-10 border-brand-200 dark:border-brand-800"
                                    value={newBrandName}
                                    onChange={(e) => setNewBrandName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddBrand()}
                                />
                            </div>
                            <Button
                                onClick={handleAddBrand}
                                disabled={!newBrandName.trim()}
                                className="h-10 px-4 bg-brand-600 hover:bg-brand-700"
                            >
                                <Check className="h-4 w-4 mr-1" />
                                Save
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAddingNew(false);
                                    setNewBrandName("");
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
            {tenantBrands.length === 0 && !isAddingNew ? (
                <Card className="rounded-2xl border-gray-200 dark:border-gray-800">
                    <CardContent className="p-8">
                        <EmptyState
                            title="No brands found"
                            description="Start by adding your first product brand"
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
                                        Brand
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
                                {paginatedBrands.map((brand) => (
                                    <TableRow
                                        key={brand.id}
                                        className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]"
                                    >
                                        <TableCell className="px-6 py-4">
                                            {editingId === brand.id ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        autoFocus
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        onKeyDown={(e) =>
                                                            e.key === "Enter" && handleSaveEdit()
                                                        }
                                                        className="h-9 max-w-xs"
                                                    />
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
                                                        <Package className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                                                    </div>
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {brand.name}
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm text-gray-500">
                                            {formatDateTime(brand.createdAt)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-end">
                                            {editingId !== brand.id && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleStartEdit(brand)}
                                                        className="p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setBrandToDelete(brand)}
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
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={tenantBrands.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {paginatedBrands.map((brand) => (
                            <Card
                                key={brand.id}
                                className="rounded-2xl border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow group"
                            >
                                <CardContent className="p-5">
                                    {editingId === brand.id ? (
                                        <div className="space-y-3">
                                            <Input
                                                autoFocus
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" && handleSaveEdit()
                                                }
                                                className="h-10"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleSaveEdit}
                                                    size="sm"
                                                    className="flex-1 bg-brand-600 hover:bg-brand-700"
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    onClick={handleCancelEdit}
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
                                                    <Package className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleStartEdit(brand)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setBrandToDelete(brand)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                {brand.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Added {formatDateTime(brand.createdAt)}
                                            </p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <Card className="rounded-2xl border-gray-200 dark:border-gray-800">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={tenantBrands.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                onPageChange={setCurrentPage}
                            />
                        </Card>
                    )}
                </>
            )}

            <DeleteConfirmationModal
                isOpen={!!brandToDelete}
                onClose={() => setBrandToDelete(null)}
                onConfirm={() => {
                    if (brandToDelete) {
                        removeBrand(brandToDelete.id);
                    }
                }}
                title="Delete Brand"
                message="Are you sure you want to delete this brand?"
                itemName={brandToDelete?.name}
            />
        </div>
    );
}
