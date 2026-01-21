/**
 * UI Component Type Definitions
 *
 * Types for shared UI components.
 */

import type { ReactNode } from "react";

/**
 * Common component size variants
 */
export type ComponentSize = "sm" | "md" | "lg";

/**
 * Common component variants
 */
export type ComponentVariant =
    | "default"
    | "primary"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost";

/**
 * Base props for polymorphic components
 */
export interface PolymorphicProps<T extends React.ElementType> {
    as?: T;
    children?: ReactNode;
}

/**
 * Status indicator colors
 */
export type StatusColor =
    | "success"
    | "warning"
    | "error"
    | "info"
    | "default"
    | "primary";

/**
 * Badge props
 */
export interface BadgeProps {
    variant?: StatusColor;
    size?: ComponentSize;
    children: ReactNode;
    className?: string;
}

/**
 * Modal props
 */
export interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

/**
 * Empty state props
 */
export interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

/**
 * Error state props
 */
export interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}
