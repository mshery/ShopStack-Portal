/**
 * Normalization utilities for safe data handling.
 * These functions ensure data is always in expected format.
 *
 * RULE: Normalize once at the boundary, downstream code should not need defensive checks.
 */

/**
 * Safely convert unknown value to string with fallback
 */
export function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

/**
 * Safely convert unknown value to number with fallback
 */
export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

/**
 * Safely convert unknown value to boolean with fallback
 */
export function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

/**
 * Safely convert unknown value to array with fallback
 * Arrays are NEVER optional per coding rules
 */
export function asArray<T>(value: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(value)) return value as T[];
  return fallback;
}

/**
 * Safely get nested property with fallback
 */
export function getNestedValue<T>(obj: unknown, path: string, fallback: T): T {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return fallback;
    if (typeof current !== "object") return fallback;
    current = (current as Record<string, unknown>)[key];
  }

  return (current as T) ?? fallback;
}

/**
 * Generate a unique ID (simple implementation for mock data)
 */
export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a normalized user-friendly error message
 */
export function toUserMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong. Please try again.";
}
