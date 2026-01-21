/**
 * Shared Module Public API
 *
 * Re-exports domain-agnostic components, utilities, hooks, and types.
 */

// Types
export type {
    AsyncStatus,
    PaginationState,
    PaginatedResult,
    SortDirection,
    SortState,
    FilterState,
    ApiError,
    ApiResponse,
    SelectionState,
    DateRange,
} from "./types/common";

export type {
    ComponentSize,
    ComponentVariant,
    StatusColor,
    BadgeProps,
    ModalProps,
    EmptyStateProps,
    ErrorStateProps,
} from "./types/ui";

// Utils
export { cn } from "./utils/cn";
export {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    getInitials,
    formatNumber,
    truncate,
    capitalize,
    formatPlanName,
    formatRoleName,
    formatStatus,
} from "./utils/format";
export { formatCurrency as formatCurrencyWithSymbol, formatUSD } from "./utils/currency";
export {
    asString,
    asNumber,
    asBoolean,
    asArray,
    getNestedValue,
    generateId,
    toUserMessage,
} from "./utils/normalize";

// Hooks
export { useModal } from "./hooks/useModal";
export { usePermissions } from "./hooks/usePermissions";

// UI Components
export { Button } from "./components/ui/button";
export { Input } from "./components/ui/input";
export { Label } from "./components/ui/label";
export { Textarea } from "./components/ui/textarea";
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/ui/card";
export { Badge } from "./components/ui/badge";
export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "./components/ui/dialog";
export { Modal } from "./components/ui/Modal";
export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
} from "./components/ui/select";
export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
} from "./components/ui/dropdown-menu";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
export { Switch } from "./components/ui/switch";
export { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar";
export { ScrollArea, ScrollBar } from "./components/ui/scroll-area";
export { Separator } from "./components/ui/separator";
export { Icon } from "./components/ui/Icon";
export { Stepper } from "./components/ui/Stepper";

// Feedback Components
export { EmptyState } from "./components/feedback/EmptyState";
export { ErrorState } from "./components/feedback/ErrorState";
export { default as Pagination } from "./components/feedback/Pagination";
export { StatusBadge } from "./components/feedback/StatusBadge";
export { RoleBadge } from "./components/feedback/RoleBadge";
export { default as SearchBar } from "./components/feedback/SearchBar";
export { KpiCard } from "./components/feedback/KpiCard";
export { default as PageBreadcrumb } from "./components/feedback/PageBreadcrumb";
export { InfoSection } from "./components/feedback/InfoSection";
export { DetailPageHeader } from "./components/feedback/DetailPageHeader";
export { default as ComponentCard } from "./components/feedback/ComponentCard";
export { default as DeleteConfirmationModal } from "./components/feedback/DeleteConfirmationModal";
export { default as GridShape } from "./components/feedback/GridShape";

// Skeletons
export { PageSkeleton } from "./components/skeletons/PageSkeleton";
export { TableSkeleton } from "./components/skeletons/TableSkeleton";
export { CardSkeleton } from "./components/skeletons/CardSkeleton";
export { Skeleton } from "./components/skeletons/Skeleton";
