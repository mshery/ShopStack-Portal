import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useProductsScreen } from "../../hooks/useProductsScreen";
import { BoxCubeIcon } from "../../components/ui/Icons";
import EditProductModal from "../../components/tenant/EditProductModal";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import { useCategoriesStore } from "../../stores/categories.store";
import { useBrandsStore } from "../../stores/brands.store";
import { Pencil, Trash2 } from "lucide-react";
import type { Product } from "../../types";
import { useTenantCurrency } from "../../hooks/useTenantCurrency";
import Pagination from "../../components/common/Pagination";

export default function ProductsPage() {
  const { status, vm, actions } = useProductsScreen();
  const { categories } = useCategoriesStore();
  const { brands } = useBrandsStore();
  const { formatPrice } = useTenantCurrency();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Create lookup maps for category and brand names
  const getCategoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) || "Unknown";
  }, [categories]);

  const getBrandName = useMemo(() => {
    const map = new Map(brands.map((b) => [b.id, b.name]));
    return (id: string) => map.get(id) || "Unknown";
  }, [brands]);

  if (status === "error") return <div>Error: Tenant context not found.</div>;

  return (
    <>
      <PageBreadcrumb pageTitle="Products" />

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search products..."
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
              className={`text-sm font-bold ${!vm.canAddMore ? "text-red-500" : "text-gray-700"
                }`}
            >
              {vm.currentCount} / {vm.maxProducts}
            </span>
          </div>

          <Link
            to={vm.canAddMore ? "/tenant/products/new" : "#"}
            className={!vm.canAddMore ? "cursor-not-allowed opacity-50" : ""}
            onClick={(e) => !vm.canAddMore && e.preventDefault()}
          >
            <Button
              variant="primary"
              disabled={!vm.canAddMore}
              title={
                !vm.canAddMore ? "Product limit reached for your plan" : ""
              }
            >
              Add New Product
            </Button>
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
                  Product
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  SKU
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Category
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Stock
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
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
              {vm.products.map((product: Product) => (
                <TableRow
                  key={product.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.01] cursor-pointer"
                >
                  <TableCell className="px-6 py-4">
                    <Link
                      to={`/tenant/products/${product.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BoxCubeIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="block font-medium text-gray-800 dark:text-white/90 text-theme-sm hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                          {product.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getCategoryName(product.categoryId)}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getBrandName(product.brandId)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Link
                      to={`/tenant/products/${product.id}`}
                      className="text-gray-500 dark:text-gray-400 text-theme-sm"
                    >
                      {product.sku}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Link
                      to={`/tenant/products/${product.id}`}
                      className="text-gray-500 dark:text-gray-400 text-theme-sm"
                    >
                      {getCategoryName(product.categoryId)}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Link
                      to={`/tenant/products/${product.id}`}
                      className="text-gray-800 dark:text-white/90 font-medium text-theme-sm"
                    >
                      {formatPrice(product.unitPrice)}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Link
                      to={`/tenant/products/${product.id}`}
                      className="text-gray-500 dark:text-gray-400 text-theme-sm"
                    >
                      {product.currentStock}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Link
                      to={`/tenant/products/${product.id}`}
                      className="inline-block"
                    >
                      <Badge
                        color={
                          product.status === "in_stock"
                            ? "success"
                            : product.status === "low_stock"
                              ? "warning"
                              : "error"
                        }
                        variant="light"
                        size="sm"
                      >
                        {product.status.replace("_", " ")}
                      </Badge>
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                        className="p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                        title="Edit product"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setProductToDelete(product);
                        }}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {vm.isEmpty && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No products found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        currentPage={vm.currentPage}
        totalPages={vm.totalPages}
        totalItems={vm.totalItems}
        itemsPerPage={10}
        onPageChange={actions.setCurrentPage}
      />

      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={() => {
          if (productToDelete) {
            actions.deleteProduct(productToDelete.id);
          }
        }}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        itemName={productToDelete?.name}
      />
    </>
  );
}
