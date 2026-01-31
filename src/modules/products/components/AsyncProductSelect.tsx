import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { productsApi, type Product } from "@/modules/products/api/productsApi";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface AsyncProductSelectProps {
  value?: string;
  onSelect: (product: Product) => void;
  placeholder?: string;
}

export function AsyncProductSelect({
  value,
  onSelect,
  placeholder = "Search products...",
}: AsyncProductSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Query for searching products
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["products", "search", debouncedSearch],
    queryFn: () =>
      productsApi.getProducts({
        search: debouncedSearch,
        limit: 20,
      }),
    staleTime: 60000,
  });

  // Query for fetching selected product details (if value exists but not in list)
  const { data: selectedProduct } = useQuery({
    queryKey: ["product", value],
    queryFn: () => productsApi.getProduct(value!),
    enabled: !!value,
    staleTime: Infinity,
  });

  const products = searchResults?.items || [];

  // Display name logic
  const displayName =
    selectedProduct?.name ||
    products.find((p) => p.id === value)?.name ||
    "Select product...";

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? displayName : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search products..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading && (
              <div className="py-6 text-center text-sm text-gray-500">
                Loading...
              </div>
            )}
            {!isLoading && products.length === 0 && (
              <CommandEmpty>No products found.</CommandEmpty>
            )}
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id} // Use ID for unique value to prevent cmdk confusion
                  onSelect={() => {
                    onSelect(product);
                    setOpen(false);
                  }}
                  // Fix: Use onMouseDown to prevent input blur before click registers
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === product.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{product.name}</span>
                    <span className="text-xs text-gray-400">
                      SKU: {product.sku}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
